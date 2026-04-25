import http from "@/src/@core/http";
import { LoginInputDto, LogoutInputDto, RefreshLoginInputDto, RequestPasswordRecoveryInputDto, ResetPasswordInputDto } from "./models/input.model";
import { LoginOutputDto } from "./models/output.model";
import { rootPath } from "../administration.service";
import { TENANT_KEY } from "@/src/@core/const";

const path = "/auth";

const loginAsync = async (body: LoginInputDto) => {
    const { data } = await http.post<LoginOutputDto>(`${rootPath}${path}`, body);
    return data;
}

const refreshTokenAsync = async (body: RefreshLoginInputDto) => {
    const payload: RefreshLoginInputDto = {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
    };
    const { data } = await http.post<LoginOutputDto>(`${rootPath}${path}/refresh-login`, payload);
    return data;
}

const logOutAsync = async (body: LogoutInputDto) => {
    const { data } = await http.post<boolean>(`${rootPath}${path}/logout`, body);
    return data;
}

const requestPasswordRecoveryAsync = async (body: RequestPasswordRecoveryInputDto) => {
    const payload = {
        ...body,
        tenantName: body.tenantName || localStorage.getItem(TENANT_KEY) || "",
    };
    const { data } = await http.post<boolean>(`${rootPath}${path}/request-password-recovery`, payload);
    return data;
}

const resetPasswordAsync = async (body: ResetPasswordInputDto) => {
    const { data } = await http.post<boolean>(`${rootPath}${path}/reset-password`, body);
    return data;
}

export const authService = {
    loginAsync,
    refreshTokenAsync,
    logOutAsync,
    requestPasswordRecoveryAsync,
    resetPasswordAsync,
}