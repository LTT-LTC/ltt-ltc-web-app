"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import MovieTicket, { formatVND } from "@/src/@core/component/customer/MovieTicket";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { saveBookingState } from "@/src/@core/booking/bookingState";
import { navigateAfterSeatHoldExpired } from "@/src/@core/booking/seatHoldExpiredNavigation";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import {
    customerProductService,
    type CustomerComboOutputDto,
    type CustomerProductOutputDto,
} from "@/src/services/customer-service/product/product.service";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";

const QtyStepper = ({ qty, onChange }: { qty: number; onChange: (delta: number) => void }) => (
    <div className="flex items-center gap-1 shrink-0">
        <button
            type="button"
            onClick={() => onChange(-1)}
            disabled={qty === 0}
            className="h-7 w-7 inline-flex items-center justify-center rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
        >
            <Minus className="h-3 w-3" />
        </button>
        <span className="w-7 text-center text-sm font-bold tabular-nums">{qty}</span>
        <button
            type="button"
            onClick={() => onChange(1)}
            className="h-7 w-7 inline-flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
        >
            <Plus className="h-3 w-3" />
        </button>
    </div>
);

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

export default function BookingExtrasPage() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const router = useRouter();

    const { bookingState, showtime, screen, cinema, movie, loading: ctxLoading, error } = useBookingContext(bookingId);

    const [products, setProducts] = useState<CustomerProductOutputDto[]>([]);
    const [combos, setCombos] = useState<CustomerComboOutputDto[]>([]);
    const [productQty, setProductQty] = useState<Map<string, number>>(new Map());
    const [comboQty, setComboQty] = useState<Map<string, number>>(new Map());
    const [productsLoading, setProductsLoading] = useState<boolean>(true);
    const [navPending, startNavTransition] = useTransition();

    useEffect(() => {
        if (!bookingState?.fnb) return;
        setProductQty(new Map(bookingState.fnb.map((line) => [line.id, line.quantity])));
    }, [bookingState?.fnb]);
    useEffect(() => {
        if (!bookingState?.combos) return;
        setComboQty(new Map(bookingState.combos.map((line) => [line.id, line.quantity])));
    }, [bookingState?.combos]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [productsResp, combosResp] = await Promise.all([
                    customerProductService.getProductListAsync({ page: 1, pageSize: 100 }).catch(() => ({ items: [] as CustomerProductOutputDto[], totalCount: 0 })),
                    customerProductService.getComboListAsync({ page: 1, pageSize: 100 }).catch(() => ({ items: [] as CustomerComboOutputDto[], totalCount: 0 })),
                ]);
                if (cancelled) return;
                setProducts((productsResp.items || []).filter((p) => p.isActive));
                setCombos((combosResp.items || []).filter((c) => c.isActive));
            } catch (e) {
                if (!cancelled) {
                    toast.error(e instanceof Error ? e.message : t("customer.booking.toast.fetch_extras_error"));
                }
            } finally {
                if (!cancelled) setProductsLoading(false);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, [t]);

    const setQty = (
        map: Map<string, number>,
        update: (next: Map<string, number>) => void,
        id: string,
        delta: number,
    ) => {
        const next = new Map(map);
        const value = Math.max(0, (next.get(id) || 0) + delta);
        if (value === 0) {
            next.delete(id);
        } else {
            next.set(id, value);
        }
        update(next);
    };

    const productTotal = useMemo(() => {
        return Array.from(productQty.entries()).reduce((sum, [id, qty]) => {
            const product = products.find((item) => item.id === id);
            return sum + (Number(product?.basePrice) || 0) * qty;
        }, 0);
    }, [productQty, products]);

    const comboTotal = useMemo(() => {
        return Array.from(comboQty.entries()).reduce((sum, [id, qty]) => {
            const combo = combos.find((item) => item.id === id);
            return sum + (Number(combo?.totalPrice) || 0) * qty;
        }, 0);
    }, [comboQty, combos]);

    const extrasTotal = productTotal + comboTotal;
    const ticketTotal = bookingState?.ticketTotal ?? 0;
    const basePrice = bookingState?.basePrice ?? 0;

    const handleNext = () => {
        if (!bookingId || navPending) return;
        startNavTransition(() => {
            saveBookingState(bookingId, {
                fnb: Array.from(productQty.entries()).map(([id, quantity]) => ({ id, quantity })),
                combos: Array.from(comboQty.entries()).map(([id, quantity]) => ({ id, quantity })),
            });
            router.push(`/booking/${bookingId}/summary`);
        });
    };

    if (ctxLoading || productsLoading) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.loading")}
            </div>
        );
    }

    if (error || !bookingState || !bookingState.seats?.length || !showtime) {
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
    if (productTotal > 0) extraLines.push({ label: t("customer.booking.field.fnb"), value: formatVND(productTotal) });
    if (comboTotal > 0) extraLines.push({ label: t("customer.booking.field.combos"), value: formatVND(comboTotal) });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 my-3">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t("customer.booking.extras.products_heading")}</h2>
                    {products.length === 0 ? (
                        <p className="text-sm text-gray-500">{t("customer.booking.extras.empty_products")}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                            {products.map((product) => {
                                const qty = productQty.get(product.id) || 0;
                                return (
                                    <div key={product.id} className="flex gap-3 rounded-lg border border-gray-200 p-3 hover:border-[#cd1e25] transition-colors min-h-[112px]">
                                        <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center mt-0.5">
                                            {product.imageUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] text-gray-500 text-center p-1">{product.name}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <h4 className="font-semibold text-sm line-clamp-1 text-gray-900">{product.name}</h4>
                                            {product.description && (
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{product.description}</p>
                                            )}
                                            <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
                                                <span className="font-bold text-[#cd1e25] text-sm whitespace-nowrap">{formatVND(Number(product.basePrice) || 0)}</span>
                                                <QtyStepper qty={qty} onChange={(d) => setQty(productQty, setProductQty, product.id, d)} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t("customer.booking.extras.combos_heading")}</h2>
                    {combos.length === 0 ? (
                        <p className="text-sm text-gray-500">{t("customer.booking.extras.empty_combos")}</p>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {combos.map((combo) => {
                                const qty = comboQty.get(combo.id) || 0;
                                return (
                                    <div key={combo.id} className="flex gap-3 rounded-lg border border-gray-200 p-3 hover:border-[#cd1e25] transition-colors min-h-[132px]">
                                        <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                            {combo.imageUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={combo.imageUrl} alt={combo.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] text-gray-500 text-center p-1">{combo.name}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <h4 className="font-semibold text-sm text-gray-900">{combo.name}</h4>
                                            {combo.description && (
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{combo.description}</p>
                                            )}
                                            {combo.products && combo.products.length > 0 && (
                                                <ul className="mt-1 text-[10px] text-gray-500 space-y-0.5">
                                                    {combo.products.map((line) => (
                                                        <li key={`${combo.id}-${line.productId}`}>
                                                            •{" "}
                                                            {t("customer.booking.extras.combo_line_item", {
                                                                name: line.product?.name ?? line.productId,
                                                                qty: line.quantity,
                                                            })}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
                                                <span className="font-bold text-[#cd1e25] text-sm whitespace-nowrap">{formatVND(Number(combo.totalPrice) || 0)}</span>
                                                <QtyStepper qty={qty} onChange={(d) => setQty(comboQty, setComboQty, combo.id, d)} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
                    basePrice={basePrice}
                    ticketTotal={ticketTotal}
                    extrasTotal={extrasTotal}
                    extraLines={extraLines}
                    primaryActionLabel={t("customer.booking.cta.continue_to_summary")}
                    onPrimaryAction={handleNext}
                    primaryLoading={navPending}
                    backLoading={navPending}
                    primaryDisabled={navPending}
                    backTo={`/booking/${bookingId}/confirm-seats`}
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
