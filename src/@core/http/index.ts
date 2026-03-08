import axios, {
  AxiosError,
  AxiosInstance,
  HttpStatusCode,
  InternalAxiosRequestConfig,
} from "axios";
import { getCookie, removeCookie, setCookie } from "../utils/cookie";
import {
  ACCESS_TOKEN_KEY,
  AUTHORIZATION_KEY,
  REFRESH_TOKEN_KEY,
  TENANT_KEY,
  TOKEN_TYPE_KEY,
} from "../const";
import { RefreshLoginInputDto } from "@/src/services/administration-service/auth/models/input.model";
import { administrationService } from "@/src/services/administration-service/administration.service";
import qs from "qs";
import { showNotificationError } from "../utils/message";

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Xử lý refresh token
async function refreshTokenAsync() {
  const requestLogin: RefreshLoginInputDto = {
    refreshToken: getCookie(REFRESH_TOKEN_KEY) ?? "",
    accessToken: getCookie(ACCESS_TOKEN_KEY) ?? "",
  };
  try {
    const response =
      await administrationService.authService.refreshTokenAsync(requestLogin);
    return response;
  } catch (error: any) {
    if (error.statusCode === HttpStatusCode.Unauthorized) {
      http.defaults.headers.common[AUTHORIZATION_KEY] = "";
      removeCookie(ACCESS_TOKEN_KEY);
      removeCookie(REFRESH_TOKEN_KEY);
      window.location.href = `/signin`;
    }
  }
}

// Xử lý request trước khi gửi đi
const onRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  const accessToken = getCookie(ACCESS_TOKEN_KEY);
  config.headers[TENANT_KEY] = localStorage.getItem(TENANT_KEY) ?? "";

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
    showNotificationError("Lỗi kết nối đến máy chủ, vui lòng thử lại sau.");
    return Promise.reject({});
  }

  // 401 => Unauthorized, token hết hạn hoặc không hợp lệ => refresh token
  if (error.response && error.response.status === HttpStatusCode.Unauthorized) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokenAsync();
    }
    if (refreshPromise) {
      const newToken = await refreshPromise;
      refreshPromise = null;
      isRefreshing = false;

      http.defaults.headers.common[AUTHORIZATION_KEY] =
        `${TOKEN_TYPE_KEY} ${newToken.accessToken}`;
      setCookie(ACCESS_TOKEN_KEY, newToken.accessToken);
      setCookie(REFRESH_TOKEN_KEY, newToken.refreshToken);

      return http(error.config as InternalAxiosRequestConfig);
    }
  }

  const _response = error.response?.data as any;
  // 400 => Bad Request, lỗi từ phía client => hiển thị thông báo lỗi
  if (error.response && error.response.status === HttpStatusCode.BadRequest) {
    showNotificationError(
      `${_response?.error.message ?? "Lỗi không xác định, vui lòng liên hệ quản trị viên."}`,
    );
    return Promise.reject(error.response.data);
  }

  // 403 => Forbidden, không có quyền truy cập => chuyển hướng đến trang 403
  if (error.response && error.response.status === HttpStatusCode.Forbidden) {
    window.location.href = `/403`;
    return Promise.reject(error.response.data);
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
    window.location.href = `/500`;
    return Promise.reject(error.response.data);
  }

  // Hiển thị thông báo lỗi cho các lỗi khác
  showNotificationError(
    `${_response?.error.message ?? "Lỗi không xác định, vui lòng liên hệ quản trị viên."}`,
  );
  return Promise.reject(_response);
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
  http.interceptors.response.use((response) => response, onResponseInterceptor);
};

handleInterceptor(http);

export default http;
