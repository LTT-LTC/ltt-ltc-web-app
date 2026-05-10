"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export default function VnpayBookingFailurePage() {
    const { t } = useLocalization();
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("bookingId");

    return (
        <div className="max-w-lg mx-auto bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center space-y-4">
            <div className="flex justify-center">
                <XCircle className="h-14 w-14 text-[#cd1e25]" aria-hidden />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t("customer.booking.payment.vnpay_result.failure_title")}</h1>
            <p className="text-sm text-gray-600">{t("customer.booking.payment.vnpay_result.failure_body")}</p>
            {bookingId ? (
                <LTTButton className="w-full bg-[#cd1e25] hover:bg-[#a8181d] text-white" onClick={() => router.push(`/booking/${bookingId}/payment`)}>
                    {t("customer.booking.payment.vnpay_result.retry")}
                </LTTButton>
            ) : (
                <LTTButton variant="outline" className="w-full" onClick={() => router.push("/")}>
                    {t("customer.booking.payment.vnpay_result.home")}
                </LTTButton>
            )}
        </div>
    );
}
