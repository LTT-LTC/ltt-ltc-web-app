import dayjs from "dayjs";
import type { PaymentOutputDto } from "./models/output.model";
import { showtimeService } from "../showtime/showtime.service";
import type { ShowtimeOutputDto } from "../showtime/models/output.model";

// ---------------------------------------------------------------------------
// Snapshot parsing
// ---------------------------------------------------------------------------

export interface BookingSnapshot {
    bookingId?: string;
    grandTotal?: number;
    ticketTotal?: number;
    extrasTotal?: number;
    discount?: number;
    seats?: string[];
    fnb?: { id: string; quantity: number }[];
    combos?: { id: string; quantity: number }[];
}

export function parseBookingSnapshot(json: string | null | undefined): BookingSnapshot | null {
    if (!json) return null;
    try {
        return JSON.parse(json) as BookingSnapshot;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Daily aggregation for revenue table/charts
// ---------------------------------------------------------------------------

export interface DailyRevenueRow {
    date: string;
    ticketRevenue: number;
    fnbRevenue: number;
    totalRevenue: number;
    ticketsSold: number;
}

/**
 * Group payments by paid date and derive ticket vs F&B split.
 * When a booking snapshot is available, uses `ticketTotal` / `extrasTotal`.
 * Otherwise falls back to the full `amount` as ticket revenue.
 */
export function aggregateByPaidDate(payments: PaymentOutputDto[]): DailyRevenueRow[] {
    const map = new Map<string, DailyRevenueRow>();

    for (const p of payments) {
        const paidDate = p.paidTime ?? p.bookingCreatedAt;
        if (!paidDate) continue;
        const key = dayjs(paidDate).format("YYYY-MM-DD");

        let row = map.get(key);
        if (!row) {
            row = { date: key, ticketRevenue: 0, fnbRevenue: 0, totalRevenue: 0, ticketsSold: 0 };
            map.set(key, row);
        }

        const snap = parseBookingSnapshot(p.bookingSnapshotJson);
        if (snap && snap.ticketTotal != null) {
            row.ticketRevenue += snap.ticketTotal;
            row.fnbRevenue += (snap.extrasTotal ?? 0);
            row.totalRevenue += snap.grandTotal ?? (snap.ticketTotal + (snap.extrasTotal ?? 0));
        } else {
            row.ticketRevenue += p.amount;
            row.totalRevenue += p.amount;
        }

        const seatCount = snap?.seats?.length ?? (p.bookingSeatCodes?.split(",").filter(Boolean).length ?? 1);
        row.ticketsSold += seatCount;
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------------------
// Hourly aggregation for dashboard chart
// ---------------------------------------------------------------------------

export interface HourlyRevenueRow {
    h: string;
    revenue: number;
}

export function aggregateByHour(payments: PaymentOutputDto[], targetDate: string): HourlyRevenueRow[] {
    const hours: Record<string, number> = {};
    for (let i = 0; i < 24; i++) hours[String(i).padStart(2, "0")] = 0;

    for (const p of payments) {
        const t = p.paidTime ?? p.bookingCreatedAt;
        if (!t) continue;
        const d = dayjs(t);
        if (d.format("YYYY-MM-DD") !== targetDate) continue;
        const h = d.format("HH");
        hours[h] = (hours[h] ?? 0) + p.amount;
    }

    return Object.entries(hours).map(([h, revenue]) => ({ h, revenue }));
}

// ---------------------------------------------------------------------------
// Top-movie aggregation
// ---------------------------------------------------------------------------

export interface MovieRevenueRow {
    movieTitle: string;
    revenue: number;
    showtimeId: string;
}

export function aggregateByMovie(
    payments: PaymentOutputDto[],
    showtimeMap: Map<string, ShowtimeOutputDto>,
): MovieRevenueRow[] {
    const map = new Map<string, MovieRevenueRow>();

    for (const p of payments) {
        const stId = p.bookingShowtimeId;
        if (!stId) continue;
        const st = showtimeMap.get(stId);
        const title = st?.movie?.title ?? st?.movieTitle ?? "Unknown";

        let row = map.get(title);
        if (!row) {
            row = { movieTitle: title, revenue: 0, showtimeId: stId };
            map.set(title, row);
        }
        row.revenue += p.amount;
    }

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

// ---------------------------------------------------------------------------
// Batched showtime → cinema lookup with cache
// ---------------------------------------------------------------------------

const showtimeCache = new Map<string, ShowtimeOutputDto>();

export async function buildShowtimeMap(showtimeIds: string[]): Promise<Map<string, ShowtimeOutputDto>> {
    const unique = [...new Set(showtimeIds)].filter((id) => id && id !== "00000000-0000-0000-0000-000000000000");
    const toFetch = unique.filter((id) => !showtimeCache.has(id));

    const results = await Promise.allSettled(toFetch.map((id) => showtimeService.getShowtimeByIdAsync(id)));
    results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
            showtimeCache.set(toFetch[i], r.value);
        }
    });

    const out = new Map<string, ShowtimeOutputDto>();
    for (const id of unique) {
        const cached = showtimeCache.get(id);
        if (cached) out.set(id, cached);
    }
    return out;
}

/**
 * Given a showtime map, returns a mapping from cinemaId → cinemaName.
 * Extracts from already-fetched showtime data (no extra API calls).
 */
export function extractCinemaNames(showtimeMap: Map<string, ShowtimeOutputDto>): Map<string, string> {
    const map = new Map<string, string>();
    for (const st of showtimeMap.values()) {
        if (st.cinemaId && st.cinemaName && !map.has(st.cinemaId)) {
            map.set(st.cinemaId, st.cinemaName);
        }
    }
    return map;
}

/**
 * Filter payments to a specific cinema by resolving their showtimeId → cinemaId.
 */
export function filterPaymentsByCinema(
    payments: PaymentOutputDto[],
    cinemaId: string,
    showtimeMap: Map<string, ShowtimeOutputDto>,
): PaymentOutputDto[] {
    if (!cinemaId || cinemaId === "all") return payments;
    return payments.filter((p) => {
        if (!p.bookingShowtimeId) return false;
        const st = showtimeMap.get(p.bookingShowtimeId);
        return st?.cinemaId === cinemaId;
    });
}
