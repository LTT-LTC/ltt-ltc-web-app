export interface ShowtimeMovieDto {
    id: string;
    movieId?: string;
    title?: string;
    originalTitle?: string;
    durationMins?: number;
    releaseDate?: string;
    premiereDate?: string;
    status?: string;
    description?: string;
    posterUrl?: string;
    trailerUrl?: string;
    studioId?: string;
    studioName?: string;
    studio?: { id: string; name: string };
    ratingId?: string;
    ratingCode?: string;
    ratingName?: string;
    genreNames?: string[];
    genres?: { id: string; name: string }[];
    actorRoles?: { actorName: string; roleName: string }[];
    cast?: {
        actor?: { id: string; name: string };
        role?: { id: string; name: string } | null;
        characterName?: string | null;
        actorName?: string | null;
        roleName?: string | null;
    }[];
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
