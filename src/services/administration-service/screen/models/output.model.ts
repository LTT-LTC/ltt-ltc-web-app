export interface ScreenOutputDto {
    id: string;
    cinemaId: string;
    screenNumber: number;
    screenType?: string;
    seatMapId?: string;
    seatMapName?: string;
    seatMapDescription?: string;
    seatLayout?: string;
    seatCount: number;
    status?: string;
}

export interface SeatLayoutDto {
    id: string;
    screenId: string;
    name: string;
    layout: any; // Replace with a more specific type if available
    createdAt: string;
    updatedAt: string;
}