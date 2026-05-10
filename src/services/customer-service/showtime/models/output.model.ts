/** Movie projection bundled with showtime responses (camelCase JSON). */
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

    /** Snapshot seat map JSON for this showtime (preferred over screen layout for booking). */
    seatLayout?: string;

    /** Seats persisted as sold in seat layout (after payment merge); uppercase on BE. */
    soldSeatCodes?: string[];

    /** Seat codes currently held server-side (Redis); uppercase normalized on BE. */
    heldSeatCodes?: string[];
}

/** Response from `POST .../seat-hold`. */
export interface HoldSeatsOutputDto {
    heldUntilUtc: string;
    holdDurationMinutes: number;
}
