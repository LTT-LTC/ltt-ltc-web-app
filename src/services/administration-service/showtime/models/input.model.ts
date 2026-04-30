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
    distributionId: string;
    movieFormat?: string;
    showDate: string;
    startTime: string;
    endTime: string;
    duration?: number;
    basePrice: number;
    status?: string;
}