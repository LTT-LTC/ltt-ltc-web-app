export interface GetScreenListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
    status?: string;
}

export interface CreateScreenInputDto {
    screenNumber: number;
    screenType?: string;
    seatCount: number;
    seatLayout?: string;
    status?: string;
}

export interface UpdateScreenInputDto {
    screenNumber: number;
    screenType?: string;
    seatCount: number;
    seatLayout?: string;
    status?: string;
}

export interface CreateSeatLayoutDto {
    screenId: string;
    name: string;
    layout: any;
}

export interface UpdateSeatLayoutDto {
    name?: string;
    layout?: any;
}