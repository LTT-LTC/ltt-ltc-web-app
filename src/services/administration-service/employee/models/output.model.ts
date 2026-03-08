import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export interface EmployeeOutputDto {
    id: string;
    avatarUrl: string;
    avatarFileId?: string | null;
    name: string;
    email: string;
    otherEmail: string;
    phoneNumber: string;
    dateOfBirth: string;
    code: string;
    joinedDate: string;
    positionId?: string | null;
    positionName?: string | null;
    organizationUnitId?: string | null;
    organizationUnitName?: string | null;
    isActive?: boolean | null;
}

export interface PagedResultEmployeeOutputDto extends PagedResultDto<EmployeeOutputDto> {
    extendData: Record<string, any>;
}
