export interface GetShowtimeListInputDto {
    cinemaId: string;
    page: number;
    fetch: number;
}

export interface CreateShowtimeInputDto {
    movieId: string;
    screenId: string;
    movieDistributionId: string;
    startTime: string;
    endTime: string;
}