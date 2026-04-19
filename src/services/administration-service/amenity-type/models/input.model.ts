export interface GetAmenityTypeListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
}

export interface CreateAmenityTypeInputDto {
    name: string;
    description?: string;
}

export interface UpdateAmenityTypeInputDto {
    name: string;
    description?: string;
}
