import { CustomerAddressJson, CustomerGender } from "./input.model";

export interface CustomerProfileOutputDto {
    id: string;
    name: string;
    phoneNumber?: string;
    gender?: CustomerGender;
    dateOfBirth?: string;
    emailAddress?: string;
    address?: string;
    profileQRUrl?: string;
}

export interface CustomerProfileViewModel extends CustomerProfileOutputDto {
    parsedAddress?: CustomerAddressJson | null;
}