"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { seatTypeService } from "@/src/services/administration-service/seat-type/seat-type.service";
import type { SeatTypeOutputDto } from "@/src/services/administration-service/seat-type/models/output.model";

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

export default function SeatPickPage() {
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
    const [seatTypes, setSeatTypes] = useState<SeatTypeOutputDto[]>([]);

    const bookedSeats = useMemo(() => {
        if (!showtime) return new Set<string>();

        const rawBooked =
            ((showtime as unknown as { bookedSeatCodes?: unknown }).bookedSeatCodes as unknown) ??
            ((showtime as unknown as { bookedSeats?: unknown }).bookedSeats as unknown) ??
            [];

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

    useEffect(() => {
        if (bookingState?.seats?.length) {
            setSelected(new Set(bookingState.seats.filter((seatCode) => !bookedSeats.has(seatCode))));
        }
    }, [bookingState?.seats, bookedSeats]);

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

    useEffect(() => {
        let cancelled = false;
        const loadSeatTypes = async () => {
            try {
                const res = await seatTypeService.getSeatTypeListAsync({ page: 1, fetch: 200 });
                if (!cancelled) setSeatTypes(res?.items ?? []);
            } catch {
                if (!cancelled) setSeatTypes([]);
            }
        };
        void loadSeatTypes();
        return () => {
            cancelled = true;
        };
    }, []);

    const seatTypeMultiplierMap = useMemo(() => {
        const fromApi = new Map<number, number>();
        seatTypes.forEach((seatType) => {
            const id = Number(seatType.id);
            if (!Number.isFinite(id)) return;
            const multiplier = Number(seatType.priceMultiplier);
            if (Number.isFinite(multiplier) && multiplier > 0) {
                fromApi.set(id, multiplier);
            }
        });
        return fromApi;
    }, [seatTypes]);

    const viewerSeatTypes = useMemo<SeatType[]>(() => {
        if (seatTypes.length === 0) return [];
        return seatTypes.map((seatType) => {
            const id = Number(seatType.id);
            const normalizedId = Number.isFinite(id) ? id : 0;
            const direction = (seatType.displayDirection || "").toLowerCase();
            const orientation: SeatType["orientation"] = direction.includes("horizontal")
                ? "horizontal"
                : direction.includes("vertical")
                    ? "vertical"
                    : "square";
            return {
                id: normalizedId,
                name: seatType.name,
                description: seatType.description || "",
                priceMultiplier: Number(seatType.priceMultiplier) || 1,
                seatOccupied: seatType.numberOfSeat > 0 ? seatType.numberOfSeat : 1,
                orientation,
                createdAt: "",
                updatedAt: seatType.updatedAt || "",
            };
        });
    }, [seatTypes]);

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
        if (bookedSeats.has(seatCode)) return;
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
                if (!bookedSeats.has(code)) next.add(code);
            });
            return next;
        });
        setGroupDragMode(false);
    };

    const handleNext = () => {
        if (selected.size === 0) {
            toast.error(t("customer.booking.toast.pick_seats"));
            return;
        }
        if (!bookingId) {
            return;
        }
        saveBookingState(bookingId, {
            seats: Array.from(selected),
            ticketTotal,
            basePrice,
        });
        router.push(`/booking/${bookingId}/confirm-seats`);
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.loading")}
            </div>
        );
    }

    if (error || !showtime || !screen || !seatLayout || seatLayout.rows.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-10 text-center text-gray-500">
                {t("customer.booking.invalid_session")}
            </div>
        );
    }

    const screenLabel = screen.screenNumber ? `${t("customer.booking.room")} ${screen.screenNumber}${screen.screenType ? ` (${screen.screenType})` : ""}` : "—";
    const cinemaName = cinema?.name || "—";

    return (
        <div className="space-y-4">
            <div className="bg-[#1f1f1f] text-white text-center py-3 rounded-t-lg font-bold tracking-widest">
                {t("customer.booking.heading.seats")}
            </div>
            <div className="bg-gray-50 px-4 py-3 text-sm border border-gray-100 rounded-b-lg -mt-4">
                <p className="font-semibold text-gray-800">
                    {cinemaName} | {screenLabel}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{formatShowtimeLabel(showtime.startTime, showtime.endTime)}</p>
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
                        bookedSeats={bookedSeats}
                        onSeatClick={toggleSeat}
                        dragSelectMode={groupDragMode}
                        onDragSelectSeats={applyDraggedSeats}
                        showLegend
                    />
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
                        showtimeLabel={formatShowtimeLabel(showtime.startTime, showtime.endTime)}
                        selectedSeats={Array.from(selected)}
                        basePrice={basePrice}
                        ticketTotal={ticketTotal}
                        primaryActionLabel={t("customer.booking.cta.next")}
                        onPrimaryAction={handleNext}
                        primaryDisabled={selected.size === 0}
                        backTo="/theaters/all-cinemas"
                    />
                </div>
            </div>
        </div>
    );
}
