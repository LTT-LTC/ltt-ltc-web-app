export interface GetShowtimeListInputDto {
    cinemaId: string;
    page: number;
    fetch: number;
}

export interface CreateShowtimeDto {
    movieId: string;
    screenId: string;
    movieDistributionId: string;
    startTime: string;
    endTime: string;
}

export interface ShowtimeOutputDto {
    id: string;
    movieId: string;
    cinemaId?: string;
    date?: string;
    format?: string;
    showDate?: string;
    basePrice?: number;
    distributionId?: string;
    status?: string;
    movieTitle?: string;
    cinemaName?: string;
    screenId: string;
    screenName?: string;
    startTime: string;
    endTime: string;
}
