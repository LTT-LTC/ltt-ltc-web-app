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
    dateOfBirth?: string;
    code?: string;
    joinedDate?: string;
    positionId?: string | null;
    organizationUnitId?: string | null;
    isActive?: boolean;
}

export interface CreateEmployeeInputDto {
    avatarFile?: File | null;
    name: string;
    email: string;
    otherEmail?: string;
    phoneNumber: string;
    dateOfBirth: string;
    code: string;
    joinedDate: string;
    positionId?: string | null;
    organizationUnitId?: string | null;
}
