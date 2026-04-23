import http from "@/src/@core/http";
import { LoginInputDto, LogoutInputDto, RefreshLoginInputDto, RequestPasswordRecoveryInputDto, ResetPasswordInputDto } from "./models/input.model";
import { LoginOutputDto } from "./models/output.model";
import { authRootPath } from "../administration.service";
import { TENANT_KEY } from "@/src/@core/const";

const path = "/auth";

const loginAsync = async (body: LoginInputDto) => {
    const { data } = await http.post<LoginOutputDto>(`${authRootPath}${path}`, body);
    return data;
}

const refreshTokenAsync = async (body: RefreshLoginInputDto) => {
    const payload: RefreshLoginInputDto = {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
    };
    const { data } = await http.post<LoginOutputDto>(`${authRootPath}${path}/refresh-login`, payload);
    return data;
}

const logOutAsync = async (body: LogoutInputDto) => {
    const { data } = await http.post<boolean>(`${authRootPath}${path}/logout`, body);
    return data;
}

const requestPasswordRecoveryAsync = async (body: RequestPasswordRecoveryInputDto) => {
    const payload = {
        ...body,
        tenantName: body.tenantName || localStorage.getItem(TENANT_KEY) || "",
    };
    const { data } = await http.post<boolean>(`${authRootPath}${path}/request-password-recovery`, payload);
    return data;
}

const resetPasswordAsync = async (body: ResetPasswordInputDto) => {
    const { data } = await http.post<boolean>(`${authRootPath}${path}/reset-password`, body);
    return data;
}

export const authService = {
    loginAsync,
    refreshTokenAsync,
    logOutAsync,
    requestPasswordRecoveryAsync,
    resetPasswordAsync,
}