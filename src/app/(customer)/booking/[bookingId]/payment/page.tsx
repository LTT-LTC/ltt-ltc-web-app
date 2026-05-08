"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Banknote, CreditCard, Smartphone, Building2 } from "lucide-react";
import MovieTicket from "@/src/@core/component/customer/MovieTicket";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { saveBookingState, type BookingPaymentMethod } from "@/src/@core/booking/bookingState";
import { useLocalization } from "@/src/@core/hooks/use-localization";

const PAYMENT_OPTIONS: { id: BookingPaymentMethod; labelKey: string; hintKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "cash", labelKey: "customer.booking.payment_method.cash.label", hintKey: "customer.booking.payment_method.cash.hint", icon: Banknote },
    { id: "card", labelKey: "customer.booking.payment_method.card.label", hintKey: "customer.booking.payment_method.card.hint", icon: CreditCard },
    { id: "momo", labelKey: "customer.booking.payment_method.momo.label", hintKey: "customer.booking.payment_method.momo.hint", icon: Smartphone },
    { id: "bank", labelKey: "customer.booking.payment_method.bank.label", hintKey: "customer.booking.payment_method.bank.hint", icon: Building2 },
];

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

export default function BookingPaymentPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();

    const { bookingState, showtime, screen, cinema, movie, loading } = useBookingContext(bookingId);

    const [selected, setSelected] = useState<BookingPaymentMethod | null>(bookingState?.paymentMethod ?? null);

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.loading")}
            </div>
        );
    }

    if (!bookingState || !bookingState.seats?.length || !showtime) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.invalid_session")}
            </div>
        );
    }

    const cinemaName = cinema?.name || "—";
    const screenLabel = screen?.screenNumber
        ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}`
        : "—";
    const showtimeLabel = formatShowtimeLabel(showtime.startTime, showtime.endTime);

    const handleConfirm = () => {
        if (!selected) {
            return;
        }
        if (!bookingId) return;
        saveBookingState(bookingId, { paymentMethod: selected });
        router.push(`/booking/${bookingId}/processing`);
    };

    const ticketTotal = bookingState.ticketTotal ?? 0;
    const fnbCount = bookingState.fnb?.length ?? 0;
    const comboCount = bookingState.combos?.length ?? 0;
    const discount = bookingState.discountAmount ?? 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t("customer.booking.heading.payment")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("customer.booking.payment.subtitle")}</p>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                        {t("customer.booking.payment.method_section")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PAYMENT_OPTIONS.map(({ id, labelKey, hintKey, icon: Icon }) => {
                            const isActive = selected === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelected(id)}
                                    className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                                        isActive
                                            ? "border-[#cd1e25] bg-[#fff5f5] shadow-sm"
                                            : "border-gray-200 bg-white hover:border-[#cd1e25]/40"
                                    }`}
                                >
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                            isActive ? "bg-[#cd1e25] text-white" : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold ${isActive ? "text-[#cd1e25]" : "text-gray-900"}`}>
                                            {t(labelKey)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{t(hintKey)}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-1.5 text-sm">
                    <Row label={t("customer.booking.summary.tickets")} value={`${bookingState.seats.length} ${t("customer.booking.summary.tickets_unit")}`} />
                    {fnbCount > 0 && <Row label={t("customer.booking.summary.fnb")} value={`${fnbCount} ${t("customer.booking.summary.items_unit")}`} />}
                    {comboCount > 0 && <Row label={t("customer.booking.summary.combos")} value={`${comboCount} ${t("customer.booking.summary.items_unit")}`} />}
                </div>

                <div className="flex gap-3 pt-2">
                    <LTTButton
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={() => router.push(`/booking/${bookingId}/summary`)}
                    >
                        {t("customer.booking.cta.back")}
                    </LTTButton>
                    <LTTButton
                        size="lg"
                        className="flex-1 bg-[#cd1e25] hover:bg-[#a8181d] text-white font-bold"
                        onClick={handleConfirm}
                        disabled={!selected}
                    >
                        {t("customer.booking.cta.confirm_payment")}
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
                    ticketTotal={ticketTotal}
                    discount={discount}
                    primaryActionLabel={t("customer.booking.cta.confirm_payment")}
                    onPrimaryAction={handleConfirm}
                    primaryDisabled={!selected}
                    backTo={`/booking/${bookingId}/summary`}
                    skipBackConfirm
                />
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-900">{value}</span>
        </div>
    );
}
