export interface CustomerShowtimeOutputDto {
    id: string;
    cinemaId: string;
    movieId: string;
    screenId: string;
    startTime: string;
    endTime: string;
    ticketPrice: number;
    formatId: string;
    status?: string;
    movieTitle?: string;
    originalTitle?: string;
    movieFormat?: string;
    screenName?: string;
    posterUrl?: string;
    durationMins?: number;
    ratingCode?: string;
}
