"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { clearBookingState } from "@/src/@core/booking/bookingState";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";
import { customerBookingService, type BookingOutputDto } from "@/src/services/customer-service/booking/booking.service";
import { customerShowtimeService as showtimeService, type CustomerShowtimeOutputDto } from "@/src/services/customer-service/showtime/showtime.service";
import { vnpayPaymentService } from "@/src/services/payment-service/vnpay.service";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import MovieTicket from "@/src/@core/component/customer/MovieTicket";
import { toast } from "sonner";

type ProcessingStatus = "idle" | "polling" | "succeeded" | "failed";

function parseSnapshot(json?: string | null) {
    if (!json) return {} as Record<string, any>;
    try {
        return JSON.parse(json) as Record<string, any>;
    } catch {
        return {} as Record<string, any>;
    }
}

function formatShowtimeLabel(start?: string | null, end?: string | null, fallback = "—") {
    if (!start) return fallback;
    const s = new Date(start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const e = end ? new Date(end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : null;
    return e ? `${s} - ${e}` : s;
}

export default function BookingProcessingPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();
    const searchParams = useSearchParams();

    const { bookingState, showtime, movie, screen, cinema, loading: contextLoading } = useBookingContext(bookingId);

    const [status, setStatus] = useState<ProcessingStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [pollingAttempts, setPollingAttempts] = useState(0);
    const [pollingTimeout, setPollingTimeout] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<BookingOutputDto | null>(null);
    const [confirmedShowtime, setConfirmedShowtime] = useState<CustomerShowtimeOutputDto | null>(null);
    const startedRef = useRef<boolean>(false);
    const isVnpayReturn = searchParams.get("vnpay") === "1";
    const gatewayStatus = searchParams.get("status");

    // Handle VNPay return and poll for booking confirmation
    useEffect(() => {
        if (contextLoading || !bookingId) return;
        if (startedRef.current) return;

        // Handle VNPay failure
        if (isVnpayReturn && gatewayStatus === "failed") {
            startedRef.current = true;
            setStatus("failed");
            setErrorMessage(t("customer.booking.payment.vnpay_result.failure_body"));
            return;
        }

        // For VNPay success or direct access, start polling for confirmation
        startedRef.current = true;
        setStatus("polling");

        const pollForConfirmation = async () => {
            const maxAttempts = 30; // 60 seconds max
            let attempts = 0;

            const checkBookingStatus = async (): Promise<BookingOutputDto | null> => {
                try {
                    const booking = await customerBookingService.getBookingAsync(bookingId);
                    console.log("[Processing] Booking status:", booking.bookingStatus, "payment:", booking.paymentStatus);
                    if (booking && (booking.paymentStatus === "PAID" || booking.bookingStatus === "CONFIRMED")) {
                        return booking;
                    }
                    return null;
                } catch (err) {
                    console.error("[Processing] Error checking booking:", err);
                    return null;
                }
            };

            let booking = await checkBookingStatus();

            while (!booking && attempts < maxAttempts) {
                attempts++;
                setPollingAttempts(attempts);
                console.log(`[Processing] Polling attempt ${attempts}/${maxAttempts}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                booking = await checkBookingStatus();
            }

            if (booking) {
                console.log("[Processing] Booking confirmed!");
                setConfirmedBooking(booking);
                setConfirmedShowtime(showtime);
                setStatus("succeeded");

                // Clear booking state and release seat hold
                if (showtime?.id) {
                    await customerShowtimeService.releaseSeatHoldAsync(showtime.id, bookingId).catch(() => { });
                }
                clearBookingState(bookingId);
            } else {
                console.warn("[Processing] Timeout waiting for confirmation");
                setPollingTimeout(true);
                // Try to get current booking state for display
                const currentBooking = await customerBookingService.getBookingAsync(bookingId).catch(() => null);
                setConfirmedBooking(currentBooking);
            }
        };

        void pollForConfirmation();
    }, [contextLoading, bookingId, isVnpayReturn, gatewayStatus, showtime, t]);

    const handleRefreshStatus = async () => {
        if (!bookingId) return;
        setPollingTimeout(false);
        try {
            const booking = await customerBookingService.getBookingAsync(bookingId);
            if (booking && (booking.paymentStatus === "PAID" || booking.bookingStatus === "CONFIRMED")) {
                setConfirmedBooking(booking);
                setStatus("succeeded");
                toast.success("Payment confirmed successfully!");
            } else {
                // Try manual completion trigger
                const result = await vnpayPaymentService.manualCompleteVnPayPaymentAsync(bookingId);
                if (result.success) {
                    toast.success(result.message || "Completion triggered, checking again...");
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const recheck = await customerBookingService.getBookingAsync(bookingId);
                    if (recheck && (recheck.paymentStatus === "PAID" || recheck.bookingStatus === "CONFIRMED")) {
                        setConfirmedBooking(recheck);
                        setStatus("succeeded");
                    }
                } else {
                    toast.warning(result.message || "Still processing, please wait...");
                }
            }
        } catch (err) {
            console.error("[Processing] Refresh error:", err);
            toast.error("Unable to check status. Please try again.");
        }
    };

    const handleViewTickets = () => {
        router.push("/my-ltc/transaction-history");
    };

    // Loading state
    if (contextLoading) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 max-w-xl mx-auto text-center space-y-5">
                <Loader2 className="h-16 w-16 mx-auto text-[#cd1e25] animate-spin" />
                <h2 className="text-2xl font-bold text-gray-900">{t("customer.booking.loading")}</h2>
            </div>
        );
    }

    // Failed state
    if (status === "failed") {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 max-w-xl mx-auto text-center space-y-5">
                <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900">{t("customer.booking.processing.failed_title")}</h2>
                <p className="text-sm text-gray-500">{errorMessage || t("customer.booking.processing.error")}</p>
                <div className="flex justify-center gap-3 pt-2 flex-wrap">
                    <LTTButton variant="outline" onClick={() => router.push(`/booking/${bookingId}/payment`)}>
                        {t("customer.booking.cta.back_to_payment")}
                    </LTTButton>
                    <LTTButton onClick={() => router.push("/theaters/all-cinemas")}>
                        {t("customer.booking.cta.back_to_theaters")}
                    </LTTButton>
                </div>
            </div>
        );
    }

    // Success state with ticket display (Step 6)
    if (status === "succeeded" && confirmedBooking) {
        const snap = parseSnapshot(confirmedBooking.snapshotJson);
        const confirmedSeats = confirmedBooking.seatCodes
            ? confirmedBooking.seatCodes.split(",").map((s) => s.trim()).filter(Boolean)
            : (snap.seats ?? []);
        const confirmedTicketTotal = snap.ticketTotal ?? confirmedBooking.totalPrice ?? 0;
        const confirmedExtrasTotal = snap.extrasTotal ?? 0;
        const confirmedDiscount = snap.discount ?? confirmedBooking.discountAmount ?? 0;
        const detailShowtime = confirmedShowtime ?? showtime;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center space-y-5">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        {t("customer.booking.processing.success_title")}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t("customer.booking.payment.vnpay_result.success_body")}
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                        <LTTButton
                            className="bg-[#cd1e25] hover:bg-[#a8181d] text-white"
                            onClick={handleViewTickets}
                        >
                            {t("customer.booking.payment.vnpay_result.back_booking")}
                        </LTTButton>
                    </div>
                </div>

                <div className="lg:sticky lg:top-4 lg:self-start">
                    <MovieTicket
                        movie={{
                            title: detailShowtime?.movie?.title ?? movie?.title ?? "—",
                            originalTitle: detailShowtime?.movie?.originalTitle ?? movie?.originalTitle,
                            posterUrl: detailShowtime?.movie?.posterUrl ?? movie?.posterUrl,
                            ageRating: detailShowtime?.movie?.ratingCode ?? movie?.ratingCode,
                            durationMins: detailShowtime?.movie?.durationMins ?? movie?.durationMins ?? detailShowtime?.durationMins,
                        }}
                        format={detailShowtime?.movieFormat ?? showtime?.movieFormat ?? "—"}
                        cinemaName={cinema?.name ?? "—"}
                        screenLabel={
                            detailShowtime?.screenName
                                ? `${t("customer.booking.room")} ${detailShowtime.screenName}`
                                : screen?.screenNumber
                                    ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}`
                                    : "—"
                        }
                        showtimeLabel={formatShowtimeLabel(detailShowtime?.startTime ?? showtime?.startTime, detailShowtime?.endTime ?? showtime?.endTime, "—")}
                        selectedSeats={confirmedSeats}
                        basePrice={confirmedSeats.length > 0 ? confirmedTicketTotal / confirmedSeats.length : 0}
                        ticketTotal={confirmedTicketTotal}
                        extrasTotal={confirmedExtrasTotal}
                        discount={confirmedDiscount}
                        primaryActionLabel={t("customer.booking.payment.vnpay_result.back_booking")}
                        onPrimaryAction={handleViewTickets}
                        skipBackConfirm
                    />
                </div>
            </div>
        );
    }

    // Polling / Timeout state (Step 5 - Processing)
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center space-y-5">
                {pollingTimeout ? (
                    <>
                        <div className="h-16 w-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Payment Processing Taking Longer Than Expected
                        </h2>
                        <p className="text-sm text-gray-500">
                            Your payment may have been processed successfully, but we're still waiting for confirmation from our servers.
                        </p>
                        <div className="flex justify-center gap-3 pt-2">
                            <LTTButton variant="outline" onClick={handleRefreshStatus}>
                                Check Status Again
                            </LTTButton>
                            <LTTButton
                                className="bg-[#cd1e25] hover:bg-[#a8181d] text-white"
                                onClick={handleViewTickets}
                            >
                                View My Tickets
                            </LTTButton>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">
                            Current status: {confirmedBooking?.paymentStatus || "Unknown"} / {confirmedBooking?.bookingStatus || "Unknown"}
                        </p>
                    </>
                ) : (
                    <>
                        <Loader2 className="h-16 w-16 mx-auto text-[#cd1e25] animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            Processing your payment...
                        </h2>
                        <p className="text-sm text-gray-500">
                            Please wait while we confirm your payment. This may take a few seconds.
                        </p>
                        <p className="text-xs text-gray-400">
                            Attempt {pollingAttempts}/30
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
