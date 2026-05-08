import type { ShowtimeMovieDto } from "@/src/services/administration-service/showtime/models/output.model";

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
    movieFormat?: string;
    screenName?: string;
    durationMins?: number;
    /**
     * Virtual Movie object composed by the admin BE from a runtime call to
     * the movie microservice. Null when the upstream lookup failed; consumers
     * should fall back to `customerMovieService.getMovieByIdAsync` if needed.
     */
    movie?: ShowtimeMovieDto;
}
