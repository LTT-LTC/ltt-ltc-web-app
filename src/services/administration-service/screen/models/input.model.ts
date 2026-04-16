export interface GetScreenListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
    status?: string;
}

export interface CreateScreenInputDto {
    screenNumber: number;
    screenType?: string;
    seatLayout?: string;
    seatCount: number;
    status?: string;
}

export interface UpdateScreenInputDto {
    screenNumber: number;
    screenType?: string;
    seatLayout?: string;
    seatCount: number;
    status?: string;
}
