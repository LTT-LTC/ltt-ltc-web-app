export type CustomerGender = "Male" | "Female" | "Other";

export interface CustomerAddressJson {
    provinceCity: string;
    wardCommune: string;
    hamletRoad?: string;
}

export interface UpdateCustomerProfileInputDto {
    name?: string;
    phoneNumber?: string;
    gender?: CustomerGender;
    dateOfBirth?: string | null;
    emailAddress?: string;
    address?: string;
}