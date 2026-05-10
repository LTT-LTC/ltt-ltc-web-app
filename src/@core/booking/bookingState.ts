/**
 * Persistent booking-flow state in **localStorage** so it survives tab/browser closes
 * and customers can resume checkout later (same origin).
 *
 * Legacy reads: if localStorage has no entry for a booking key, we one-time migrate
 * from sessionStorage (old behavior), then remove the sessionStorage copy.
 *
 * Mirrors the schema used by FE/ltc-film-hub's `bookingState.ts`, extended with
 * showtime/cinema/screen ids and payment-related fields.
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

    /** Signed VNPAY sandbox URL from payment-service; redirect after demo OTP (card flow). */
    pendingVnpayPaymentUrl?: string;

    /** Bank code sent as vnp_BankCode when creating the pending URL (card flow). */
    selectedBankCode?: string;

    /** Epoch ms (UTC) when server-side temporary seat hold expires (confirm step onward). */
    seatHoldExpiresAt?: number;

    createdAt: number;
    updatedAt: number;
}

export const BOOKING_STORAGE_PREFIX = "ltc:booking:";

export const BOOKING_STORAGE_KEY = (bookingId: string) => `${BOOKING_STORAGE_PREFIX}${bookingId || "tmp"}`;

const isBrowser = (): boolean =>
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined";

const readFromStorage = (key: string): string | null => {
    if (!isBrowser()) return null;

    const localValue = window.localStorage.getItem(key);
    if (localValue) return localValue;

    const legacySession =
        typeof window.sessionStorage !== "undefined" ? window.sessionStorage.getItem(key) : null;
    if (legacySession) {
        window.localStorage.setItem(key, legacySession);
        window.sessionStorage.removeItem(key);
        return legacySession;
    }

    return null;
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
    const key = BOOKING_STORAGE_KEY(bookingId);
    window.localStorage.setItem(key, JSON.stringify(next));
    if (typeof window.sessionStorage !== "undefined") {
        window.sessionStorage.removeItem(key);
    }
    notifyBookingStateChanged(bookingId);
    return next;
};

export const clearBookingState = (bookingId: string): void => {
    if (!isBrowser()) {
        return;
    }
    const key = BOOKING_STORAGE_KEY(bookingId);
    window.localStorage.removeItem(key);
    if (typeof window.sessionStorage !== "undefined") {
        window.sessionStorage.removeItem(key);
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
