export interface UpdateCustomerProfileInputDto {
    name?: string;
    phoneNumber?: string;
    gender?: string;
    dateOfBirth?: string | null;
    emailAddress?: string;
    address?: string;
}