import {
    BOOKING_STORAGE_PREFIX,
    BookingState,
    loadBookingState,
} from "@/src/@core/booking/bookingState";

const STORAGE_PREFIX = BOOKING_STORAGE_PREFIX;

/** Parsed booking id from `ltc:booking:{guid}` keys only (skips `ltc:booking:tmp` unless present as key). */
function bookingIdFromStorageKey(key: string): string | null {
    if (!key.startsWith(STORAGE_PREFIX)) return null;
    const id = key.slice(STORAGE_PREFIX.length);
    return id.length > 0 ? id : null;
}

function collectBookingIdsFromStorage(storage: Storage): Set<string> {
    const ids = new Set<string>();
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        const id = key ? bookingIdFromStorageKey(key) : null;
        if (id) ids.add(id);
    }
    return ids;
}

export interface StoredBookingSession {
    bookingId: string;
    state: BookingState;
}

/**
 * Lists persisted booking sessions from localStorage and legacy sessionStorage keys.
 * `loadBookingState` migrates session → local on read.
 */
export function listStoredBookingSessions(): StoredBookingSession[] {
    if (typeof window === "undefined") {
        return [];
    }

    const ids = new Set<string>();
    if (typeof window.localStorage !== "undefined") {
        collectBookingIdsFromStorage(window.localStorage).forEach((id) => ids.add(id));
    }
    if (typeof window.sessionStorage !== "undefined") {
        collectBookingIdsFromStorage(window.sessionStorage).forEach((id) => ids.add(id));
    }

    const sessions: StoredBookingSession[] = [];
    for (const bookingId of ids) {
        const state = loadBookingState(bookingId);
        if (state?.showtimeId) {
            sessions.push({ bookingId, state });
        }
    }

    sessions.sort((a, b) => (b.state.updatedAt ?? 0) - (a.state.updatedAt ?? 0));
    return sessions;
}

/**
 * Best-effort resume route without persisting `lastVisitedStep` on BookingState.
 * Refine later by storing explicit step when navigating booking routes.
 */
export function resolveBookingResumePath(bookingId: string, state: BookingState): string {
    if (state.paymentMethod) {
        return `/booking/${bookingId}/payment`;
    }
    if (state.seats?.length > 0 && state.ticketTotal > 0) {
        return `/booking/${bookingId}/summary`;
    }
    if (state.showtimeId) {
        return `/booking/${bookingId}/seats`;
    }
    return `/booking/${bookingId}/seats`;
}
