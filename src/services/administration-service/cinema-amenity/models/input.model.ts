export interface GetCinemaAmenityListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
}

export interface CreateCinemaAmenityInputDto {
    name: string;
    description?: string;
    amenityTypeId: string;
    status: string;
}

export interface UpdateCinemaAmenityInputDto {
    name: string;
    description?: string;
    amenityTypeId: string;
    status: string;
}
