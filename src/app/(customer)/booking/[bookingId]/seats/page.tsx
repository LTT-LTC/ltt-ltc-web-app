"use client";

import React, { startTransition, Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { Eraser, Pointer } from "lucide-react";
import { toast } from "sonner";
import LTTSeatMapViewer from "@/src/@core/component/LTTManager/LTTSeatMapViewer";
import { type SeatLayoutSeat, type SeatType } from "@/src/@core/const/mock/adminMockData";
import { getCellType } from "@/src/@core/component/LTTManager/seatMapRenderHelpers";
import MovieTicket from "@/src/@core/component/customer/MovieTicket";
import { useBookingContext } from "@/src/@core/booking/useBookingContext";
import { saveBookingState } from "@/src/@core/booking/bookingState";
import { customerShowtimeService } from "@/src/services/customer-service/showtime/showtime.service";
import { subscribeShowtimeSeatMap } from "@/src/@core/booking/showtimeSeatSignalr";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

const buildSeatTypeIndex = (rows: { seats: SeatLayoutSeat[] }[]): Record<string, number> => {
    const index: Record<string, number> = {};
    rows.forEach((row) => {
        row.seats.forEach((seat) => {
            if (getCellType(seat) === "seat" && seat.seatCode) {
                index[seat.seatCode] = seat.seatTypeId ?? 1;
            }
        });
    });
    return index;
};

const buildSeatOccupiedIndex = (rows: { seats: SeatLayoutSeat[] }[]): Record<string, number> => {
    const index: Record<string, number> = {};
    rows.forEach((row) => {
        row.seats.forEach((seat, colIdx) => {
            if (getCellType(seat) !== "seat" || !seat.seatCode) return;
            const seatTypeId = seat.seatTypeId ?? 1;
            let occupied = 1;
            for (let i = colIdx + 1; i < row.seats.length; i += 1) {
                const candidate = row.seats[i];
                if (
                    getCellType(candidate) === "seat" &&
                    !candidate.seatCode &&
                    (candidate.seatTypeId ?? 0) === seatTypeId
                ) {
                    occupied += 1;
                    continue;
                }
                break;
            }
            index[seat.seatCode] = occupied;
        });
    });
    return index;
};

const buildSeatMultiplierIndex = (rows: { seats: SeatLayoutSeat[] }[]): Record<string, number> => {
    const index: Record<string, number> = {};
    rows.forEach((row) => {
        row.seats.forEach((seat) => {
            if (getCellType(seat) !== "seat" || !seat.seatCode) return;
            const configured = Number(seat.seatPriceMultiplier);
            index[seat.seatCode] = Number.isFinite(configured) && configured > 0 ? configured : 1;
        });
    });
    return index;
};

const buildViewerSeatTypes = (rows: { seats: SeatLayoutSeat[] }[]): SeatType[] => {
    const byId = new Map<number, SeatType>();
    rows.forEach((row) => {
        row.seats.forEach((seat) => {
            if (getCellType(seat) !== "seat" || !seat.seatTypeId) return;
            const id = seat.seatTypeId;
            const current = byId.get(id);
            const direction = (seat.seatDisplayDirection || "").toLowerCase();
            const orientation: SeatType["orientation"] = direction.includes("horizontal")
                ? "horizontal"
                : direction.includes("vertical")
                    ? "vertical"
                    : "square";
            const candidate: SeatType = {
                id,
                name: seat.seatTypeName || current?.name || `Seat ${id}`,
                description: current?.description || "",
                priceMultiplier: seat.seatPriceMultiplier ?? current?.priceMultiplier ?? 1,
                seatOccupied: seat.seatOccupied ?? current?.seatOccupied ?? 1,
                orientation: current?.orientation || orientation,
                seatColor: current?.seatColor || seat.seatColor,
                createdAt: "",
                updatedAt: "",
            };
            byId.set(id, candidate);
        });
    });
    return Array.from(byId.values());
};

const buildSeatTypeMultiplierMap = (seatTypes: SeatType[]): Map<number, number> => {
    const map = new Map<number, number>();
    seatTypes.forEach((seatType) => {
        const multiplier = Number(seatType.priceMultiplier);
        if (Number.isFinite(multiplier) && multiplier > 0) {
            map.set(seatType.id, multiplier);
        }
    });
    return map;
};

const normSeat = (code: string) => code.trim().toUpperCase();

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

function SeatPickPageContent() {
    const { t } = useLocalization();
    const params = useParams<{ bookingId: string }>();
    const bookingId = params.bookingId;
    const searchParams = useSearchParams();
    const router = useRouter();

    const bootstrap = useMemo(
        () => ({
            showtimeId: searchParams.get("showtimeId") || undefined,
            cinemaId: searchParams.get("cinemaId") || undefined,
            screenId: searchParams.get("screenId") || undefined,
            movieId: searchParams.get("movieId") || undefined,
        }),
        [searchParams]
    );

    const { bookingState, showtime, screen, seatLayout, cinema, movie, loading, error } = useBookingContext(bookingId, bootstrap);

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [groupDragMode, setGroupDragMode] = useState<boolean>(false);
    const [heldByOthers, setHeldByOthers] = useState<Set<string>>(new Set());
    const [navPending, startNavTransition] = useTransition();
    const [holdSubmitting, setHoldSubmitting] = useState(false);
    const holdBusy = holdSubmitting || navPending;

    const bookedSeats = useMemo(() => {
        if (!showtime) return new Set<string>();

        const rawHeld = showtime.heldSeatCodes;
        const rawLegacy =
            ((showtime as unknown as { bookedSeatCodes?: unknown }).bookedSeatCodes as unknown) ??
            ((showtime as unknown as { bookedSeats?: unknown }).bookedSeats as unknown);
        const rawBooked = Array.isArray(rawHeld) && rawHeld.length > 0 ? rawHeld : rawLegacy ?? [];

        if (!Array.isArray(rawBooked)) return new Set<string>();

        const values = rawBooked
            .map((item) => {
                if (typeof item === "string") return item.trim();
                if (item && typeof item === "object" && "seatCode" in item) {
                    const seatCode = (item as { seatCode?: unknown }).seatCode;
                    return typeof seatCode === "string" ? seatCode.trim() : "";
                }
                return "";
            })
            .filter((x): x is string => !!x);

        return new Set(values);
    }, [showtime]);

    const blockedSeats = useMemo(() => {
        const s = new Set<string>();
        bookedSeats.forEach((c) => s.add(normSeat(c)));
        heldByOthers.forEach((c) => s.add(normSeat(c)));
        return s;
    }, [bookedSeats, heldByOthers]);

    useEffect(() => {
        if (!showtime?.id || !bookingId) {
            return;
        }

        const { start, stop } = subscribeShowtimeSeatMap(showtime.id, (payload) => {
            setHeldByOthers((prev) => {
                const next = new Set(prev);
                const codes = (payload.seatCodes ?? []).map((c) => normSeat(c)).filter(Boolean);
                if (payload.kind === "held") {
                    if (payload.sessionKey === bookingId) {
                        return prev;
                    }
                    codes.forEach((c) => next.add(c));
                } else if (payload.kind === "released" || payload.kind === "expired") {
                    codes.forEach((c) => next.delete(c));
                }
                return next;
            });
        });

        void start().catch(() => {
            /* SignalR optional when gateway offline */
        });

        return () => {
            void stop().catch(() => {});
        };
    }, [showtime?.id, bookingId]);

    useEffect(() => {
        if (bookingState?.seats?.length) {
            startTransition(() => {
                setSelected(new Set(bookingState.seats.filter((seatCode) => !blockedSeats.has(normSeat(seatCode)))));
            });
        }
    }, [bookingState?.seats, blockedSeats]);

    const seatTypeIndex = useMemo(() => {
        if (!seatLayout?.rows) return {};
        return buildSeatTypeIndex(seatLayout.rows);
    }, [seatLayout]);
    const seatOccupiedIndex = useMemo(() => {
        if (!seatLayout?.rows) return {};
        return buildSeatOccupiedIndex(seatLayout.rows);
    }, [seatLayout]);
    const seatMultiplierIndex = useMemo(() => {
        if (!seatLayout?.rows) return {};
        return buildSeatMultiplierIndex(seatLayout.rows);
    }, [seatLayout]);
    const viewerSeatTypes = useMemo<SeatType[]>(
        () => (seatLayout?.rows ? buildViewerSeatTypes(seatLayout.rows) : []),
        [seatLayout]
    );
    const seatTypeMultiplierMap = useMemo(
        () => buildSeatTypeMultiplierMap(viewerSeatTypes),
        [viewerSeatTypes]
    );

    const basePrice = showtime?.ticketPrice ?? 0;
    const ticketTotal = useMemo(() => {
        return Array.from(selected).reduce((sum, code) => {
            const typeId = seatTypeIndex[code] ?? 1;
            const configuredMultiplier =
                seatTypeMultiplierMap.get(typeId) ??
                seatMultiplierIndex[code] ??
                1;
            const occupiedMultiplier = seatOccupiedIndex[code] ?? 1;
            const multiplier = Math.max(configuredMultiplier, occupiedMultiplier);
            return sum + basePrice * multiplier;
        }, 0);
    }, [selected, seatTypeIndex, seatTypeMultiplierMap, seatMultiplierIndex, seatOccupiedIndex, basePrice]);

    const toggleSeat = (seatCode: string) => {
        if (blockedSeats.has(normSeat(seatCode))) return;
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(seatCode)) {
                next.delete(seatCode);
            } else {
                next.add(seatCode);
            }
            return next;
        });
    };

    const clearAllSelected = () => {
        setSelected(new Set());
        if (showtime?.id && bookingId) {
            void customerShowtimeService.releaseSeatHoldAsync(showtime.id, bookingId).catch(() => {});
            saveBookingState(bookingId, { seatHoldExpiresAt: undefined });
        }
    };

    const chooseGroupSeats = () => {
        setGroupDragMode(true);
        toast.message(t("customer.booking.toast.drag_to_select_group"));
    };

    const applyDraggedSeats = (seatCodes: string[]) => {
        if (!seatCodes.length) return;
        setSelected((current) => {
            const next = new Set(current);
            seatCodes.forEach((code) => {
                if (!blockedSeats.has(normSeat(code))) next.add(code);
            });
            return next;
        });
        setGroupDragMode(false);
    };

    const handleNext = async () => {
        if (selected.size === 0) {
            toast.error(t("customer.booking.toast.pick_seats"));
            return;
        }
        if (!bookingId || !showtime?.id || holdSubmitting) {
            return;
        }
        setHoldSubmitting(true);
        try {
            await customerShowtimeService.releaseSeatHoldAsync(showtime.id, bookingId).catch(() => {});
            const out = await customerShowtimeService.holdSeatsAsync({
                showtimeId: showtime.id,
                seatCodes: Array.from(selected),
                sessionKey: bookingId,
            });
            const expires = Date.parse(out.heldUntilUtc);
            saveBookingState(bookingId, {
                seats: Array.from(selected),
                ticketTotal,
                basePrice,
                seatHoldExpiresAt: expires,
            });
            startNavTransition(() => {
                router.push(`/booking/${bookingId}/confirm-seats`);
            });
        } catch (e) {
            const raw = e instanceof Error ? e.message : "";
            toast.error(
                raw.toLowerCase().includes("seat") || raw.toLowerCase().includes("ghế")
                    ? raw || t("customer.booking.toast.seat_hold_conflict")
                    : t("customer.booking.toast.seat_hold_failed"),
            );
        } finally {
            setHoldSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.loading")}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center space-y-2 text-gray-600">
                <p>{t("customer.booking.seats_error_showtime_load")}</p>
                <p className="text-xs text-gray-400 break-words">{error}</p>
            </div>
        );
    }

    if (!bookingState?.showtimeId) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.seats_error_no_context")}
            </div>
        );
    }

    if (!showtime) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.invalid_session")}
            </div>
        );
    }

    if (!screen || !seatLayout || seatLayout.rows.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.seats_error_layout")}
            </div>
        );
    }

    const emptyPh = t("customer.booking.field.empty_placeholder");
    const screenLabel = screen.screenNumber
        ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}`
        : emptyPh;
    const cinemaName = cinema?.name || emptyPh;
    const showtimeLabel = formatShowtimeLabel(showtime.startTime, showtime.endTime, emptyPh);

    return (
        <div className="space-y-4">
            <div className="bg-[#1f1f1f] text-white text-center py-3 rounded-t-lg font-bold tracking-widest">
                {t("customer.booking.heading.seats")}
            </div>
            <div className="bg-gray-50 px-4 py-3 text-sm border border-gray-100 rounded-b-lg -mt-4">
                <p className="font-semibold text-gray-800">
                    {cinemaName} | {screenLabel}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{showtimeLabel}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <LTTButton type="button" variant={groupDragMode ? "default" : "outline"} className="gap-2" onClick={chooseGroupSeats}>
                            <Pointer className="h-4 w-4" />
                            {t("customer.booking.cta.choose_group_seats")}
                        </LTTButton>
                        <LTTButton type="button" variant="outline" className="gap-2" onClick={clearAllSelected} disabled={selected.size === 0}>
                            <Eraser className="h-4 w-4" />
                            {t("customer.booking.cta.clear_selected_seats")}
                        </LTTButton>
                        {groupDragMode && (
                            <p className="text-xs text-muted-foreground-shadcn">
                                {t("customer.booking.toast.drag_to_select_group")}
                            </p>
                        )}
                    </div>
                    <LTTSeatMapViewer
                        seatLayout={seatLayout}
                        seatTypes={viewerSeatTypes}
                        selectedSeats={selected}
                        bookedSeats={blockedSeats}
                        onSeatClick={toggleSeat}
                        dragSelectMode={groupDragMode}
                        onDragSelectSeats={applyDraggedSeats}
                        showLegend
                    />
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
                        selectedSeats={Array.from(selected)}
                        basePrice={basePrice}
                        ticketTotal={ticketTotal}
                        primaryActionLabel={t("customer.booking.cta.next")}
                        onPrimaryAction={() => void handleNext()}
                        primaryDisabled={selected.size === 0 || holdBusy}
                        primaryLoading={holdBusy}
                        backLoading={holdBusy}
                        backTo="/theaters/all-cinemas"
                        onBeforeBack={
                            showtime?.id && bookingId
                                ? () => customerShowtimeService.releaseSeatHoldAsync(showtime.id, bookingId).catch(() => {})
                                : undefined
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default function SeatPickPage() {
    const { t } = useLocalization();
    return (
        <Suspense
            fallback={
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                    {t("customer.booking.loading")}
                </div>
            }
        >
            <SeatPickPageContent />
        </Suspense>
    );
}
