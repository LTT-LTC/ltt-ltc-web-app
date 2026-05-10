"use client";

import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export interface TicketLine {
    label: string;
    value: string;
    accent?: boolean;
}

export interface MovieTicketSummaryMovie {
    title: string;
    originalTitle?: string;
    posterUrl?: string;
    ageRating?: string;
    durationMins?: number;
}

interface MovieTicketProps {
    movie: MovieTicketSummaryMovie;
    format?: string;
    cinemaName: string;
    screenLabel: string;
    showtimeLabel: string;
    selectedSeats: string[];
    basePrice: number;
    ticketTotal: number;
    extrasTotal?: number;
    discount?: number;
    extraLines?: TicketLine[];
    primaryActionLabel: string;
    onPrimaryAction: () => void;
    primaryDisabled?: boolean;
    /** Optional secondary CTA below the primary one. */
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    /** Where the back arrow returns to. Defaults to history.back(). */
    backTo?: string;
    /** Run before navigating back (e.g. release Redis seat hold). Swallowed errors do not block navigation. */
    onBeforeBack?: () => void | Promise<void>;
    /** Disable the back-confirmation dialog. */
    skipBackConfirm?: boolean;
    /** Epoch ms when the server-side seat hold expires (confirm step onward). */
    holdExpiresAtMs?: number;
    /** Called when the hold timer reaches zero (e.g. navigate back to seat selection). */
    onSeatHoldExpired?: () => void;
    primaryLoading?: boolean;
    backLoading?: boolean;
}

export const formatVND = (n: number) => `${Math.round(n).toLocaleString("vi-VN", { maximumFractionDigits: 0 })} ₫`;

export default function MovieTicket({
    movie,
    format,
    cinemaName,
    screenLabel,
    showtimeLabel,
    selectedSeats,
    basePrice,
    ticketTotal,
    extrasTotal = 0,
    discount = 0,
    extraLines = [],
    primaryActionLabel,
    onPrimaryAction,
    primaryDisabled,
    secondaryActionLabel,
    onSecondaryAction,
    backTo,
    onBeforeBack,
    skipBackConfirm,
    holdExpiresAtMs,
    onSeatHoldExpired,
    primaryLoading = false,
    backLoading = false,
}: MovieTicketProps) {
    const { t } = useLocalization();
    const router = useRouter();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [holdTimeLeftLabel, setHoldTimeLeftLabel] = useState<string | null>(null);
    const holdExpiredFired = useRef(false);

    const total = Math.max(0, ticketTotal + extrasTotal - discount);
    const emptyPh = t("customer.booking.field.empty_placeholder");

    useEffect(() => {
        if (!holdExpiresAtMs) {
            return;
        }

        holdExpiredFired.current = false;

        const tick = () => {
            const ms = holdExpiresAtMs - Date.now();
            if (ms <= 0) {
                setHoldTimeLeftLabel("0:00");
                if (!holdExpiredFired.current) {
                    holdExpiredFired.current = true;
                    toast.error(t("customer.booking.ticket.hold_expired_toast"));
                    onSeatHoldExpired?.();
                }
                return;
            }
            const totalSec = Math.floor(ms / 1000);
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            setHoldTimeLeftLabel(`${m}:${s.toString().padStart(2, "0")}`);
        };

        const id = window.setInterval(tick, 1000);
        const raf = window.requestAnimationFrame(() => {
            tick();
        });
        return () => {
            window.cancelAnimationFrame(raf);
            window.clearInterval(id);
        };
    }, [holdExpiresAtMs, onSeatHoldExpired, t]);

    const performBack = async () => {
        try {
            await onBeforeBack?.();
        } catch {
            /* non-blocking */
        }
        if (backTo) {
            router.push(backTo);
        } else {
            router.back();
        }
    };

    const handleBack = () => {
        if (backLoading || primaryLoading) return;
        if (skipBackConfirm) {
            void performBack();
        } else {
            setConfirmOpen(true);
        }
    };

    return (
        <>
            <div className="relative bg-white border border-gray-100 rounded-2xl shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#cd1e25] text-white">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={backLoading || primaryLoading}
                        className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {backLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                            <ArrowLeft className="h-4 w-4" />
                        )}
                        {t("customer.booking.ticket.back")}
                    </button>
                    <span className="text-xs font-bold tracking-wider">{t("customer.booking.ticket.stub_title")}</span>
                </div>

                <div className="relative h-4 bg-white">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-200" />
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#f5f6f8] border border-gray-200" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#f5f6f8] border border-gray-200" />
                </div>

                <div className="p-4 flex gap-3">
                    <div className="w-24 aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {movie.posterUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] text-gray-500 text-center p-1">{movie.title}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-gray-900 line-clamp-2">{movie.title}</h3>
                        {movie.originalTitle && (
                            <p className="text-xs text-gray-500 mt-0.5">{movie.originalTitle}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {format && (
                                <span className="inline-flex rounded bg-gray-100 text-gray-700 px-1.5 py-0.5 text-[10px] font-semibold">
                                    {format}
                                </span>
                            )}
                            {movie.ageRating && (
                                <span className="inline-flex rounded bg-[#cd1e25] text-white px-1.5 py-0.5 text-[10px] font-bold">
                                    {movie.ageRating}
                                </span>
                            )}
                            {typeof movie.durationMins === "number" && movie.durationMins > 0 && (
                                <span className="inline-flex rounded bg-gray-100 text-gray-600 px-1.5 py-0.5 text-[10px]">
                                    {t("customer.booking.ticket.duration_mins", { mins: movie.durationMins })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-4 space-y-1.5 text-xs">
                    <Row label={t("customer.booking.field.cinema")} value={cinemaName || emptyPh} />
                    <Row label={t("customer.booking.field.screen")} value={screenLabel || emptyPh} />
                    <Row label={t("customer.booking.field.showtime")} value={showtimeLabel || emptyPh} />
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-gray-500 shrink-0 pt-0.5">{t("customer.booking.field.seats")}</span>
                        <div className="flex flex-col items-end gap-1 min-w-0">
                            <span className={`font-medium text-right ${selectedSeats.length ? "text-gray-900" : "text-gray-400"}`}>
                                {selectedSeats.length ? selectedSeats.join(", ") : t("customer.booking.ticket.no_seats_selected")}
                            </span>
                            {holdExpiresAtMs != null && holdTimeLeftLabel != null && (
                                <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-900 border-2 border-amber-300 px-3 py-1.5 text-sm font-extrabold tabular-nums tracking-tight shadow-sm">
                                    {t("customer.booking.ticket.hold_timer", { time: holdTimeLeftLabel })}
                                </span>
                            )}
                        </div>
                    </div>
                    <Row
                        label={t("customer.booking.ticket.price_row_label")}
                        value={t("customer.booking.ticket.price_per_seat", { price: formatVND(basePrice) })}
                    />
                </div>

                <div className="relative h-4 bg-white">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-200" />
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#f5f6f8] border border-gray-200" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#f5f6f8] border border-gray-200" />
                </div>

                <div className="px-4 py-3 space-y-1.5 text-sm">
                    <Row
                        label={t("customer.booking.ticket.line_tickets", { count: selectedSeats.length })}
                        value={formatVND(ticketTotal)}
                    />
                    {extraLines.map((line) => (
                        <Row key={line.label} label={line.label} value={line.value} accent={line.accent} />
                    ))}
                    {discount > 0 && (
                        <Row label={t("customer.booking.summary.discount")} value={`-${formatVND(discount)}`} accent />
                    )}
                    <div className="border-t border-dashed border-gray-200 pt-2 flex items-center justify-between">
                        <span className="font-bold text-gray-900">{t("customer.booking.ticket.total")}</span>
                        <span className="font-bold text-lg text-[#cd1e25]">{formatVND(total)}</span>
                    </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                    <LTTButton
                        type="button"
                        size="lg"
                        className="w-full font-bold bg-[#cd1e25] hover:bg-[#a8181d] text-white"
                        onClick={onPrimaryAction}
                        disabled={primaryDisabled || primaryLoading}
                    >
                        {primaryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />}
                        {primaryActionLabel}
                    </LTTButton>
                    {secondaryActionLabel && onSecondaryAction && (
                        <LTTButton
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full"
                            onClick={onSecondaryAction}
                        >
                            {secondaryActionLabel}
                        </LTTButton>
                    )}
                    <p className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
                        <Info className="h-3 w-3" /> {t("customer.booking.ticket.footer_note")}
                    </p>
                </div>
            </div>

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5">
                        <h4 className="font-bold text-base text-gray-900">{t("customer.booking.ticket.back_confirm_title")}</h4>
                        <p className="text-sm text-gray-600 mt-2">{t("customer.booking.ticket.back_confirm_message")}</p>
                        <div className="mt-5 flex justify-end gap-2">
                            <LTTButton variant="outline" onClick={() => setConfirmOpen(false)}>
                                {t("customer.booking.ticket.back_confirm_stay")}
                            </LTTButton>
                            <LTTButton
                                onClick={() => {
                                    setConfirmOpen(false);
                                    void performBack();
                                }}
                            >
                                {t("customer.booking.ticket.back_confirm_leave")}
                            </LTTButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">{label}</span>
            <span className={`font-medium text-right ${accent ? "text-emerald-600" : "text-gray-900"}`}>{value}</span>
        </div>
    );
}
