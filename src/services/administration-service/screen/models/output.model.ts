export interface ScreenOutputDto {
    id: string;
    cinemaId: string;
    screenNumber: number;
    screenType?: string;
    seatLayout?: string;
    seatCount: number;
    status?: string;
}
