export interface GetStudioListInputDto {
    page?: number;
    fetch?: number;
    orderBy?: string;
    isSortDesc?: boolean;
    keyword?: string;
}

export interface CreateStudioInputDto { name: string; }
export interface UpdateStudioInputDto { name: string; }
