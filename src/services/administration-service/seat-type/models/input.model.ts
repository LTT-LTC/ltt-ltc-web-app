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
    /** #RRGGBB hex for seat map display */
    seatColor?: string;
}

export interface UpdateSeatTypeInputDto {
    name: string;
    description?: string;
    numberOfSeat: number;
    displayDirection?: string;
    priceMultiplier: number;
    seatColor?: string;
}
