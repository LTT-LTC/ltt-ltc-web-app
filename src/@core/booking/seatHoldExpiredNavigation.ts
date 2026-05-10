import { clearBookingState } from "@/src/@core/booking/bookingState";

/** Query flag read by movie (or fallback) pages to show the hold-expired message once. */
export const SEAT_HOLD_EXPIRED_QUERY = "seatHoldExpired";

type ReplaceRouter = { replace: (href: string) => void };

export function navigateAfterSeatHoldExpired(
    router: ReplaceRouter,
    args: {
        bookingId: string;
        movieId?: string | null;
        releaseHold?: () => Promise<void>;
    },
): void {
    void args.releaseHold?.().catch(() => {});
    clearBookingState(args.bookingId);
    const mid = args.movieId?.trim();
    if (mid) {
        router.replace(`/movies/${encodeURIComponent(mid)}?${SEAT_HOLD_EXPIRED_QUERY}=1`);
    } else {
        router.replace(`/now-showing?${SEAT_HOLD_EXPIRED_QUERY}=1`);
    }
}
