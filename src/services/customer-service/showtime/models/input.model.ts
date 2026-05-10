export interface GetCustomerShowtimeListInputDto {
    movieId?: string;
    cinemaId?: string;
    date?: string;
}

/** Body for `POST .../seat-hold`. */
export interface HoldSeatsInputDto {
    showtimeId: string;
    seatCodes: string[];
    /** Same as URL booking session id */
    sessionKey: string;
}
