import type { ShowtimeMovieDto } from "@/src/services/customer-service/showtime/models/output.model";

export type { ShowtimeMovieDto } from "@/src/services/customer-service/showtime/models/output.model";

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
    /**
     * Legacy string title kept for back-compat. New BE responses populate the
     * full {@link movie} object instead; prefer reading from `movie?.title`.
     */
    movieTitle?: string;
    cinemaName?: string;
    screenId: string;
    screenName?: string;
    startTime: string;
    endTime: string;
    /**
     * Virtual Movie object composed by the admin BE from a runtime call to
     * the movie microservice. Null when the upstream lookup failed; consumers
     * should fall back to `movieTitle` or a locally-loaded movie map.
     */
    movie?: ShowtimeMovieDto;
}
