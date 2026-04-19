export interface CustomerLoginInputDto {
    identifier: string;
    password: string;
}

export interface CustomerRefreshLoginInputDto {
    accessToken: string;
    refreshToken: string;
}

export interface CustomerLogoutInputDto { }

export interface CustomerRequestPasswordRecoveryInputDto {
    emailAddress: string;
}

export interface CustomerResetPasswordInputDto {
    token: string;
    password: string;
}

export interface CustomerRegisterInputDto {
    name: string;
    phoneNumber?: string;
    emailAddress: string;
    password: string;
    gender?: string;
    dateOfBirth?: string;
}
