/**
 * Persistent booking-flow state stored in sessionStorage so it survives route
 * transitions within the same browser tab and is cleared when the tab closes.
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

export type BookingPaymentMethod = "cash" | "card" | "momo" | "bank" | "vnpay";

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

    /** Card metadata for confirmation / OTP steps — never store full PAN (only last four). */
    cardHolderDisplay?: string;
    cardExpiryDisplay?: string;
    cardLastFour?: string;

    /** Set after user submits OTP on the payment/otp step (before processing). */
    paymentOtpVerified?: boolean;

    /** Epoch ms (UTC) when server-side temporary seat hold expires (confirm step onward). */
    seatHoldExpiresAt?: number;

    createdAt: number;
    updatedAt: number;
}

export const BOOKING_STORAGE_KEY = (bookingId: string) => `ltc:booking:${bookingId || "tmp"}`;

const isBrowser = (): boolean => typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

const readFromStorage = (key: string): string | null => {
    if (!isBrowser()) return null;
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;

    // One-time migration path for old localStorage entries.
    const legacyValue = typeof window.localStorage !== "undefined" ? window.localStorage.getItem(key) : null;
    if (legacyValue) {
        window.sessionStorage.setItem(key, legacyValue);
        window.localStorage.removeItem(key);
    }
    return legacyValue;
};

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
        const raw = readFromStorage(BOOKING_STORAGE_KEY(bookingId));
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
    window.sessionStorage.setItem(BOOKING_STORAGE_KEY(bookingId), JSON.stringify(next));
    notifyBookingStateChanged(bookingId);
    return next;
};

export const clearBookingState = (bookingId: string): void => {
    if (!isBrowser()) {
        return;
    }
    window.sessionStorage.removeItem(BOOKING_STORAGE_KEY(bookingId));
    if (typeof window.localStorage !== "undefined") {
        window.localStorage.removeItem(BOOKING_STORAGE_KEY(bookingId));
    }
    notifyBookingStateChanged(bookingId);
};

export const notifyBookingStateChanged = (bookingId: string): void => {
    if (!isBrowser()) {
        return;
    }
    window.dispatchEvent(new CustomEvent("ltc-booking-state-changed", { detail: { bookingId } }));
};

/**
 * New booking session id — must be a valid GUID string so customer API routes
 * (`PUT .../booking/{id}/prepare-for-payment`, etc.) bind to `Guid id`.
 */
export const newBookingId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
