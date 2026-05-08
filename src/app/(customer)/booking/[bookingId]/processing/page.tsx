"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { clearBookingState, saveBookingState } from "@/src/@core/booking/bookingState";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import {
    customerBookingService,
    type CreateBookingInputDto,
    type CreateBookingItemInputDto,
} from "@/src/services/customer-service/booking/booking.service";

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
        if (!bookingState || !bookingState.seats?.length || !showtime) {
            setStatus("failed");
            setErrorMessage(t("customer.booking.invalid_session"));
            return;
        }
        if (startedRef.current) return;
        startedRef.current = true;

        const items: CreateBookingItemInputDto[] = [];
        bookingState.seats.forEach((seat) => {
            items.push({ itemType: "SEAT", quantity: 1, referenceId: undefined, variantId: undefined });
            void seat;
        });
        bookingState.fnb?.forEach((line) => {
            items.push({ itemType: "PRODUCT", referenceId: line.id, quantity: line.quantity });
        });
        bookingState.combos?.forEach((line) => {
            items.push({ itemType: "COMBO", referenceId: line.id, quantity: line.quantity });
        });

        const payload: CreateBookingInputDto = {
            showtimeId: showtime.id,
            paymentMethod: bookingState.paymentMethod,
            items,
        };

        const submit = async () => {
            setStatus("submitting");
            try {
                const booking = await customerBookingService.createBookingAsync(payload);
                const ref = booking?.id || `pending-${Date.now()}`;
                setPaymentRef(ref);
                if (bookingId) {
                    saveBookingState(bookingId, { paymentRef: ref });
                }
                setStatus("polling");
                window.setTimeout(() => {
                    setStatus("succeeded");
                    if (bookingId) {
                        clearBookingState(bookingId);
                    }
                    window.setTimeout(() => {
                        router.push("/my-ltc/transaction-history");
                    }, 1500);
                }, 1800);
            } catch (e) {
                setStatus("failed");
                setErrorMessage(e instanceof Error ? e.message : t("customer.booking.processing.error"));
            }
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
                    <div className="flex justify-center gap-3 pt-2">
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
