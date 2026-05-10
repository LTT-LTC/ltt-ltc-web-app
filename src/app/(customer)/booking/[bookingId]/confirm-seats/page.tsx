"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import MovieTicket, { formatVND } from "@/src/@core/component/customer/MovieTicket";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { saveBookingState } from "@/src/@core/booking/bookingState";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";

const formatShowtimeLabel = (start?: string, end?: string, emptyPlaceholder = "—") => {
    const fmt = (value?: string) => {
        if (!value) return "";
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : value;
    };
    const left = fmt(start);
    const right = fmt(end);
    if (!left) return emptyPlaceholder;
    if (!right) return left;
    return `${left} ~ ${right}`;
};

export default function ConfirmSeatsPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();

    const { bookingState, showtime, screen, cinema, movie, loading, error } = useBookingContext(bookingId);

    const [holdState, setHoldState] = useState<"loading" | "ready">("loading");
    const [navPending, startNavTransition] = useTransition();

    const seatsKey = bookingState?.seats?.join(",") ?? "";

    useEffect(() => {
        if (loading || error || !bookingState?.seats?.length || !showtime?.id || !bookingId) {
            return;
        }

        let cancelled = false;

        const run = async () => {
            setHoldState("loading");
            try {
                const out = await customerShowtimeService.holdSeatsAsync({
                    showtimeId: showtime.id,
                    seatCodes: bookingState.seats,
                    sessionKey: bookingId,
                });
                const expires = Date.parse(out.heldUntilUtc);
                saveBookingState(bookingId, { seatHoldExpiresAt: expires });
                if (!cancelled) {
                    setHoldState("ready");
                }
            } catch (e) {
                const raw = e instanceof Error ? e.message : "";
                toast.error(
                    raw.toLowerCase().includes("seat") || raw.toLowerCase().includes("ghế")
                        ? raw || t("customer.booking.toast.seat_hold_conflict")
                        : t("customer.booking.toast.seat_hold_failed"),
                );
                if (!cancelled) {
                    router.replace(`/booking/${bookingId}/seats`);
                }
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seatsKey mirrors bookingState.seats
    }, [loading, error, bookingId, showtime?.id, seatsKey, router, t]);

    const onSeatHoldExpired = useCallback(() => {
        router.replace(`/booking/${bookingId}/seats`);
    }, [bookingId, router]);

    const releaseHold = useCallback(async () => {
        if (!showtime?.id || !bookingId) return;
        await customerShowtimeService.releaseSeatHoldAsync(showtime.id, bookingId).catch(() => {});
    }, [showtime?.id, bookingId]);

    const goBackToSeats = useCallback(() => {
        startNavTransition(() => {
            void (async () => {
                await releaseHold();
                router.push(`/booking/${bookingId}/seats`);
            })();
        });
    }, [bookingId, releaseHold, router]);

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.loading")}
            </div>
        );
    }

    if (error || !bookingState || !bookingState.seats?.length || !showtime) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center space-y-4">
                <p className="text-gray-500">{t("customer.booking.invalid_session")}</p>
                <LTTButton variant="outline" onClick={goBackToSeats}>
                    {t("customer.booking.cta.go_back_to_seats")}
                </LTTButton>
            </div>
        );
    }

    if (holdState === "loading") {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.confirm.securing_seats")}
            </div>
        );
    }

    const emptyPh = t("customer.booking.field.empty_placeholder");
    const screenLabel = screen?.screenNumber
        ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}`
        : emptyPh;
    const cinemaName = cinema?.name || emptyPh;
    const showtimeLabel = formatShowtimeLabel(showtime.startTime, showtime.endTime, emptyPh);

    const handleConfirm = () => {
        startNavTransition(() => {
            router.push(`/booking/${bookingId}/extras`);
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t("customer.booking.heading.confirm")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("customer.booking.confirm.subtitle")}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <Field label={t("customer.booking.field.cinema")} value={cinemaName} />
                    <Field label={t("customer.booking.field.screen")} value={screenLabel} />
                    <Field label={t("customer.booking.field.movie")} value={movie?.title ?? showtime.movie?.title ?? emptyPh} />
                    <Field label={t("customer.booking.field.format")} value={showtime.movieFormat || emptyPh} />
                    <Field label={t("customer.booking.field.showtime")} value={showtimeLabel} />
                    <Field label={t("customer.booking.field.duration")} value={`${movie?.durationMins ?? showtime.durationMins ?? 0} ${t("customer.all_cinemas.minutes")}`} />
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4">
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{t("customer.booking.field.seats")}</p>
                    <div className="flex flex-wrap gap-2">
                        {bookingState.seats.map((seat) => (
                            <span key={seat} className="inline-flex items-center rounded-md bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-bold">
                                {seat}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t("customer.booking.field.ticket_total")}</span>
                    <span className="text-lg font-bold text-[#cd1e25]">{formatVND(bookingState.ticketTotal)}</span>
                </div>

                <div className="flex gap-3 pt-2">
                    <LTTButton
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={goBackToSeats}
                        disabled={navPending}
                    >
                        {navPending && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />}
                        {t("customer.booking.cta.back")}
                    </LTTButton>
                    <LTTButton
                        size="lg"
                        className="flex-1 bg-[#cd1e25] hover:bg-[#a8181d] text-white font-bold"
                        onClick={handleConfirm}
                        disabled={navPending}
                    >
                        {navPending && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />}
                        {t("customer.booking.cta.confirm")}
                    </LTTButton>
                </div>
            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
                <MovieTicket
                    movie={{
                        title: movie?.title ?? showtime.movie?.title ?? emptyPh,
                        originalTitle: movie?.originalTitle ?? showtime.movie?.originalTitle,
                        posterUrl: movie?.posterUrl ?? showtime.movie?.posterUrl,
                        ageRating: movie?.ratingCode ?? showtime.movie?.ratingCode,
                        durationMins: movie?.durationMins ?? showtime.movie?.durationMins ?? showtime.durationMins,
                    }}
                    format={showtime.movieFormat}
                    cinemaName={cinemaName}
                    screenLabel={screenLabel}
                    showtimeLabel={showtimeLabel}
                    selectedSeats={bookingState.seats}
                    basePrice={bookingState.basePrice}
                    ticketTotal={bookingState.ticketTotal}
                    primaryActionLabel={t("customer.booking.cta.continue")}
                    onPrimaryAction={handleConfirm}
                    primaryLoading={navPending}
                    backLoading={navPending}
                    primaryDisabled={navPending}
                    backTo={`/booking/${bookingId}/seats`}
                    onBeforeBack={releaseHold}
                    skipBackConfirm
                    holdExpiresAtMs={bookingState.seatHoldExpiresAt}
                    onSeatHoldExpired={onSeatHoldExpired}
                />
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>
        </div>
    );
}
