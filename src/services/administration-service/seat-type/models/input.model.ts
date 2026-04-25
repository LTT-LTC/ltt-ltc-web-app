export interface GetSeatTypeListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
}

export interface CreateSeatTypeInputDto {
    name: string;
    description?: string;
    numberOfSeat: number;
    displayDirection?: string;
    priceMultiplier: number;
}

export interface UpdateSeatTypeInputDto {
    name: string;
    description?: string;
    numberOfSeat: number;
    displayDirection?: string;
    priceMultiplier: number;
}
