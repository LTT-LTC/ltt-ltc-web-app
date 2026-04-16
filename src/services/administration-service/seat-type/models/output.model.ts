export interface SeatTypeOutputDto {
    id: string;
    name: string;
    description?: string;
    numberOfSeat: number;
    displayDirection?: string;
    priceMultiplier: number;
    updatedAt?: string;
}
