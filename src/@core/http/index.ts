import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  HttpStatusCode,
  InternalAxiosRequestConfig,
} from "axios";
import { getCookie, removeCookie, setCookie } from "../utils/cookie";
import {
  ADMIN_ACCESS_TOKEN_KEY,
  ADMIN_REFRESH_TOKEN_KEY,
  AUTHORIZATION_KEY,
  CUSTOMER_ACCESS_TOKEN_KEY,
  CUSTOMER_REFRESH_TOKEN_KEY,
  LANGUAGE_KEY,
  TENANT_KEY,
  TOKEN_TYPE_KEY,
} from "../const";
import { RefreshLoginInputDto } from "@/src/services/administration-service/auth/models/input.model";
import { administrationService } from "@/src/services/administration-service/administration.service";
import { customerService } from "@/src/services/customer-service/customer.service";
import qs from "qs";
import { translate } from "../utils/localization";
import { isAdminAuthPath, isAdminProtectedPath } from "../utils/admin-auth";
import { toast } from "sonner";
import { getDefaultTenant, normalizeTenantForHeader } from "../utils/tenant";

let isRefreshing = false;
let refreshPromise: Promise<unknown> | null = null;
let isRedirectingToLogin = false;

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

const isRefreshLoginRequest = (url?: string) =>
  url?.includes("/auth/refresh-login") ?? false;

const isAuthRefreshExcludedRequest = (url?: string) => {
  if (!url) {
    return false;
  }

  const normalizedUrl = url.toLowerCase();
  return (
    isRefreshLoginRequest(normalizedUrl) ||
    normalizedUrl.includes("/auth/logout") ||
    normalizedUrl.includes("/auth/request-password-recovery") ||
    normalizedUrl.includes("/auth/reset-password") ||
    normalizedUrl.includes("/auth/register") ||
    /\/auth(?:\?|$)/.test(normalizedUrl)
  );
};

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiEnvelope(value: unknown): value is { data: unknown } {
  if (!isObjectLike(value)) {
    return false;
  }

  const hasDataField = Object.prototype.hasOwnProperty.call(value, "data");
  const hasMetaField =
    Object.prototype.hasOwnProperty.call(value, "statusCode") ||
    Object.prototype.hasOwnProperty.call(value, "status") ||
    Object.prototype.hasOwnProperty.call(value, "error") ||
    Object.prototype.hasOwnProperty.call(value, "systemName");

  return hasDataField && hasMetaField;
}

function normalizeResponseData<T>(response: AxiosResponse<T>) {
  const payload = response.data as unknown;

  if (isApiEnvelope(payload)) {
    response.data = payload.data as T;
    return response;
  }

  if (isObjectLike(payload) && !Object.prototype.hasOwnProperty.call(payload, "data")) {
    try {
      Object.defineProperty(payload, "data", {
        value: payload,
        writable: false,
        enumerable: false,
        configurable: true,
      });
    } catch {
      // Ignore defineProperty failures for sealed/frozen payloads.
    }
  }

  return response;
}

function extractErrorMessage(payload: unknown): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  const payloadRecord = isObjectLike(payload)
    ? (payload as Record<string, unknown>)
    : undefined;
  const payloadError = isObjectLike(payloadRecord?.error)
    ? (payloadRecord.error as Record<string, unknown>)
    : undefined;

  // Prefer API nested error.message over generic wrapper message
  // (e.g. wrapper "Not Success" vs useful domain message).
  const directMessage =
    payloadError?.message ||
    payloadRecord?.message ||
    payloadRecord?.error_description ||
    payloadRecord?.title;

  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage;
  }

  return translate("http.unknown_error", "Lỗi không xác định, vui lòng liên hệ quản trị viên.");
}

function normalizeHttpError(payload: unknown, fallbackMessage?: string) {
  const message = fallbackMessage || extractErrorMessage(payload);
  if (!isObjectLike(payload)) {
    return { message };
  }

  return {
    ...(payload as Record<string, unknown>),
    message,
    error: (payload as Record<string, unknown>).error,
  };
}

/**
 * Customer-facing app calls `/customer-service/...`.
 * Administration UI also calls `/customer-service/admin/...` (BFF-style paths) with an **administration** token;
 * those must not use customer refresh or redirect to customer login.
 */
function shouldUseCustomerAuthRefresh(failedRequestUrl?: string): boolean {
  const requestUrl = failedRequestUrl ?? "";
  const lower = requestUrl.toLowerCase();
  const isAdminCustomerServiceProxy =
    lower.includes("/customer-service/admin");
  const isCustomerPublicAdministrationEndpoint =
    lower.includes("/administration-service/customer/");

  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (isAdminProtectedPath(pathname) || isAdminAuthPath(pathname)) {
      return false;
    }
    if (
      pathname.startsWith("/employee") ||
      pathname.startsWith("/manager") ||
      pathname.startsWith("/staff") ||
      pathname.startsWith("/pos")
    ) {
      return false;
    }
  }

  if (isAdminCustomerServiceProxy) {
    return false;
  }

  if (isCustomerPublicAdministrationEndpoint) {
    return true;
  }

  // Payment service customer APIs (JWT scoped to current user) must use the customer access token.
  if (lower.includes("/payment-service/customer/")) {
    return true;
  }

  return lower.includes("/customer-service/");
}

function getAuthCookieKeys(isCustomerRequest: boolean) {
  return isCustomerRequest
    ? {
      accessTokenKey: CUSTOMER_ACCESS_TOKEN_KEY,
      refreshTokenKey: CUSTOMER_REFRESH_TOKEN_KEY,
    }
    : {
      accessTokenKey: ADMIN_ACCESS_TOKEN_KEY,
      refreshTokenKey: ADMIN_REFRESH_TOKEN_KEY,
    };
}

function clearAuthCookies(isCustomerRequest: boolean) {
  const { accessTokenKey, refreshTokenKey } = getAuthCookieKeys(isCustomerRequest);
  removeCookie(accessTokenKey);
  removeCookie(refreshTokenKey);
}

function isCustomerRefreshLoginUrl(url?: string): boolean {
  const u = (url ?? "").toLowerCase();
  return u.includes("/customer-service/") && u.includes("refresh-login");
}

function isAdminRefreshLoginUrl(url?: string): boolean {
  const u = (url ?? "").toLowerCase();
  return u.includes("/administration-service/") && u.includes("refresh-login");
}

/**
 * Pick customer vs administration login after session invalidation.
 * Prefer current pathname for admin portal; then refresh-login URL shape; then API URL hints.
 */
function resolveLoginRedirectPath(originalRequestUrl?: string): string {
  const url = (originalRequestUrl ?? "").toLowerCase();

  if (isCustomerRefreshLoginUrl(originalRequestUrl)) {
    return "/customer-login";
  }
  if (isAdminRefreshLoginUrl(originalRequestUrl)) {
    return "/administration-login";
  }

  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (
      isAdminProtectedPath(pathname) ||
      isAdminAuthPath(pathname) ||
      pathname.startsWith("/employee") ||
      pathname.startsWith("/manager") ||
      pathname.startsWith("/staff") ||
      pathname.startsWith("/pos")
    ) {
      return "/administration-login";
    }
    // Logged-in customer area → customer login even if the failing URL classifier is ambiguous.
    if (
      pathname.startsWith("/my-ltc") ||
      pathname.startsWith("/customer-login") ||
      pathname.startsWith("/customer-register")
    ) {
      return "/customer-login";
    }
  }

  if (url.includes("/customer-service/") && !url.includes("/customer-service/admin")) {
    return "/customer-login";
  }
  if (url.includes("/administration-service/")) {
    return "/administration-login";
  }

  return shouldUseCustomerAuthRefresh(originalRequestUrl) ? "/customer-login" : "/administration-login";
}

function clearAuthCookiesForRequestDomain(originalRequestUrl?: string) {
  if (isCustomerRefreshLoginUrl(originalRequestUrl)) {
    clearAuthCookies(true);
    return;
  }
  if (isAdminRefreshLoginUrl(originalRequestUrl)) {
    clearAuthCookies(false);
    return;
  }
  clearAuthCookies(shouldUseCustomerAuthRefresh(originalRequestUrl));
}

function shouldSkipAuthRefresh(failedRequestUrl?: string): boolean {
  const requestUrl = (failedRequestUrl ?? "").toLowerCase();
  const isAdminMovieServiceRequest =
    requestUrl.includes("/movie-service/manager/") ||
    requestUrl.includes("/movie-service/admin/") ||
    requestUrl.includes("/movie-service/staff/");
  const isManagerProductServiceRequest = requestUrl.includes("/product-service/manager/");

  // Public customer-facing data endpoints should never drive auth refresh/logout flow.
  // These endpoints can fail due to throttling (503/429) and must not affect session state.
  // Keep manager/admin protected routes retryable via refresh flow.
  return (
    (requestUrl.includes("/movie-service/") && !isAdminMovieServiceRequest) ||
    (requestUrl.includes("/product-service/") && !isManagerProductServiceRequest) ||
    requestUrl.includes("/administration-service/customer/news-and-offers") ||
    requestUrl.includes("/administration-service/customer/cinema") ||
    requestUrl.includes("/administration-service/customer/showtimes") ||
    requestUrl.includes("/administration-service/customer/screens") ||
    requestUrl.includes("/customer-service/movie")
  );
}

function isSoftLogoutExemptCustomerRequest(failedRequestUrl?: string): boolean {
  const requestUrl = (failedRequestUrl ?? "").toLowerCase();
  return requestUrl.includes("/customer-service/customer/profile");
}

const sessionTimeoutMessage = (): string =>
  translate("http.session_timeout", "Session timeout, please login again.");

/**
 * After clearing tokens, send the user to the correct login route (customer vs administration).
 */
function redirectToLoginAfterSessionInvalid(originalRequestUrl?: string) {
  if (typeof window === "undefined") {
    return;
  }
  if (isRedirectingToLogin) {
    return;
  }
  isRedirectingToLogin = true;

  const redirectPath = resolveLoginRedirectPath(originalRequestUrl);

  toast.error(sessionTimeoutMessage(), { id: "session-expired-redirect" });

  window.location.replace(redirectPath);
}

// Xử lý refresh token
async function refreshTokenAsync(url?: string) {
  const isCustomerRequest = shouldUseCustomerAuthRefresh(url);
  const { accessTokenKey, refreshTokenKey } = getAuthCookieKeys(isCustomerRequest);
  const refreshToken = getCookie(refreshTokenKey) ?? "";
  const accessToken = getCookie(accessTokenKey) ?? "";

  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const requestLogin: RefreshLoginInputDto = {
    refreshToken,
    accessToken,
  };
  try {
    const response = isCustomerRequest
      ? await customerService.authService.refreshTokenAsync(requestLogin)
      : await administrationService.authService.refreshTokenAsync(requestLogin);
    return response;
  } catch (error: unknown) {
    // Do not mutate token storage here.
    // Session cleanup/redirection should be decided by calling context.
    throw error;
  }
}

// Xử lý request trước khi gửi đi
const onRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  const isCustomerRequest = shouldUseCustomerAuthRefresh(config.url);
  const { accessTokenKey } = getAuthCookieKeys(isCustomerRequest);
  const accessToken = getCookie(accessTokenKey);
  const selectedLanguage = localStorage.getItem(LANGUAGE_KEY) ?? "vi";

  const tenantFromLocalStorage = typeof window !== "undefined" ? localStorage.getItem(TENANT_KEY) : null;
  const tenantFromCookie = getCookie(TENANT_KEY);
  const fallbackTenant = getDefaultTenant();
  const normalizedTenantId = normalizeTenantForHeader(
    tenantFromLocalStorage?.trim() || tenantFromCookie?.trim() || fallbackTenant
  );

  if (typeof window !== "undefined") {
    localStorage.setItem(TENANT_KEY, normalizedTenantId);
    setCookie(TENANT_KEY, normalizedTenantId);
  }

  config.headers[TENANT_KEY] = normalizedTenantId;
  config.headers["Accept-Language"] = selectedLanguage;

  // Refresh endpoint should only rely on refresh-token payload, not an expired bearer token.
  if (isRefreshLoginRequest(config.url)) {
    delete config.headers[AUTHORIZATION_KEY];
  }

  if (accessToken) {
    config.headers[AUTHORIZATION_KEY] = `${TOKEN_TYPE_KEY} ${accessToken}`;
  }

  // Let browser/axios set multipart boundary automatically for FormData.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (config.params) {
    config.paramsSerializer = {
      serialize: (params: Record<string, unknown>) =>
        qs.stringify(params, { encode: true }),
    };
  }
  return config;
};

// Xử lý response lỗi sau khi nhận được
const onResponseInterceptor = async (error: AxiosError) => {
  if (error.code == "ERR_NETWORK") {
    return Promise.reject(normalizeHttpError(undefined, translate("http.network_error", "Lỗi kết nối đến máy chủ, vui lòng thử lại sau.")));
  }

  // 401/403 => Unauthorized/Forbidden from expired or invalid session => refresh token
  if (error.response && (error.response.status === HttpStatusCode.Unauthorized || error.response.status === HttpStatusCode.Forbidden)) {
    const requestConfig = error.config as RetryableRequestConfig | undefined;
    const requestUrl = requestConfig?.url;
    const skipAuthRefresh = shouldSkipAuthRefresh(requestUrl);

    // refresh-login itself failed: session cannot be renewed — clear cookies and redirect by auth domain.
    if (
      requestConfig &&
      !requestConfig._retry &&
      !requestConfig._skipAuthRefresh &&
      !skipAuthRefresh &&
      isRefreshLoginRequest(requestUrl)
    ) {
      http.defaults.headers.common[AUTHORIZATION_KEY] = "";
      clearAuthCookiesForRequestDomain(requestUrl);
      redirectToLoginAfterSessionInvalid(requestUrl);
      return Promise.reject(normalizeHttpError(error.response?.data, sessionTimeoutMessage()));
    }

    const isCustomerRequest = shouldUseCustomerAuthRefresh(requestUrl);
    const { accessTokenKey, refreshTokenKey } = getAuthCookieKeys(isCustomerRequest);
    const isSoftAuthFailureRequest = isSoftLogoutExemptCustomerRequest(requestUrl);
    const hasRefreshToken = Boolean(getCookie(refreshTokenKey));
    if (!requestConfig || requestConfig._retry || requestConfig._skipAuthRefresh || isAuthRefreshExcludedRequest(requestUrl) || skipAuthRefresh) {
      return Promise.reject(normalizeHttpError(error.response?.data));
    }

    if (!hasRefreshToken) {
      http.defaults.headers.common[AUTHORIZATION_KEY] = "";
      clearAuthCookiesForRequestDomain(requestUrl);
      redirectToLoginAfterSessionInvalid(requestUrl);
      return Promise.reject(normalizeHttpError(error.response?.data, sessionTimeoutMessage()));
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokenAsync(requestUrl);
    }

    if (refreshPromise) {
      let newToken: unknown;
      try {
        newToken = await refreshPromise;
      } catch (refreshError) {
        const refreshPayload =
          (refreshError as AxiosError)?.response?.data ?? error.response?.data;
        if (!isSoftAuthFailureRequest) {
          http.defaults.headers.common[AUTHORIZATION_KEY] = "";
          clearAuthCookies(isCustomerRequest);
          redirectToLoginAfterSessionInvalid(requestUrl);
          return Promise.reject(normalizeHttpError(refreshPayload, sessionTimeoutMessage()));
        }
        return Promise.reject(normalizeHttpError(refreshPayload));
      } finally {
        refreshPromise = null;
        isRefreshing = false;
      }

      if (!isObjectLike(newToken) || !newToken.accessToken || !newToken.refreshToken) {
        if (!isSoftAuthFailureRequest) {
          http.defaults.headers.common[AUTHORIZATION_KEY] = "";
          clearAuthCookies(isCustomerRequest);
          redirectToLoginAfterSessionInvalid(requestUrl);
        }
        return Promise.reject(normalizeHttpError(error.response?.data, sessionTimeoutMessage()));
      }

      http.defaults.headers.common[AUTHORIZATION_KEY] =
        `${TOKEN_TYPE_KEY} ${String(newToken.accessToken)}`;
      setCookie(accessTokenKey, String(newToken.accessToken));
      setCookie(refreshTokenKey, String(newToken.refreshToken));

      requestConfig._retry = true;
      requestConfig.headers = requestConfig.headers ?? {};
      requestConfig.headers[AUTHORIZATION_KEY] = `${TOKEN_TYPE_KEY} ${String(newToken.accessToken)}`;
      return http(requestConfig);
    }
  }

  const _response = error.response?.data as unknown;
  // For non-401 errors, pass backend message through as-is.
  return Promise.reject(normalizeHttpError(_response));
};

const http = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  timeout: 3 * 60 * 1000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "vi",
    "X-Requested-With": "XMLHttpRequest",
  },
});

const handleInterceptor = (http: AxiosInstance) => {
  http.interceptors.request.use(onRequestInterceptor, (error) =>
    Promise.reject(error),
  );
  http.interceptors.response.use((response) => normalizeResponseData(response), onResponseInterceptor);
};

handleInterceptor(http);

export default http;
