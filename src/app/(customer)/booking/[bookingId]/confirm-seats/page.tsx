"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import MovieTicket, { formatVND } from "@/src/@core/component/customer/MovieTicket";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { useLocalization } from "@/src/@core/hooks/use-localization";

const formatShowtimeLabel = (start?: string, end?: string) => {
    const fmt = (value?: string) => {
        if (!value) return "";
        const parsed = dayjs(value);
        return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : value;
    };
    const left = fmt(start);
    const right = fmt(end);
    if (!left) return "—";
    if (!right) return left;
    return `${left} ~ ${right}`;
};

export default function ConfirmSeatsPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();

    const { bookingState, showtime, screen, cinema, movie, loading, error } = useBookingContext(bookingId);

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
                <LTTButton variant="outline" onClick={() => router.push(`/booking/${bookingId}/seats`)}>
                    {t("customer.booking.cta.go_back_to_seats")}
                </LTTButton>
            </div>
        );
    }

    const screenLabel = screen?.screenNumber
        ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}`
        : "—";
    const cinemaName = cinema?.name || "—";
    const showtimeLabel = formatShowtimeLabel(showtime.startTime, showtime.endTime);

    const handleConfirm = () => {
        router.push(`/booking/${bookingId}/extras`);
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
                    <Field label={t("customer.booking.field.movie")} value={movie?.title ?? showtime.movie?.title ?? "—"} />
                    <Field label={t("customer.booking.field.format")} value={showtime.movieFormat || "—"} />
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
                        onClick={() => router.push(`/booking/${bookingId}/seats`)}
                    >
                        {t("customer.booking.cta.back")}
                    </LTTButton>
                    <LTTButton
                        size="lg"
                        className="flex-1 bg-[#cd1e25] hover:bg-[#a8181d] text-white font-bold"
                        onClick={handleConfirm}
                    >
                        {t("customer.booking.cta.confirm")}
                    </LTTButton>
                </div>
            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
                <MovieTicket
                    movie={{
                        title: movie?.title ?? showtime.movie?.title ?? "—",
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
                    backTo={`/booking/${bookingId}/seats`}
                    skipBackConfirm
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
