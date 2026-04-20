export interface GetFormatListInputDto {
    page?: number;
    fetch?: number;
    orderBy?: string;
    isSortDesc?: boolean;
    keyword?: string;
}

export interface CreateFormatInputDto { name: string; }
export interface UpdateFormatInputDto { name: string; }
