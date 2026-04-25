import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export interface EmployeeOutputDto {
    id: string;
    userId?: string | null;
    avatarUrl?: string;
    avatarFileId?: string | null;
    name: string;
    email: string;
    otherEmail?: string;
    phoneNumber?: string;
    code: string;
    hireDate?: string;
    cinemaId?: string | null;
    cinemaName?: string | null;
    positionName?: string | null;
    // Backward compatibility
    organizationUnitId?: string | null;
    organizationUnitName?: string | null;
    role?: "Admin" | "Manager" | "Staff" | "POS" | string;
    isActive?: boolean | null;
}

export interface PagedResultEmployeeOutputDto extends PagedResultDto<EmployeeOutputDto> {
    extendData: Record<string, any>;
}
