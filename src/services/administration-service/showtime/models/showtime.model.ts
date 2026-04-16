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
    movieTitle?: string;
    screenId: string;
    screenName?: string;
    startTime: string;
    endTime: string;
}
