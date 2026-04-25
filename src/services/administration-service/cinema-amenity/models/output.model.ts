export interface CinemaAmenityOutputDto {
    id: string;
    cinemaId: string;
    amenityTypeId: string;
    productId?: string;
    name: string;
    description?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}
