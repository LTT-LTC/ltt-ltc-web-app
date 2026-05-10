"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Film, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CartIcon from "@/src/@core/component/LTTIcon/iconoir/cart";
import { LTTPopover, LTTPopoverContent, LTTPopoverTrigger } from "@/src/@core/component/LTTShadcnUI/LTTPopover";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogFooter,
    LTTDialogHeader,
    LTTDialogTitle,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { BookingState, clearBookingState } from "@/src/@core/booking/bookingState";
import {
    listStoredBookingSessions,
    resolveBookingResumePath,
    type StoredBookingSession,
} from "@/src/@core/booking/bookingSessions";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";
import { customerCinemaService } from "@/src/services/customer-service/cinema/cinema.service";
import { customerMovieService } from "@/src/services/customer-service/movie/movie.service";
import { cn } from "@/src/@core/utils/cn";

function formatVnd(amount: number): string {
    return `${amount.toLocaleString("vi-VN")}đ`;
}

/** Same m:ss shape as {@link MovieTicket} seat hold countdown. */
function formatHoldTimeLeft(expiresAtMs: number | undefined, nowMs: number): string | null {
    if (expiresAtMs == null) return null;
    const ms = expiresAtMs - nowMs;
    if (ms <= 0) return null;
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Seat hold was active (timer persisted) and the deadline has passed. */
function isSeatHoldExpired(state: BookingState, nowMs: number): boolean {
    const exp = state.seatHoldExpiresAt;
    if (typeof exp !== "number" || !Number.isFinite(exp)) return false;
    if (!(state.seats?.length > 0)) return false;
    return exp <= nowMs;
}

interface CartLineDetail {
    movieTitle: string;
    cinemaName: string;
    showtimeLabel: string;
    posterUrl?: string;
}

function BookingCartSessionCard({
    session,
    localeTag,
    nowMs,
    onContinue,
    onRemoveClick,
    t,
}: {
    session: StoredBookingSession;
    localeTag: string;
    nowMs: number;
    onContinue: () => void;
    onRemoveClick: () => void;
    t: (k: string, opts?: Record<string, unknown>) => string;
}) {
    const [detail, setDetail] = useState<CartLineDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const stId = session.state.showtimeId;
        if (!stId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        void (async () => {
            try {
                const showtime = await customerShowtimeService.getShowtimeByIdAsync(stId);
                const [cinema, movieFallback] = await Promise.all([
                    showtime.cinemaId
                        ? customerCinemaService.getCinemaByIdAsync(showtime.cinemaId).catch(() => null)
                        : Promise.resolve(null),
                    !showtime.movie?.title && showtime.movieId
                        ? customerMovieService.getMovieByIdAsync(showtime.movieId).catch(() => null)
                        : Promise.resolve(null),
                ]);
                if (cancelled) return;
                const movieTitle =
                    showtime.movie?.title?.trim() ||
                    movieFallback?.title?.trim() ||
                    t("customer.booking.cart.movie_fallback");
                const start = new Date(showtime.startTime);
                const showtimeLabel = Number.isNaN(start.getTime())
                    ? "—"
                    : start.toLocaleString(localeTag, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                      });
                setDetail({
                    movieTitle,
                    cinemaName: cinema?.name ?? "—",
                    showtimeLabel,
                    posterUrl: showtime.movie?.posterUrl?.trim() || movieFallback?.posterUrl?.trim(),
                });
            } catch {
                if (!cancelled) {
                    setDetail({
                        movieTitle: t("customer.booking.cart.movie_fallback"),
                        cinemaName: "—",
                        showtimeLabel: "—",
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [session.bookingId, session.state.showtimeId, session.state.updatedAt, localeTag, t]);

    const seatsLabel =
        session.state.seats?.length > 0 ? session.state.seats.join(", ") : t("customer.booking.cart.no_seats_yet");
    const extrasHint =
        (session.state.fnb?.length ?? 0) > 0 || (session.state.combos?.length ?? 0) > 0
            ? t("customer.booking.cart.extras_note")
            : null;

    const holdExpiresAt = session.state.seatHoldExpiresAt;
    const holdExpired = isSeatHoldExpired(session.state, nowMs);
    const holdLabel =
        !holdExpired && holdExpiresAt != null && session.state.seats?.length > 0
            ? formatHoldTimeLeft(holdExpiresAt, nowMs)
            : null;

    return (
        <div
            className={cn(
                "flex items-start gap-3 rounded-xl border border-border-shadcn bg-card p-4 shadow-sm transition-opacity",
                holdExpired && "opacity-[0.92]",
            )}
        >
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted-shadcn">
                {detail?.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={detail.posterUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground-shadcn" /> : <Film className="h-6 w-6 text-muted-foreground-shadcn" />}
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                {loading && !detail ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground-shadcn">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t("customer.booking.cart.loading_details")}
                    </div>
                ) : (
                    <>
                        <h3 className="truncate font-bold text-foreground-shadcn">{detail?.movieTitle}</h3>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground-shadcn">{detail?.cinemaName}</p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground-shadcn">
                            <span>{detail?.showtimeLabel}</span>
                            <span>
                                {t("customer.booking.cart.seats_label")}: {seatsLabel}
                            </span>
                        </div>
                        {extrasHint ? <p className="mt-1 text-[11px] text-muted-foreground-shadcn">{extrasHint}</p> : null}
                        {holdExpired ? (
                            <span className="mt-2 inline-flex items-center rounded-md border border-muted-foreground/25 bg-muted-shadcn px-2.5 py-1 text-xs font-semibold text-muted-foreground-shadcn">
                                {t("customer.booking.cart.hold_expired_badge")}
                            </span>
                        ) : holdLabel != null ? (
                            <span className="mt-2 inline-flex items-center rounded-md border-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-extrabold tabular-nums tracking-tight text-amber-900 shadow-sm">
                                {t("customer.booking.ticket.hold_timer", { time: holdLabel })}
                            </span>
                        ) : null}
                    </>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <LTTButton type="button" size="sm" className="h-8" onClick={onContinue}>
                        {t("customer.booking.cart.continue")}
                    </LTTButton>
                    <button
                        type="button"
                        onClick={onRemoveClick}
                        className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("customer.booking.cart.remove")}
                    </button>
                </div>
            </div>
            <div className="shrink-0 text-right">
                <p className="font-bold text-primary">{formatVnd(session.state.ticketTotal ?? 0)}</p>
            </div>
        </div>
    );
}

interface BookingCartPopoverProps {
    triggerClassName?: string;
}

export default function BookingCartPopover({ triggerClassName }: BookingCartPopoverProps) {
    const router = useRouter();
    const { t, currentLanguage } = useLocalization();
    const localeTag = currentLanguage === "vi" ? "vi-VN" : "en-US";

    const [open, setOpen] = useState(false);
    const [sessions, setSessions] = useState<StoredBookingSession[]>([]);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [confirmRemove, setConfirmRemove] = useState<StoredBookingSession | null>(null);
    const [removing, setRemoving] = useState(false);

    const refreshSessions = useCallback(() => {
        setSessions(listStoredBookingSessions());
    }, []);

    useEffect(() => {
        refreshSessions();
    }, [refreshSessions]);

    /** Tick countdown labels. Seat-hold expiry clears local state only via explicit navigation from booking steps (avoids racing redirects). */
    useEffect(() => {
        const interval = window.setInterval(() => {
            setNowMs(Date.now());
        }, 1000);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key?.startsWith("ltc:booking:")) {
                refreshSessions();
            }
        };
        const onCustom = () => refreshSessions();
        window.addEventListener("storage", onStorage);
        window.addEventListener("ltc-booking-state-changed", onCustom);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("ltc-booking-state-changed", onCustom);
        };
    }, [refreshSessions]);

    useEffect(() => {
        if (open) refreshSessions();
    }, [open, refreshSessions]);

    useEffect(() => {
        if (!confirmRemove) return;
        if (!sessions.some((s) => s.bookingId === confirmRemove.bookingId)) {
            setConfirmRemove(null);
        }
    }, [sessions, confirmRemove]);

    const count = sessions.length;
    const badgeText = count > 9 ? "9+" : String(count);

    const grandTotal = useMemo(
        () => sessions.reduce((sum, s) => sum + (s.state.ticketTotal ?? 0), 0),
        [sessions],
    );

    const handleContinue = (bookingId: string, state: BookingState) => {
        router.push(resolveBookingResumePath(bookingId, state));
        setOpen(false);
    };

    const executeRemove = async () => {
        if (!confirmRemove) return;
        const { bookingId, state } = confirmRemove;
        setRemoving(true);
        try {
            if (state.showtimeId) {
                await customerShowtimeService.releaseSeatHoldAsync(state.showtimeId, bookingId);
            }
            clearBookingState(bookingId);
            refreshSessions();
            setConfirmRemove(null);
            toast.success(t("customer.booking.cart.removed_toast"));
        } catch {
            toast.error(t("customer.booking.cart.release_hold_failed"));
        } finally {
            setRemoving(false);
        }
    };

    return (
        <>
            <LTTPopover open={open} onOpenChange={setOpen}>
                <LTTPopoverTrigger asChild>
                    <button
                        type="button"
                        aria-label={t("customer.booking.cart.title")}
                        className={cn(
                            "relative flex items-center justify-center size-10 rounded-full hover:bg-primary/5 text-slate-500 hover:text-primary transition-all duration-200 cursor-pointer",
                            triggerClassName,
                        )}
                    >
                        <CartIcon className="!w-5 !h-5" />
                        {count > 0 ? (
                            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
                                {badgeText}
                            </span>
                        ) : null}
                    </button>
                </LTTPopoverTrigger>
                <LTTPopoverContent align="end" sideOffset={8} className="w-[min(100vw-1rem,28rem)] p-0">
                    <div className="border-b border-border-shadcn px-4 py-3">
                        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground-shadcn">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            {t("customer.booking.cart.title")}
                        </h2>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
                        {sessions.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border-shadcn bg-muted-shadcn/30 px-6 py-12 text-center">
                                <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-muted-foreground-shadcn" />
                                <p className="text-sm text-muted-foreground-shadcn">{t("customer.booking.cart.empty")}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <BookingCartSessionCard
                                        key={session.bookingId}
                                        session={session}
                                        localeTag={localeTag}
                                        nowMs={nowMs}
                                        onContinue={() => handleContinue(session.bookingId, session.state)}
                                        onRemoveClick={() => setConfirmRemove(session)}
                                        t={t}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {sessions.length > 0 ? (
                        <div className="flex items-center justify-between border-t border-border-shadcn bg-muted-shadcn/20 px-4 py-3">
                            <span className="font-semibold text-foreground-shadcn">{t("customer.booking.cart.grand_total")}</span>
                            <span className="font-heading text-xl font-bold text-primary">{formatVnd(grandTotal)}</span>
                        </div>
                    ) : null}
                </LTTPopoverContent>
            </LTTPopover>

            <LTTDialog open={!!confirmRemove} onOpenChange={(next) => !next && !removing && setConfirmRemove(null)}>
                <LTTDialogContent className="sm:max-w-md" onPointerDownOutside={(e) => removing && e.preventDefault()}>
                    <LTTDialogHeader>
                        <LTTDialogTitle>{t("customer.booking.cart.confirm_remove_title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <p className="text-sm leading-relaxed text-muted-foreground-shadcn">
                        {t("customer.booking.cart.confirm_remove_message")}
                    </p>
                    <LTTDialogFooter className="gap-3 sm:justify-end">
                        <LTTButton variant="outline" disabled={removing} type="button" onClick={() => setConfirmRemove(null)}>
                            {t("customer.booking.cart.cancel")}
                        </LTTButton>
                        <LTTButton variant="destructive" loading={removing} type="button" onClick={() => void executeRemove()}>
                            {t("customer.booking.cart.confirm_remove")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </>
    );
}
