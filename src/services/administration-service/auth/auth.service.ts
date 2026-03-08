import http from "@/src/@core/http";
import { LoginInputDto, LogoutInputDto, RefreshLoginInputDto, RequestPasswordRecoveryInputDto, ResetPasswordInputDto } from "./models/input.model";
import { LoginOutputDto } from "./models/output.model";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { TENANT_KEY } from "@/src/@core/const";

const path = "/auth";

const loginAsync = async (body: LoginInputDto) => {
    const { data } = await http.post<ApiResult<LoginOutputDto>>(`${rootPath}${path}`, body);

    return data.data;
}

const refreshTokenAsync = async (body: RefreshLoginInputDto) => {
    const { data } = await http.post<ApiResult<LoginOutputDto>>(`${rootPath}${path}/refresh-login`, body);
    return data.data;
}

const logOutAsync = async (body: LogoutInputDto) => {
    const { data } = await http.post<ApiResult<boolean>>(`${rootPath}${path}/logout`, body);
    return data.data;
}

const requestPasswordRecovery = async (body: RequestPasswordRecoveryInputDto) => {
    const payload = {
        ...body,
        tenantName: body.tenantName || localStorage.getItem(TENANT_KEY) || "",
    };
    const { data } = await http.post<ApiResult<boolean>>(`${rootPath}${path}/request-password-recovery`, payload);
    return data.data;
}

const resetPassword = async (body: ResetPasswordInputDto) => {
    const { data } = await http.post<ApiResult<boolean>>(`${rootPath}${path}/reset-password`, body);
    return data.data;
}

export const authService = {
    loginAsync,
    refreshTokenAsync,
    logOutAsync,
    requestPasswordRecovery,
    resetPassword,
}