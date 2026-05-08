/**
 * Persistent booking-flow state stored in localStorage so it survives Next.js
 * route transitions across `/booking/[bookingId]/seats|confirm-seats|extras|summary|payment|processing`.
 *
 * Mirrors the schema used by FE/ltc-film-hub's `bookingState.ts`, extended with
 * showtime/cinema/screen ids resolved on the showtime click and the
 * payment-related fields surfaced after the user picks a method.
 */

export interface BookingFnbLine {
    id: string;
    quantity: number;
}

export interface BookingComboLine {
    id: string;
    quantity: number;
}

export type BookingPaymentMethod = "cash" | "card" | "momo" | "bank";

export interface BookingState {
    bookingId: string;

    showtimeId?: string;
    cinemaId?: string;
    screenId?: string;
    movieId?: string;

    seats: string[];
    ticketTotal: number;
    basePrice: number;

    fnb: BookingFnbLine[];
    combos: BookingComboLine[];

    discountCode?: string;
    discountAmount?: number;

    paymentMethod?: BookingPaymentMethod;
    paymentRef?: string;

    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = (bookingId: string) => `ltc:booking:${bookingId || "tmp"}`;

const isBrowser = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const emptyState = (bookingId: string): BookingState => ({
    bookingId,
    seats: [],
    ticketTotal: 0,
    basePrice: 0,
    fnb: [],
    combos: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
});

export const loadBookingState = (bookingId: string): BookingState | null => {
    if (!isBrowser()) {
        return null;
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY(bookingId));
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw) as Partial<BookingState>;
        return {
            ...emptyState(bookingId),
            ...parsed,
            bookingId,
            seats: parsed.seats ?? [],
            fnb: parsed.fnb ?? [],
            combos: parsed.combos ?? [],
        };
    } catch {
        return null;
    }
};

export const saveBookingState = (bookingId: string, patch: Partial<BookingState>): BookingState => {
    if (!isBrowser()) {
        return { ...emptyState(bookingId), ...patch, bookingId };
    }
    const previous = loadBookingState(bookingId) ?? emptyState(bookingId);
    const next: BookingState = {
        ...previous,
        ...patch,
        bookingId,
        updatedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY(bookingId), JSON.stringify(next));
    return next;
};

export const clearBookingState = (bookingId: string): void => {
    if (!isBrowser()) {
        return;
    }
    window.localStorage.removeItem(STORAGE_KEY(bookingId));
};

/** Stable, URL-safe id used for new booking sessions. */
export const newBookingId = (): string => {
    const random = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
        : Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    return `bk-${random}`;
};
