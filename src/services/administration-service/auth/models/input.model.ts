
export interface LoginInputDto {
    username: string;
    password: string;
}

export interface RefreshLoginInputDto {
    accessToken: string;
    refreshToken: string;
}

export interface LogoutInputDto { }

export interface RequestPasswordRecoveryInputDto {
    userName: string;
    tenantName?: string;
}

export interface ResetPasswordInputDto {
    token: string;
    password: string;
}