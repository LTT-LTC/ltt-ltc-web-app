export interface CustomerOutputDto {
    id: string;
    name: string;
    phoneNumber?: string;
    gender: string;
    dateOfBirth?: string;
    emailAddress: string;
    memberCode?: string;
    address?: string;
    emailVerified?: string;
    isLocked?: boolean;
}