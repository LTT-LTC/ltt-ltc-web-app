export interface GetRoleListInputDto {
    page?: number;
    fetch?: number;
    orderBy?: string;
    isSortDesc?: boolean;
    keyword?: string;
}

export interface CreateRoleInputDto { name: string; }
export interface UpdateRoleInputDto { name: string; }
