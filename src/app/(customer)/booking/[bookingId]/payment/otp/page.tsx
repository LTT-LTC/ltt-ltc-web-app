"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import MovieTicket from "@/src/@core/component/customer/MovieTicket";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { saveBookingState } from "@/src/@core/booking/bookingState";
import { navigateAfterSeatHoldExpired } from "@/src/@core/booking/seatHoldExpiredNavigation";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";

const otpDigits = (value: string): string => value.replace(/\D/g, "");

const DEMO_OTP = "123456";
const OTP_WINDOW_SECONDS = 60;

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
    const [verifying, setVerifying] = useState(false);
    const [deadlineMs, setDeadlineMs] = useState(() => Date.now() + OTP_WINDOW_SECONDS * 1000);
    const [, setTick] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => setTick((x) => x + 1), 250);
        return () => window.clearInterval(id);
    }, []);

    const secondsLeft = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));

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

    const pendingUrl = bookingState?.pendingVnpayPaymentUrl?.trim();
    const cardReady =
        bookingState?.paymentMethod === "card" &&
        Boolean(pendingUrl) &&
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
    const otpLengthOk = otpClean.length === 6;
    const timerActive = secondsLeft > 0;
    const otpValid = otpLengthOk && timerActive;

    const resendOtp = () => {
        setDeadlineMs(Date.now() + OTP_WINDOW_SECONDS * 1000);
        setOtp("");
        toast.success(t("customer.booking.otp.demo_resend_toast"));
    };

    const submitOtp = () => {
        if (!otpValid || !bookingId || !pendingUrl) return;
        if (!timerActive) {
            toast.error(t("customer.booking.otp.expired"));
            return;
        }
        if (otpClean !== DEMO_OTP) {
            toast.error(t("customer.booking.otp.demo_invalid"));
            return;
        }
        setOtpSubmitted(true);
        setVerifying(true);
        saveBookingState(bookingId, { paymentOtpVerified: true });
        window.location.href = pendingUrl;
    };

    const ticketTotal = bookingState.ticketTotal ?? 0;
    const discount = bookingState.discountAmount ?? 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t("customer.booking.otp.title")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("customer.booking.otp.subtitle")}</p>
                    <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 mt-2">
                        {t("customer.booking.otp.demo_card_hint")}
                    </p>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {t("customer.booking.otp.refresh_warning")}
                </div>

                <div className="space-y-2 max-w-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <LTTLabel htmlFor="booking-otp" className="text-sm font-semibold text-gray-800">
                            {t("customer.booking.otp.label")}
                        </LTTLabel>
                        <span className={`text-xs font-mono ${timerActive ? "text-gray-600" : "text-red-600"}`}>
                            {timerActive
                                ? t("customer.booking.otp.countdown", { seconds: secondsLeft })
                                : t("customer.booking.otp.expired")}
                        </span>
                    </div>
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
                    {!otpLengthOk && otp.length > 0 && (
                        <p className="text-xs text-red-600">{t("customer.booking.otp.invalid")}</p>
                    )}
                    <LTTButton type="button" variant="outline" size="sm" className="mt-1" onClick={resendOtp} disabled={otpSubmitted}>
                        {t("customer.booking.otp.resend")}
                    </LTTButton>
                </div>

                <div className="flex gap-3 pt-2 flex-wrap">
                    <LTTButton
                        variant="outline"
                        size="lg"
                        className="flex-1 min-w-[140px]"
                        onClick={() => router.push(`/booking/${bookingId}/payment`)}
                        disabled={otpSubmitted || verifying}
                    >
                        {(otpSubmitted || verifying) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />
                        )}
                        {t("customer.booking.cta.back")}
                    </LTTButton>
                    <LTTButton
                        size="lg"
                        className="flex-1 min-w-[140px] bg-[#cd1e25] hover:bg-[#a8181d] text-white font-bold"
                        onClick={submitOtp}
                        disabled={!otpValid || otpSubmitted || verifying}
                    >
                        {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />}
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
                    primaryDisabled={!otpValid || otpSubmitted || verifying}
                    primaryLoading={verifying}
                    backLoading={otpSubmitted || verifying}
                    backTo={`/booking/${bookingId}/payment`}
                    skipBackConfirm
                    holdExpiresAtMs={bookingState.seatHoldExpiresAt}
                    holdExpiredToast={false}
                    onSeatHoldExpired={() =>
                        navigateAfterSeatHoldExpired(router, {
                            bookingId,
                            movieId: bookingState.movieId ?? showtime.movieId,
                            releaseHold:
                                showtime.id && bookingId
                                    ? () => customerShowtimeService.releaseSeatHoldAsync(showtime.id, bookingId)
                                    : undefined,
                        })
                    }
                />
            </div>
        </div>
    );
}
