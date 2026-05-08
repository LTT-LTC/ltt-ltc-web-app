"use client";

import { ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

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
    /** Disable the back-confirmation dialog. */
    skipBackConfirm?: boolean;
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
    skipBackConfirm,
}: MovieTicketProps) {
    const router = useRouter();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const total = Math.max(0, ticketTotal + extrasTotal - discount);

    const performBack = () => {
        if (backTo) {
            router.push(backTo);
        } else {
            router.back();
        }
    };

    const handleBack = () => {
        if (skipBackConfirm) {
            performBack();
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
                        className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </button>
                    <span className="text-xs font-bold tracking-wider">VÉ XEM PHIM</span>
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
                                    {movie.durationMins} phút
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-4 space-y-1.5 text-xs">
                    <Row label="Rạp" value={cinemaName || "—"} />
                    <Row label="Phòng" value={screenLabel || "—"} />
                    <Row label="Suất chiếu" value={showtimeLabel || "—"} />
                    <Row label="Ghế" value={selectedSeats.length ? selectedSeats.join(", ") : "Chưa chọn"} />
                    <Row label="Giá vé" value={`${formatVND(basePrice)} / ghế`} />
                </div>

                <div className="relative h-4 bg-white">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-200" />
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#f5f6f8] border border-gray-200" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#f5f6f8] border border-gray-200" />
                </div>

                <div className="px-4 py-3 space-y-1.5 text-sm">
                    <Row label={`Vé (${selectedSeats.length})`} value={formatVND(ticketTotal)} />
                    {extraLines.map((line) => (
                        <Row key={line.label} label={line.label} value={line.value} accent={line.accent} />
                    ))}
                    {discount > 0 && (
                        <Row label="Giảm giá" value={`-${formatVND(discount)}`} accent />
                    )}
                    <div className="border-t border-dashed border-gray-200 pt-2 flex items-center justify-between">
                        <span className="font-bold text-gray-900">Tổng</span>
                        <span className="font-bold text-lg text-[#cd1e25]">{formatVND(total)}</span>
                    </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                    <LTTButton
                        type="button"
                        size="lg"
                        className="w-full font-bold bg-[#cd1e25] hover:bg-[#a8181d] text-white"
                        onClick={onPrimaryAction}
                        disabled={primaryDisabled}
                    >
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
                        <Info className="h-3 w-3" /> Vé đã đặt không hoàn trả.
                    </p>
                </div>
            </div>

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5">
                        <h4 className="font-bold text-base text-gray-900">Quay lại?</h4>
                        <p className="text-sm text-gray-600 mt-2">
                            Lựa chọn hiện tại sẽ được lưu tạm để bạn có thể quay lại sau. Bạn có chắc muốn rời khỏi trang?
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <LTTButton variant="outline" onClick={() => setConfirmOpen(false)}>
                                Ở lại
                            </LTTButton>
                            <LTTButton
                                onClick={() => {
                                    setConfirmOpen(false);
                                    performBack();
                                }}
                            >
                                Quay lại
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
