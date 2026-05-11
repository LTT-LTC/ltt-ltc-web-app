"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import MovieTicket, { formatVND } from "@/src/@core/component/customer/MovieTicket";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogFooter,
    LTTDialogHeader,
    LTTDialogTitle,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import {
    LTTSelect,
    LTTSelectContent,
    LTTSelectItem,
    LTTSelectTrigger,
    LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { clearBookingState, saveBookingState } from "@/src/@core/booking/bookingState";
import { navigateAfterSeatHoldExpired } from "@/src/@core/booking/seatHoldExpiredNavigation";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import {
    customerProductService,
    type CustomerComboOutputDto,
    type CustomerProductOutputDto,
} from "@/src/services/customer-service/product/product.service";
import { customerBookingService } from "@/src/services/customer-service/booking/booking.service";
import { vnpayPaymentService } from "@/src/services/payment-service/vnpay.service";
import { toast } from "sonner";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";

const CARD_DIGITS_MAX = 19;

const digitsOnly = (value: string): string => value.replace(/\D/g, "");

const formatCardGroups = (raw: string): string => {
    const d = digitsOnly(raw).slice(0, CARD_DIGITS_MAX);
    return d.replace(/(\d{4})(?=\d)/g, "$1 ").trimEnd();
};

const formatExpiryInput = (raw: string): string => {
    const d = digitsOnly(raw).slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
};

const isValidExpiryMmYy = (mmYy: string): boolean => {
    const m = /^(\d{2})\/(\d{2})$/.exec(mmYy);
    if (!m) return false;
    const month = Number.parseInt(m[1], 10);
    if (month < 1 || month > 12) return false;
    return true;
};

const isAsciiPrintableName = (name: string): boolean => /^[\x20-\x7E]+$/.test(name.trim());

const isCardValid = (digits: string): boolean => digits.length >= 13 && digits.length <= CARD_DIGITS_MAX;

const maskLastFour = (lastFour: string): string => `•••• •••• •••• ${lastFour}`;

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

type PayMethod = "card" | "vnpay";

const CARD_BANK_CODES = ["NCB", "JCB", "BIDV", "VCB"] as const;

const CARD_BANK_LABEL_KEY: Record<(typeof CARD_BANK_CODES)[number], string> = {
    NCB: "customer.booking.payment.bank_ncb",
    JCB: "customer.booking.payment.bank_jcb",
    BIDV: "customer.booking.payment.bank_bidv",
    VCB: "customer.booking.payment.bank_vcb",
};

const readApiErrorDetail = (e: unknown): string => {
    if (typeof e === "object" && e !== null && "response" in e) {
        const data = (e as { response?: { data?: unknown } }).response?.data;
        if (data && typeof data === "object") {
            const d = data as Record<string, unknown>;
            if (typeof d.message === "string") return d.message;
            const err = d.error as Record<string, unknown> | undefined;
            if (err && typeof err.message === "string") return String(err.message);
        }
    }
    if (e instanceof Error) return e.message;
    return "";
};

export default function BookingPaymentPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();

    const searchParams = useSearchParams();
    const isVnpayReturn = searchParams.get("vnpay") === "1";
    const vnpayStatus = searchParams.get("status");
    const vnpaySuccess = isVnpayReturn && vnpayStatus === "success";

    const { bookingState, showtime, screen, cinema, movie, loading } = useBookingContext(bookingId);

    const vnpayCleanedRef = useRef(false);

    useEffect(() => {
        if (!vnpaySuccess || !bookingId || vnpayCleanedRef.current) return;
        vnpayCleanedRef.current = true;
        (async () => {
            if (showtime?.id) {
                await customerShowtimeService.releaseSeatHoldAsync(showtime.id, bookingId).catch(() => {});
            }
            clearBookingState(bookingId);
        })();
    }, [vnpaySuccess, bookingId, showtime?.id]);

    const [cardNumberDisplay, setCardNumberDisplay] = useState("");
    const [holderName, setHolderName] = useState("");
    const [expiryDisplay, setExpiryDisplay] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [payMethod, setPayMethod] = useState<PayMethod>("vnpay");
    const [selectedBankCode, setSelectedBankCode] = useState<string>("");
    const [vnpayRedirecting, setVnpayRedirecting] = useState(false);
    const [cardConfirmLoading, setCardConfirmLoading] = useState(false);

    const [products, setProducts] = useState<CustomerProductOutputDto[]>([]);
    const [combos, setCombos] = useState<CustomerComboOutputDto[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(true);

    useEffect(() => {
        if (bookingId) {
            saveBookingState(bookingId, { paymentOtpVerified: false });
        }
    }, [bookingId]);

    useEffect(() => {
        let cancelled = false;
        const loadCatalog = async () => {
            try {
                const [productsResp, combosResp] = await Promise.all([
                    customerProductService.getProductListAsync({ page: 1, pageSize: 100 }).catch(() => ({
                        items: [] as CustomerProductOutputDto[],
                        totalCount: 0,
                    })),
                    customerProductService.getComboListAsync({ page: 1, pageSize: 100 }).catch(() => ({
                        items: [] as CustomerComboOutputDto[],
                        totalCount: 0,
                    })),
                ]);
                if (cancelled) return;
                setProducts(productsResp.items || []);
                setCombos(combosResp.items || []);
            } finally {
                if (!cancelled) setCatalogLoading(false);
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

    const cardDigits = useMemo(() => digitsOnly(cardNumberDisplay), [cardNumberDisplay]);
    const expiryNorm = expiryDisplay.trim();

    if (loading || catalogLoading) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.loading")}
            </div>
        );
    }

    if (vnpaySuccess) {
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
                            onClick={() => router.push("/my-ltc/transaction-history")}
                        >
                            {t("customer.booking.payment.vnpay_result.back_booking")}
                        </LTTButton>
                    </div>
                </div>

                {showtime && (
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
                            cinemaName={cinema?.name ?? "—"}
                            screenLabel={
                                screen?.screenNumber
                                    ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}`
                                    : "—"
                            }
                            showtimeLabel={formatShowtimeLabel(showtime.startTime, showtime.endTime, "—")}
                            selectedSeats={bookingState?.seats ?? []}
                            basePrice={bookingState?.basePrice ?? 0}
                            ticketTotal={bookingState?.ticketTotal ?? 0}
                            extrasTotal={extrasTotal}
                            discount={bookingState?.discountAmount ?? 0}
                            primaryActionLabel={t("customer.booking.payment.vnpay_result.back_booking")}
                            onPrimaryAction={() => router.push("/my-ltc/transaction-history")}
                            skipBackConfirm
                        />
                    </div>
                )}
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

    const holderTrim = holderName.trim();
    const formValid =
        isCardValid(cardDigits) &&
        holderTrim.length > 0 &&
        isAsciiPrintableName(holderTrim) &&
        isValidExpiryMmYy(expiryNorm) &&
        CARD_BANK_CODES.includes(selectedBankCode as (typeof CARD_BANK_CODES)[number]);

    const openConfirm = () => {
        if (!formValid || !bookingId) return;
        setConfirmOpen(true);
    };

    const confirmAndGoToOtp = async () => {
        if (!bookingId || !formValid || cardConfirmLoading) return;
        setCardConfirmLoading(true);
        try {
            await customerBookingService.updateBookingPaymentMethodAsync(bookingId, "card");
            const orderInfo = `${movieTitle} — ${bookingId}`.slice(0, 255);
            const paymentUrl = await vnpayPaymentService.createVnPayPaymentUrlAsync({
                bookingId,
                amount: Math.round(grandTotal),
                orderInfo,
                locale: undefined,
                bankCode: selectedBankCode,
            });
            const lastFour = cardDigits.slice(-4);
            saveBookingState(bookingId, {
                paymentMethod: "card",
                cardHolderDisplay: holderTrim,
                cardExpiryDisplay: expiryNorm,
                cardLastFour: lastFour,
                pendingVnpayPaymentUrl: paymentUrl,
                selectedBankCode,
                paymentOtpVerified: false,
            });
            setConfirmOpen(false);
            router.push(`/booking/${bookingId}/payment/otp`);
        } catch (e) {
            const detail = readApiErrorDetail(e);
            toast.error(
                detail
                    ? `${t("customer.booking.payment.card_prepare_failed")}: ${detail}`
                    : t("customer.booking.payment.card_prepare_failed")
            );
        } finally {
            setCardConfirmLoading(false);
        }
    };

    const ticketTotal = bookingState.ticketTotal ?? 0;
    const fnbCount = bookingState.fnb?.length ?? 0;
    const comboCount = bookingState.combos?.length ?? 0;
    const discount = bookingState.discountAmount ?? 0;
    const grandTotal = Math.max(0, ticketTotal + extrasTotal - discount);

    const maskedForDialog = maskLastFour(cardDigits.slice(-4));

    const movieTitle = movie?.title ?? showtime.movie?.title ?? emptyPh;

    const pickPayMethod = (method: PayMethod) => {
        setPayMethod(method);
        if (method === "vnpay" && bookingId) {
            saveBookingState(bookingId, {
                pendingVnpayPaymentUrl: undefined,
                selectedBankCode: undefined,
            });
        }
    };

    const startVnpay = async () => {
        if (!bookingId || grandTotal <= 0 || vnpayRedirecting) return;
        setVnpayRedirecting(true);
        try {
            await customerBookingService.updateBookingPaymentMethodAsync(bookingId, "vnpay");
            saveBookingState(bookingId, { paymentMethod: "vnpay" });
            const orderInfo = `${movieTitle} — ${bookingId}`.slice(0, 255);
            const paymentUrl = await vnpayPaymentService.createVnPayPaymentUrlAsync({
                bookingId,
                amount: Math.round(grandTotal),
                orderInfo,
                locale: undefined,
            });
            window.location.href = paymentUrl;
        } catch (e) {
            const detail = readApiErrorDetail(e);
            toast.error(
                detail ? `${t("customer.booking.payment.vnpay_error")} (${detail})` : t("customer.booking.payment.vnpay_error")
            );
            setVnpayRedirecting(false);
        }
    };

    const paymentBusy = vnpayRedirecting || cardConfirmLoading;
    const primaryDisabled = paymentBusy || (payMethod === "card" ? !formValid : grandTotal <= 0);
    const primaryLabel =
        payMethod === "card" ? t("customer.booking.cta.confirm_payment") : t("customer.booking.payment.vnpay_pay");
    const onPrimary = payMethod === "card" ? openConfirm : () => void startVnpay();

    const methodBox = (method: PayMethod, icon: React.ReactNode, title: string, hint: string) => {
        const active = payMethod === method;
        return (
            <button
                type="button"
                onClick={() => pickPayMethod(method)}
                className={`w-full rounded-xl border-2 px-4 py-3.5 flex items-start gap-3 shadow-sm text-left transition-colors ${
                    active ? "border-[#cd1e25] bg-[#fff5f5]" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            >
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${
                        active ? "bg-[#cd1e25]" : "bg-gray-400"
                    }`}
                >
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className={`text-sm font-bold ${active ? "text-[#cd1e25]" : "text-gray-900"}`}>{title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{hint}</p>
                </div>
            </button>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t("customer.booking.heading.payment")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("customer.booking.payment.subtitle_methods")}</p>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                        {t("customer.booking.payment.method_section")}
                    </h3>
                    <div className="space-y-3">
                        {methodBox(
                            "vnpay",
                            <Wallet className="h-5 w-5" />,
                            t("customer.booking.payment.vnpay_label"),
                            t("customer.booking.payment.vnpay_hint")
                        )}
                    </div>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200 space-y-2">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{t("customer.booking.summary.grand_total")}: </span>
                        {formatVND(grandTotal)}
                    </p>
                    <p className="text-xs text-gray-500">{t("customer.booking.payment.vnpay_hint")}</p>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-1.5 text-sm">
                    <Row label={t("customer.booking.summary.tickets")} value={`${bookingState.seats.length} ${t("customer.booking.summary.tickets_unit")}`} />
                    {fnbCount > 0 && (
                        <Row label={t("customer.booking.summary.fnb")} value={`${fnbCount} ${t("customer.booking.summary.items_unit")}`} />
                    )}
                    {comboCount > 0 && (
                        <Row label={t("customer.booking.summary.combos")} value={`${comboCount} ${t("customer.booking.summary.items_unit")}`} />
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <LTTButton
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={() => router.push(`/booking/${bookingId}/summary`)}
                        disabled={paymentBusy}
                    >
                        {paymentBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />}
                        {t("customer.booking.cta.back")}
                    </LTTButton>
                    <LTTButton
                        size="lg"
                        className="flex-1 bg-[#cd1e25] hover:bg-[#a8181d] text-white font-bold"
                        onClick={onPrimary}
                        disabled={primaryDisabled}
                    >
                        {vnpayRedirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />}
                        {primaryLabel}
                    </LTTButton>
                </div>
            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
                <MovieTicket
                    movie={{
                        title: movieTitle,
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
                    primaryActionLabel={primaryLabel}
                    onPrimaryAction={onPrimary}
                    primaryDisabled={primaryDisabled}
                    primaryLoading={paymentBusy}
                    backLoading={paymentBusy}
                    backTo={`/booking/${bookingId}/summary`}
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

            <LTTDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <LTTDialogContent className="sm:max-w-md bg-white">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{t("customer.booking.card_confirm.title")}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="space-y-3 text-sm text-gray-700 py-1">
                        <p className="text-muted-foreground-shadcn">{t("customer.booking.card_confirm.message")}</p>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                            <div className="flex justify-between gap-2">
                                <span className="text-gray-500">{t("customer.booking.card_confirm.card_number")}</span>
                                <span className="font-mono font-semibold text-gray-900">{maskedForDialog}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-gray-500">{t("customer.booking.card_confirm.card_holder")}</span>
                                <span className="font-semibold text-gray-900 text-right break-all">{holderTrim}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span className="text-gray-500">{t("customer.booking.card_confirm.expiry")}</span>
                                <span className="font-mono font-semibold text-gray-900">{expiryNorm}</span>
                            </div>
                        </div>
                    </div>
                    <LTTDialogFooter className="gap-3">
                        <LTTButton variant="outline" onClick={() => setConfirmOpen(false)} className="flex-1" disabled={cardConfirmLoading}>
                            {t("customer.booking.card_confirm.cancel")}
                        </LTTButton>
                        <LTTButton
                            onClick={() => void confirmAndGoToOtp()}
                            className="flex-1 bg-[#cd1e25] hover:bg-[#a8181d] text-white"
                            disabled={cardConfirmLoading}
                        >
                            {cardConfirmLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />}
                            {t("customer.booking.card_confirm.confirm")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
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
