import http from "@/src/@core/http";
import { CustomerLoginInputDto, CustomerLogoutInputDto, CustomerRefreshLoginInputDto, CustomerRequestPasswordRecoveryInputDto, CustomerResetPasswordInputDto, CustomerRegisterInputDto } from "./models/input.model";
import { CustomerLoginOutputDto } from "./models/output.model";
import { rootCustomerPath } from "../customer.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

const path = "/auth";

const loginAsync = async (body: CustomerLoginInputDto) => {
    const { data } = await http.post<ApiResult<CustomerLoginOutputDto>>(`${rootCustomerPath}${path}`, body);
    return data.data;
}

const registerAsync = async (body: CustomerRegisterInputDto) => {
    const { data } = await http.post<ApiResult<CustomerLoginOutputDto>>(`${rootCustomerPath}${path}/register`, body);
    return data.data;
}

const refreshTokenAsync = async (body: CustomerRefreshLoginInputDto) => {
    const { data } = await http.post<ApiResult<CustomerLoginOutputDto>>(`${rootCustomerPath}${path}/refresh-login`, body);
    return data.data;
}

const logOutAsync = async (body?: CustomerLogoutInputDto) => {
    const { data } = await http.post<ApiResult<boolean>>(`${rootCustomerPath}${path}/logout`, body);
    return data.data;
}

const requestPasswordRecovery = async (body: CustomerRequestPasswordRecoveryInputDto) => {
    const { data } = await http.post<ApiResult<boolean>>(`${rootCustomerPath}${path}/request-password-recovery`, body);
    return data.data;
}

const resetPassword = async (body: CustomerResetPasswordInputDto) => {
    const { data } = await http.post<ApiResult<boolean>>(`${rootCustomerPath}${path}/reset-password`, body);
    return data.data;
}

export const customerAuthService = {
    loginAsync,
    registerAsync,
    refreshTokenAsync,
    logOutAsync,
    requestPasswordRecovery,
    resetPassword,
}