"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import MovieTicket from "@/src/@core/component/customer/MovieTicket";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { saveBookingState } from "@/src/@core/booking/bookingState";
import { useLocalization } from "@/src/@core/hooks/use-localization";

const otpDigits = (value: string): string => value.replace(/\D/g, "");

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

export default function BookingPaymentOtpPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();

    const { bookingState, showtime, screen, cinema, movie, loading } = useBookingContext(bookingId);

    const [otp, setOtp] = useState("");
    const [otpSubmitted, setOtpSubmitted] = useState(false);
    const [navPending, startNavTransition] = useTransition();

    /** After user clicks verify, discourage refresh until this page unmounts (navigation completes). */
    useEffect(() => {
        const warnLeave = (e: BeforeUnloadEvent) => {
            if (!otpSubmitted) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", warnLeave);
        return () => {
            window.removeEventListener("beforeunload", warnLeave);
        };
    }, [otpSubmitted]);

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.loading")}
            </div>
        );
    }

    const cardReady =
        bookingState?.paymentMethod === "card" &&
        Boolean(bookingState?.cardLastFour && bookingState?.cardHolderDisplay && bookingState?.cardExpiryDisplay);

    if (!bookingState || !bookingState.seats?.length || !showtime || !cardReady) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.invalid_session")}
                {bookingId && (
                    <div className="mt-4">
                        <LTTButton onClick={() => router.replace(`/booking/${bookingId}/payment`)}>
                            {t("customer.booking.cta.back_to_payment")}
                        </LTTButton>
                    </div>
                )}
            </div>
        );
    }

    const emptyPh = t("customer.booking.field.empty_placeholder");
    const cinemaName = cinema?.name || emptyPh;
    const screenLabel = screen?.screenNumber
        ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}`
        : emptyPh;
    const showtimeLabel = formatShowtimeLabel(showtime.startTime, showtime.endTime, emptyPh);

    const otpClean = otpDigits(otp);
    const otpValid = otpClean.length >= 4 && otpClean.length <= 6;

    const submitOtp = () => {
        if (!otpValid || !bookingId) return;
        setOtpSubmitted(true);
        saveBookingState(bookingId, { paymentOtpVerified: true });
        router.push(`/booking/${bookingId}/processing`);
    };

    const ticketTotal = bookingState.ticketTotal ?? 0;
    const discount = bookingState.discountAmount ?? 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t("customer.booking.otp.title")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("customer.booking.otp.subtitle")}</p>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {t("customer.booking.otp.refresh_warning")}
                </div>

                <div className="space-y-2 max-w-xs">
                    <LTTLabel htmlFor="booking-otp" className="text-sm font-semibold text-gray-800">
                        {t("customer.booking.otp.label")}
                    </LTTLabel>
                    <LTTInput
                        id="booking-otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder={t("customer.booking.otp.placeholder")}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="font-mono tracking-widest text-lg"
                        disabled={otpSubmitted}
                    />
                    {!otpValid && otp.length > 0 && (
                        <p className="text-xs text-red-600">{t("customer.booking.otp.invalid")}</p>
                    )}
                </div>

                <div className="flex gap-3 pt-2 flex-wrap">
                    <LTTButton
                        variant="outline"
                        size="lg"
                        className="flex-1 min-w-[140px]"
                        onClick={() => router.push(`/booking/${bookingId}/payment`)}
                        disabled={otpSubmitted || navPending}
                    >
                        {(otpSubmitted || navPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />
                        )}
                        {t("customer.booking.cta.back")}
                    </LTTButton>
                    <LTTButton
                        size="lg"
                        className="flex-1 min-w-[140px] bg-[#cd1e25] hover:bg-[#a8181d] text-white font-bold"
                        onClick={submitOtp}
                        disabled={!otpValid || otpSubmitted || navPending}
                    >
                        {navPending && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />}
                        {t("customer.booking.otp.submit")}
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
                    ticketTotal={ticketTotal}
                    discount={discount}
                    primaryActionLabel={t("customer.booking.otp.submit")}
                    onPrimaryAction={submitOtp}
                    primaryDisabled={!otpValid || otpSubmitted || navPending}
                    primaryLoading={navPending}
                    backLoading={otpSubmitted || navPending}
                    backTo={`/booking/${bookingId}/payment`}
                    skipBackConfirm
                    holdExpiresAtMs={bookingState.seatHoldExpiresAt}
                    onSeatHoldExpired={() => router.replace(`/booking/${bookingId}/seats`)}
                />
            </div>
        </div>
    );
}
