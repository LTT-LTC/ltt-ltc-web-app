"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { BOOKING_PAYMENT_MOCK_SUCCESS } from "@/src/@core/booking/bookingPaymentConfig";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { clearBookingState, saveBookingState } from "@/src/@core/booking/bookingState";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";
import { useLocalization } from "@/src/@core/hooks/use-localization";
type ProcessingStatus = "idle" | "submitting" | "polling" | "succeeded" | "failed";

export default function BookingProcessingPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();

    const { bookingState, showtime, loading } = useBookingContext(bookingId);

    const [status, setStatus] = useState<ProcessingStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [paymentRef, setPaymentRef] = useState<string | null>(null);
    const startedRef = useRef<boolean>(false);

    useEffect(() => {
        if (loading) return;
        if (startedRef.current) return;

        if (!bookingState || !bookingState.seats?.length || !showtime) {
            startedRef.current = true;
            setStatus("failed");
            setErrorMessage(t("customer.booking.invalid_session"));
            return;
        }

        if (!bookingState.paymentOtpVerified) {
            startedRef.current = true;
            setStatus("failed");
            setErrorMessage(t("customer.booking.processing.otp_required"));
            return;
        }

        startedRef.current = true;

        const runSuccessTimers = (ref: string) => {
            setPaymentRef(ref);
            if (bookingId) {
                saveBookingState(bookingId, { paymentRef: ref });
            }
            setStatus("polling");
            window.setTimeout(() => {
                setStatus("succeeded");
                if (bookingId) {
                    void (async () => {
                        if (showtime?.id) {
                            await customerShowtimeService.releaseSeatHoldAsync(showtime.id, bookingId).catch(() => {});
                        }
                        clearBookingState(bookingId);
                    })();
                }
                window.setTimeout(() => {
                    router.push("/my-ltc/transaction-history");
                }, 1500);
            }, 1800);
        };

        const submit = async () => {
            setStatus("submitting");
            if (BOOKING_PAYMENT_MOCK_SUCCESS) {
                runSuccessTimers(`mock-${Date.now()}`);
                return;
            }

            setStatus("failed");
            setErrorMessage(t("customer.booking.processing.gateway_only"));
        };

        void submit();
    }, [loading, bookingState, showtime, bookingId, router, t]);

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 max-w-xl mx-auto text-center space-y-5">
            {status === "succeeded" ? (
                <>
                    <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500" />
                    <h2 className="text-2xl font-bold text-gray-900">{t("customer.booking.processing.success_title")}</h2>
                    <p className="text-sm text-gray-500">
                        {t("customer.booking.processing.success_subtitle")}
                    </p>
                    {paymentRef && (
                        <p className="text-xs text-gray-400">
                            {t("customer.booking.processing.payment_ref")}: <span className="font-mono">{paymentRef}</span>
                        </p>
                    )}
                </>
            ) : status === "failed" ? (
                <>
                    <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900">{t("customer.booking.processing.failed_title")}</h2>
                    <p className="text-sm text-gray-500">
                        {errorMessage || t("customer.booking.processing.error")}
                    </p>
                    <div className="flex justify-center gap-3 pt-2 flex-wrap">
                        <LTTButton variant="outline" onClick={() => router.push(`/booking/${bookingId}/payment`)}>
                            {t("customer.booking.cta.back_to_payment")}
                        </LTTButton>
                        <LTTButton onClick={() => router.push("/theaters/all-cinemas")}>
                            {t("customer.booking.cta.back_to_theaters")}
                        </LTTButton>
                    </div>
                </>
            ) : (
                <>
                    <Loader2 className="h-16 w-16 mx-auto text-[#cd1e25] animate-spin" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        {status === "submitting"
                            ? t("customer.booking.processing.submitting_title")
                            : t("customer.booking.processing.polling_title")}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t("customer.booking.processing.subtitle")}
                    </p>
                </>
            )}
        </div>
    );
}
