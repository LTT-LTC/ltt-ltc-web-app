"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { toast } from "sonner";
import MovieTicket, { formatVND } from "@/src/@core/component/customer/MovieTicket";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import {
    customerBookingService,
    type PrepareBookingLineItemDto,
} from "@/src/services/customer-service/booking/booking.service";
import {
    customerProductService,
    type CustomerComboOutputDto,
    type CustomerProductOutputDto,
} from "@/src/services/customer-service/product/product.service";

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

export default function BookingSummaryPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();

    const { bookingState, showtime, screen, cinema, movie, loading: ctxLoading } = useBookingContext(bookingId);

    const [products, setProducts] = useState<CustomerProductOutputDto[]>([]);
    const [combos, setCombos] = useState<CustomerComboOutputDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [continueLoading, setContinueLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const loadCatalog = async () => {
            try {
                const [productsResp, combosResp] = await Promise.all([
                    customerProductService.getProductListAsync({ page: 1, pageSize: 100 }).catch(() => ({ items: [] as CustomerProductOutputDto[], totalCount: 0 })),
                    customerProductService.getComboListAsync({ page: 1, pageSize: 100 }).catch(() => ({ items: [] as CustomerComboOutputDto[], totalCount: 0 })),
                ]);
                if (cancelled) return;
                setProducts(productsResp.items || []);
                setCombos(combosResp.items || []);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void loadCatalog();
        return () => {
            cancelled = true;
        };
    }, []);

    const fnbLines = useMemo(() => {
        return (bookingState?.fnb || []).map((line) => {
            const product = products.find((item) => item.id === line.id);
            return {
                id: line.id,
                name: product?.name || line.id,
                unitPrice: Number(product?.basePrice) || 0,
                quantity: line.quantity,
                lineTotal: (Number(product?.basePrice) || 0) * line.quantity,
            };
        });
    }, [bookingState?.fnb, products]);

    const comboLines = useMemo(() => {
        return (bookingState?.combos || []).map((line) => {
            const combo = combos.find((item) => item.id === line.id);
            return {
                id: line.id,
                name: combo?.name || line.id,
                unitPrice: Number(combo?.totalPrice) || 0,
                quantity: line.quantity,
                lineTotal: (Number(combo?.totalPrice) || 0) * line.quantity,
            };
        });
    }, [bookingState?.combos, combos]);

    const fnbTotal = fnbLines.reduce((sum, line) => sum + line.lineTotal, 0);
    const comboTotal = comboLines.reduce((sum, line) => sum + line.lineTotal, 0);
    const extrasTotal = fnbTotal + comboTotal;
    const discount = bookingState?.discountAmount ?? 0;
    const ticketTotal = bookingState?.ticketTotal ?? 0;
    const grandTotal = Math.max(0, ticketTotal + extrasTotal - discount);

    if (ctxLoading || loading) {
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

    const emptyPh = t("customer.booking.field.empty_placeholder");
    const cinemaName = cinema?.name || emptyPh;
    const screenLabel = screen?.screenNumber
        ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}`
        : emptyPh;
    const showtimeLabel = formatShowtimeLabel(showtime.startTime, showtime.endTime, emptyPh);

    const extraLines: { label: string; value: string }[] = [];
    if (fnbTotal > 0) extraLines.push({ label: t("customer.booking.field.fnb"), value: formatVND(fnbTotal) });
    if (comboTotal > 0) extraLines.push({ label: t("customer.booking.field.combos"), value: formatVND(comboTotal) });

    const handleContinueToPayment = async () => {
        if (!bookingId || !showtime?.id || continueLoading) return;
        setContinueLoading(true);
        try {
            const items: PrepareBookingLineItemDto[] = [];
            const seatN = bookingState.seats.length;
            if (seatN > 0 && ticketTotal > 0) {
                const unit = ticketTotal / seatN;
                items.push({
                    itemType: "SEAT",
                    quantity: seatN,
                    unitPrice: unit,
                    totalPrice: ticketTotal,
                });
            }
            for (const line of fnbLines) {
                items.push({
                    itemType: "PRODUCT",
                    referenceId: line.id,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    totalPrice: line.lineTotal,
                });
            }
            for (const line of comboLines) {
                items.push({
                    itemType: "COMBO",
                    referenceId: line.id,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    totalPrice: line.lineTotal,
                });
            }
            await customerBookingService.prepareBookingForPaymentAsync(bookingId, {
                showtimeId: showtime.id,
                seatCodes: [...bookingState.seats],
                snapshotJson: JSON.stringify({
                    bookingId,
                    grandTotal,
                    ticketTotal,
                    extrasTotal,
                    discount,
                    seats: bookingState.seats,
                    fnb: bookingState.fnb,
                    combos: bookingState.combos,
                }),
                discountAmount: discount,
                totalPrice: grandTotal,
                items,
            });
            router.push(`/booking/${bookingId}/payment`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : t("customer.booking.toast.prepare_booking_failed"));
        } finally {
            setContinueLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t("customer.booking.heading.summary")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("customer.booking.summary.subtitle")}</p>
                </div>

                <SummarySection title={t("customer.booking.summary.tickets")}>
                    <SummaryRow
                        label={`${t("customer.booking.field.seats")}: ${bookingState.seats.join(", ")}`}
                        value={formatVND(ticketTotal)}
                    />
                    <p className="text-xs text-gray-500">{t("customer.booking.summary.tickets_hint", { count: bookingState.seats.length })}</p>
                </SummarySection>

                {fnbLines.length > 0 && (
                    <SummarySection title={t("customer.booking.summary.fnb")}>
                        {fnbLines.map((line) => (
                            <SummaryRow
                                key={line.id}
                                label={`${line.name} × ${line.quantity}`}
                                value={formatVND(line.lineTotal)}
                            />
                        ))}
                    </SummarySection>
                )}

                {comboLines.length > 0 && (
                    <SummarySection title={t("customer.booking.summary.combos")}>
                        {comboLines.map((line) => (
                            <SummaryRow
                                key={line.id}
                                label={`${line.name} × ${line.quantity}`}
                                value={formatVND(line.lineTotal)}
                            />
                        ))}
                    </SummarySection>
                )}

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 text-sm">
                    <SummaryRow label={t("customer.booking.summary.subtotal")} value={formatVND(ticketTotal + extrasTotal)} />
                    {discount > 0 && (
                        <SummaryRow
                            label={`${t("customer.booking.summary.discount")}${bookingState.discountCode ? ` (${bookingState.discountCode})` : ""}`}
                            value={`-${formatVND(discount)}`}
                            accent
                        />
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="font-bold text-gray-900">{t("customer.booking.summary.grand_total")}</span>
                        <span className="text-2xl font-bold text-[#cd1e25]">{formatVND(grandTotal)}</span>
                    </div>
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
                    extrasTotal={extrasTotal}
                    discount={discount}
                    extraLines={extraLines}
                    primaryActionLabel={t("customer.booking.cta.continue_to_payment")}
                    onPrimaryAction={() => void handleContinueToPayment()}
                    primaryLoading={continueLoading}
                    backLoading={continueLoading}
                    primaryDisabled={continueLoading}
                    backTo={`/booking/${bookingId}/extras`}
                    skipBackConfirm
                    holdExpiresAtMs={bookingState.seatHoldExpiresAt}
                    onSeatHoldExpired={() => router.replace(`/booking/${bookingId}/seats`)}
                />
            </div>
        </div>
    );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-gray-500">{title}</p>
            <div className="space-y-1.5">{children}</div>
        </div>
    );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{label}</span>
            <span className={`font-semibold ${accent ? "text-emerald-600" : "text-gray-900"}`}>{value}</span>
        </div>
    );
}
