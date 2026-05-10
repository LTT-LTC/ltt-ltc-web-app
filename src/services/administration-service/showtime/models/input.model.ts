export interface GetShowtimeListInputDto {
    movieId: string;
    cinemaId: string;
    page: number;
    fetch: number;
}

export interface CreateShowtimeInputDto {
    movieId: string;
    cinemaId: string;
    screenId: string;
    /** JSON snapshot from the selected screen (required for booking when backend does not fall back to seat map). */
    seatLayout?: string;
    distributionId: string;
    movieFormat?: string;
    showDate: string;
    startTime: string;
    endTime: string;
    duration?: number;
    basePrice: number;
    status?: string;
}