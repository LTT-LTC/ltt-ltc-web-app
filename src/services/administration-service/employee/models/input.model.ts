import { PaginationWithSearchRequestDto } from "@/src/@core/http/models/PaginationWithSearchRequestDto";

export interface GetListEmployeeInputDto extends PaginationWithSearchRequestDto {
    isActive?: boolean;
    cinemaId?: string;
}

export interface UpdateEmployeeInputDto {
    avatarFile?: File | null;
    name?: string;
    email?: string;
    otherEmail?: string;
    phoneNumber?: string;
    code?: string;
    hireDate?: string;
    cinemaId?: string | null;
    isActive?: boolean;
    role?: "Admin" | "Manager" | "Staff" | "POS";
}

export interface CreateEmployeeInputDto {
    avatarFile?: File | null;
    name: string;
    email: string;
    otherEmail?: string;
    phoneNumber: string;
    code: string;
    hireDate?: string;
    cinemaId?: string | null;
    role: "Admin" | "Manager" | "Staff" | "POS";
}
