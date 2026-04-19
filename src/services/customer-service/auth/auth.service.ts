import http from "@/src/@core/http";
import { CustomerLoginInputDto, CustomerLogoutInputDto, CustomerRefreshLoginInputDto, CustomerRequestPasswordRecoveryInputDto, CustomerResetPasswordInputDto, CustomerRegisterInputDto } from "./models/input.model";
import { CustomerLoginOutputDto } from "./models/output.model";
import { rootCustomerPath } from "../customer.service";

const path = "/auth";

const loginAsync = async (body: CustomerLoginInputDto) => {
    const { data } = await http.post<CustomerLoginOutputDto>(`${rootCustomerPath}${path}`, body);
    return data;
}

const registerAsync = async (body: CustomerRegisterInputDto) => {
    const { data } = await http.post<CustomerLoginOutputDto>(`${rootCustomerPath}${path}/register`, body);
    return data;
}

const refreshTokenAsync = async (body: CustomerRefreshLoginInputDto) => {
    const payload: CustomerRefreshLoginInputDto = {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
    };
    const { data } = await http.post<CustomerLoginOutputDto>(`${rootCustomerPath}${path}/refresh-login`, payload);
    return data;
}

const logOutAsync = async (body?: CustomerLogoutInputDto) => {
    const { data } = await http.post<boolean>(`${rootCustomerPath}${path}/logout`, body);
    return data;
}

const requestPasswordRecovery = async (body: CustomerRequestPasswordRecoveryInputDto) => {
    const { data } = await http.post<boolean>(`${rootCustomerPath}${path}/request-password-recovery`, body);
    return data;
}

const resetPassword = async (body: CustomerResetPasswordInputDto) => {
    const { data } = await http.post<boolean>(`${rootCustomerPath}${path}/reset-password`, body);
    return data;
}

export const customerAuthService = {
    loginAsync,
    registerAsync,
    refreshTokenAsync,
    logOutAsync,
    requestPasswordRecovery,
    resetPassword,
}