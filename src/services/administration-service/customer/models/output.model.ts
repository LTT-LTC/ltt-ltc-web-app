export interface CustomerOutputDto {
    id: string;
    name: string;
    phoneNumber?: string;
    gender: string;
    dateOfBirth?: string;
    emailAddress: string;
    profileQRUrl?: string;
    address?: string;
    emailVerified?: string;
    isLocked?: boolean;
}