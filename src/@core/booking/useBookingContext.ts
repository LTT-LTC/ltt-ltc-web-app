"use client";

import { useEffect, useMemo, useState } from "react";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";
import { CustomerShowtimeOutputDto } from "@/src/services/customer-service/showtime/models/output.model";
import { customerScreenService } from "@/src/services/customer-service/screen/screen.service";
import { ScreenOutputDto } from "@/src/services/administration-service/screen/models/output.model";
import { customerCinemaService } from "@/src/services/customer-service/cinema/cinema.service";
import { CustomerCinemaOutputDto } from "@/src/services/customer-service/cinema/models/output.model";
import { customerMovieService } from "@/src/services/customer-service/movie/movie.service";
import { MovieDetailOutputDto } from "@/src/services/customer-service/movie/models/output.model";
import {
    BookingState,
    loadBookingState,
} from "@/src/@core/booking/bookingState";
import { type SeatLayout } from "@/src/@core/const/mock/adminMockData";

export interface BookingContext {
    bookingState: BookingState | null;
    showtime: CustomerShowtimeOutputDto | null;
    screen: ScreenOutputDto | null;
    seatLayout: SeatLayout | null;
    cinema: CustomerCinemaOutputDto | null;
    movie: MovieDetailOutputDto | null;
    loading: boolean;
    error: string | null;
}

const DEFAULT_LAYOUT: SeatLayout = { rows: [] };

const tryParseSeatLayout = (raw?: string): SeatLayout => {
    if (!raw) {
        return DEFAULT_LAYOUT;
    }
    try {
        const parsed = JSON.parse(raw) as SeatLayout;
        if (parsed && Array.isArray(parsed.rows)) {
            return parsed;
        }
        return DEFAULT_LAYOUT;
    } catch {
        return DEFAULT_LAYOUT;
    }
};

export function useBookingContext(bookingId: string | undefined): BookingContext {
    const [bookingState, setBookingState] = useState<BookingState | null>(null);
    const [showtime, setShowtime] = useState<CustomerShowtimeOutputDto | null>(null);
    const [screen, setScreen] = useState<ScreenOutputDto | null>(null);
    const [cinema, setCinema] = useState<CustomerCinemaOutputDto | null>(null);
    const [movie, setMovie] = useState<MovieDetailOutputDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!bookingId) {
            setLoading(false);
            return;
        }

        const cached = loadBookingState(bookingId);
        setBookingState(cached);

        if (!cached?.showtimeId) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        const loadAll = async () => {
            setLoading(true);
            setError(null);

            try {
                const showtimeDto = await customerShowtimeService.getShowtimeByIdAsync(cached.showtimeId!);
                if (cancelled) return;
                setShowtime(showtimeDto);

                const targets = await Promise.all([
                    showtimeDto.screenId
                        ? customerScreenService.getScreenAsync(showtimeDto.screenId).catch(() => null)
                        : Promise.resolve(null),
                    showtimeDto.cinemaId
                        ? customerCinemaService.getCinemaByIdAsync(showtimeDto.cinemaId).catch(() => null)
                        : Promise.resolve(null),
                    showtimeDto.movieId
                        ? customerMovieService.getMovieByIdAsync(showtimeDto.movieId).catch(() => null)
                        : Promise.resolve(null),
                ]);

                if (cancelled) return;
                setScreen(targets[0] ?? null);
                setCinema(targets[1] ?? null);
                setMovie(targets[2] ?? null);
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : "Failed to load booking context");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadAll();
        return () => {
            cancelled = true;
        };
    }, [bookingId]);

    const seatLayout = useMemo<SeatLayout | null>(() => {
        if (!screen) return null;
        return tryParseSeatLayout(screen.seatLayout);
    }, [screen]);

    return {
        bookingState,
        showtime,
        screen,
        seatLayout,
        cinema,
        movie,
        loading,
        error,
    };
}
