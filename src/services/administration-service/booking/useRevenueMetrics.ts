import { useCallback, useEffect, useState } from "react";
import { bookingService } from "./booking.service";
import type { PaymentOutputDto } from "./models/output.model";
import {
    aggregateByPaidDate,
    aggregateByHour,
    aggregateByMovie,
    buildShowtimeMap,
    extractCinemaNames,
    filterPaymentsByCinema,
    type DailyRevenueRow,
    type HourlyRevenueRow,
    type MovieRevenueRow,
} from "./revenue-helpers";
import type { ShowtimeOutputDto } from "../showtime/models/output.model";

export interface RevenueMetrics {
    loading: boolean;
    error: string | null;
    capped: boolean;
    payments: PaymentOutputDto[];
    dailyRows: DailyRevenueRow[];
    hourlyRows: HourlyRevenueRow[];
    topMovies: MovieRevenueRow[];
    showtimeMap: Map<string, ShowtimeOutputDto>;
    cinemaOptions: { id: string; name: string }[];
    totals: {
        totalRevenue: number;
        ticketRevenue: number;
        fnbRevenue: number;
        ticketsSold: number;
    };
    reload: () => void;
}

/**
 * Shared hook for revenue data. Used by both the revenue report page and the executive dashboard.
 */
export function useRevenueMetrics(params: {
    fromDate?: string;
    toDate?: string;
    cinemaId?: string;
    todayDate?: string;
}): RevenueMetrics {
    const { fromDate, toDate, cinemaId, todayDate } = params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [capped, setCapped] = useState(false);
    const [allPayments, setAllPayments] = useState<PaymentOutputDto[]>([]);
    const [showtimeMap, setShowtimeMap] = useState<Map<string, ShowtimeOutputDto>>(new Map());
    const [cinemaOptions, setCinemaOptions] = useState<{ id: string; name: string }[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await bookingService.fetchAllPaymentsForReport({
                status: "SUCCESS",
                fromDate,
                toDate,
                sorting: "PaidTime DESC",
            });
            setCapped(result.capped);
            setAllPayments(result.items);

            const stIds = result.items
                .map((p) => p.bookingShowtimeId)
                .filter(Boolean) as string[];
            const stMap = await buildShowtimeMap(stIds);
            setShowtimeMap(stMap);

            const cinemas = extractCinemaNames(stMap);
            setCinemaOptions(Array.from(cinemas.entries()).map(([id, name]) => ({ id, name })));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load revenue data");
            setAllPayments([]);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate]);

    useEffect(() => {
        void load();
    }, [load]);

    const filtered = filterPaymentsByCinema(allPayments, cinemaId ?? "all", showtimeMap);
    const dailyRows = aggregateByPaidDate(filtered);
    const hourlyRows = aggregateByHour(filtered, todayDate ?? new Date().toISOString().slice(0, 10));
    const topMovies = aggregateByMovie(filtered, showtimeMap).slice(0, 5);

    const totals = dailyRows.reduce(
        (acc, r) => {
            acc.totalRevenue += r.totalRevenue;
            acc.ticketRevenue += r.ticketRevenue;
            acc.fnbRevenue += r.fnbRevenue;
            acc.ticketsSold += r.ticketsSold;
            return acc;
        },
        { totalRevenue: 0, ticketRevenue: 0, fnbRevenue: 0, ticketsSold: 0 },
    );

    return {
        loading,
        error,
        capped,
        payments: filtered,
        dailyRows,
        hourlyRows,
        topMovies,
        showtimeMap,
        cinemaOptions,
        totals,
        reload: load,
    };
}
