import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  HttpStatusCode,
  InternalAxiosRequestConfig,
} from "axios";
import { getCookie, removeCookie, setCookie } from "../utils/cookie";
import {
  ACCESS_TOKEN_KEY,
  AUTHORIZATION_KEY,
  LANGUAGE_KEY,
  REFRESH_TOKEN_KEY,
  TENANT_KEY,
  TOKEN_TYPE_KEY,
} from "../const";
import { RefreshLoginInputDto } from "@/src/services/administration-service/auth/models/input.model";
import { administrationService } from "@/src/services/administration-service/administration.service";
import { customerService } from "@/src/services/customer-service/customer.service";
import qs from "qs";
import { translate } from "../utils/localization";

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;
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

function isObjectLike(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function isApiEnvelope(value: unknown): value is { data: any } {
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

function extractErrorMessage(payload: any): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  const directMessage =
    payload?.message ||
    payload?.error?.message ||
    payload?.error_description ||
    payload?.title;

  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage;
  }

  return translate("http.unknown_error", "Lỗi không xác định, vui lòng liên hệ quản trị viên.");
}

function normalizeHttpError(payload: any, fallbackMessage?: string) {
  const message = fallbackMessage || extractErrorMessage(payload);
  if (!isObjectLike(payload)) {
    return { message };
  }

  return {
    ...(payload as Record<string, any>),
    message,
    error: (payload as Record<string, any>).error,
  };
}

// Xử lý refresh token
async function refreshTokenAsync(url?: string) {
  const isCustomerRequest = url?.includes("/customer-service/");
  const refreshToken = getCookie(REFRESH_TOKEN_KEY) ?? "";
  const accessToken = getCookie(ACCESS_TOKEN_KEY) ?? "";

  if (!refreshToken) {
    const missingTokenError = new Error("Missing refresh token");
    http.defaults.headers.common[AUTHORIZATION_KEY] = "";
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true;
      window.location.href = isCustomerRequest ? `/customer-login` : `/administration-login`;
    }
    throw missingTokenError;
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
  } catch (error: any) {
    http.defaults.headers.common[AUTHORIZATION_KEY] = "";
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true;
      window.location.href = isCustomerRequest ? `/customer-login` : `/administration-login`;
    }
    throw error;
  }
}

// Xử lý request trước khi gửi đi
const onRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  const accessToken = getCookie(ACCESS_TOKEN_KEY);
  const selectedLanguage = localStorage.getItem(LANGUAGE_KEY) ?? "vi";

  let tenantId = localStorage.getItem(TENANT_KEY);
  if (!tenantId && process.env.NEXT_PUBLIC_TENANTS) {
    try {
      const parsedTenants = JSON.parse(process.env.NEXT_PUBLIC_TENANTS);
      if (Array.isArray(parsedTenants) && parsedTenants.length > 0) {
        tenantId = parsedTenants[0].value;
      }
    } catch (e) {
      console.warn("Failed to parse NEXT_PUBLIC_TENANTS", e);
    }
  }

  const normalizedTenantId = tenantId?.trim();
  if (normalizedTenantId) {
    config.headers[TENANT_KEY] = normalizedTenantId;
  } else {
    delete config.headers[TENANT_KEY];
  }
  config.headers["Accept-Language"] = selectedLanguage;

  // Refresh endpoint should only rely on refresh-token payload, not an expired bearer token.
  if (isRefreshLoginRequest(config.url)) {
    delete config.headers[AUTHORIZATION_KEY];
  }

  if (accessToken) {
    config.headers[AUTHORIZATION_KEY] = `${TOKEN_TYPE_KEY} ${accessToken}`;
  }
  if (config.params) {
    config.paramsSerializer = {
      serialize: (params: Record<string, any>) =>
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

  // 401 => Unauthorized, token hết hạn hoặc không hợp lệ => refresh token
  if (error.response && error.response.status === HttpStatusCode.Unauthorized) {
    const requestConfig = error.config as RetryableRequestConfig | undefined;
    const requestUrl = requestConfig?.url;

    if (!requestConfig || requestConfig._retry || requestConfig._skipAuthRefresh || isAuthRefreshExcludedRequest(requestUrl)) {
      return Promise.reject(normalizeHttpError(error.response?.data));
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokenAsync(requestUrl);
    }

    if (refreshPromise) {
      let newToken: any;
      try {
        newToken = await refreshPromise;
      } finally {
        refreshPromise = null;
        isRefreshing = false;
      }

      if (!newToken?.accessToken || !newToken?.refreshToken) {
        return Promise.reject(normalizeHttpError(error.response?.data));
      }

      http.defaults.headers.common[AUTHORIZATION_KEY] =
        `${TOKEN_TYPE_KEY} ${newToken.accessToken}`;
      setCookie(ACCESS_TOKEN_KEY, newToken.accessToken);
      setCookie(REFRESH_TOKEN_KEY, newToken.refreshToken);

      requestConfig._retry = true;
      requestConfig.headers = requestConfig.headers ?? {};
      requestConfig.headers[AUTHORIZATION_KEY] = `${TOKEN_TYPE_KEY} ${newToken.accessToken}`;
      return http(requestConfig);
    }
  }

  const _response = error.response?.data as any;
  // 400 => Bad Request, lỗi từ phía client => hiển thị thông báo lỗi
  if (error.response && error.response.status === HttpStatusCode.BadRequest) {
    return Promise.reject(normalizeHttpError(_response));
  }

  // 403 => Forbidden, không có quyền truy cập => chuyển hướng đến trang 403
  if (error.response && error.response.status === HttpStatusCode.Forbidden) {
    const isAuthRequest = error.config?.url?.includes("/auth");
    if (!isAuthRequest) {
      window.location.href = `/403`;
    }
    return Promise.reject(normalizeHttpError(_response));
  }

  // 404 => Not Found, không tìm thấy tài nguyên => chuyển hướng đến trang 404
  // if (error.response && error.response.status === HttpStatusCode.NotFound) {
  //   window.location.href = `/404`;
  //   return Promise.reject(error.response.data);
  // }

  // 500 => Internal Server Error, lỗi từ phía server => chuyển hướng đến trang 500
  if (
    error.response &&
    error.response.status === HttpStatusCode.InternalServerError
  ) {
    return Promise.reject(normalizeHttpError(_response));
  }

  // 503 => Service Unavailable, dịch vụ tạm thời không khả dụng
  if (
    error.response &&
    error.response.status === 503
  ) {
    return Promise.reject(normalizeHttpError(_response, translate("http.service_unavailable", "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.")));
  }

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
