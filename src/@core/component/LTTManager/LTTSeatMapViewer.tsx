"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Footprints, AlertTriangle, DoorOpen } from "lucide-react";
import { cn } from "@/src/@core/utils/cn";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import {
  type SeatLayout,
  type SeatLayoutSeat,
  type SeatType,
} from "@/src/@core/const/mock/adminMockData";
import {
  extractSeatNumber,
  getCellType,
  getSeatMergeClasses,
  resolveContinuationNumber,
} from "@/src/@core/component/LTTManager/seatMapRenderHelpers";
import { getSeatTypeAppearance } from "@/src/@core/component/LTTManager/seatTypeColor";

// ────────────────────────────────────────────────────────────────────────────
// Props

export interface LTTSeatMapViewerProps {
  /** The serialised seat layout produced by the wizard. */
  seatLayout: SeatLayout;
  /** Codes of seats the user has selected (interactive booking flow). */
  selectedSeats?: Set<string>;
  /** Codes of seats already booked (staff heatmap / read-only view). */
  bookedSeats?: Set<string>;
  /** Called when a selectable seat is clicked (interactive mode). */
  onSeatClick?: (seatCode: string) => void;
  /** Enable drag to select multiple available seats. */
  dragSelectMode?: boolean;
  /** Called when drag selection ends with collected seat codes. */
  onDragSelectSeats?: (seatCodes: string[]) => void;
  /**
   * When true, seats cannot be clicked and hover effects are removed.
   * Used for staff heatmap and manager layout view.
   */
  readOnly?: boolean;
  /** Show the perspective "screen" bar at the top. Default true. */
  showScreen?: boolean;
  /**
   * Reduce cell size for compact contexts such as the staff heatmap panel.
   * Default `false` (standard 28 px cells).
   */
  compact?: boolean;
  /** Optional list of seat types for the legend. */
  seatTypes?: SeatType[];
  /** Show the legend strip below the grid. Default true. */
  showLegend?: boolean;
  className?: string;
}

// ────────────────────────────────────────────────────────────────────────────

export default function LTTSeatMapViewer({
  seatLayout,
  selectedSeats,
  bookedSeats,
  onSeatClick,
  dragSelectMode = false,
  onDragSelectSeats,
  readOnly = false,
  showScreen = true,
  compact = false,
  seatTypes = [],
  showLegend = true,
  className,
}: LTTSeatMapViewerProps) {
  const { t } = useLocalization();
  const cellSize = compact ? "h-5 w-5" : "h-7 w-7";
  const cellText = compact ? "text-[7px]" : "text-[8px]";
  const gap      = "gap-0.5";
  const labelW   = compact ? "w-5" : "w-8";
  const [isDragging, setIsDragging] = useState(false);
  const [dragCodes, setDragCodes] = useState<Set<string>>(new Set());
  const dragCodesRef = useRef<Set<string>>(new Set());

  // Detect which seat types are actually used in this layout
  const usedTypeIds = useMemo(() => {
    const ids = new Set<number>();
    seatLayout.rows.forEach((row) =>
      row.seats.forEach((seat) => {
        if (getCellType(seat) === "seat" && seat.seatTypeId) ids.add(seat.seatTypeId);
      })
    );
    return ids;
  }, [seatLayout]);

  const mergedSeatTypes = useMemo<SeatType[]>(() => {
    const byId = new Map<number, SeatType>();

    seatTypes.forEach((st) => {
      byId.set(st.id, st);
    });

    seatLayout.rows.forEach((row) => {
      row.seats.forEach((seat) => {
        if (getCellType(seat) !== "seat" || !seat.seatTypeId) return;
        const id = seat.seatTypeId;
        if (!byId.has(id)) {
          byId.set(id, {
            id,
            name: seat.seatTypeName || `Seat ${id}`,
            description: "",
            priceMultiplier: seat.seatPriceMultiplier ?? 1,
            seatOccupied: seat.seatOccupied ?? 1,
            orientation: seat.seatDisplayDirection ?? "square",
            seatColor: seat.seatColor,
            createdAt: "",
            updatedAt: "",
          });
          return;
        }

        const current = byId.get(id)!;
        const nextName =
          seat.seatTypeName && current.name !== seat.seatTypeName ? seat.seatTypeName : current.name;
        const nextColor = current.seatColor || seat.seatColor;
        if (nextName !== current.name || nextColor !== current.seatColor) {
          byId.set(id, { ...current, name: nextName, seatColor: nextColor });
        }
      });
    });

    return Array.from(byId.values());
  }, [seatTypes, seatLayout]);

  const activeSeatTypes = mergedSeatTypes.filter((st) => usedTypeIds.has(st.id));

  const collectDragCode = (code: string) => {
    if (!code) return;
    setDragCodes((prev) => {
      if (prev.has(code)) return prev;
      const next = new Set(prev);
      next.add(code);
      dragCodesRef.current = next;
      return next;
    });
  };

  const endDragSelection = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const picked = Array.from(dragCodesRef.current);
    if (picked.length > 0) {
      onDragSelectSeats?.(picked);
    }
    dragCodesRef.current = new Set();
    setDragCodes(new Set());
  };

  useEffect(() => {
    if (!dragSelectMode) {
      setIsDragging(false);
      dragCodesRef.current = new Set();
      setDragCodes(new Set());
      return;
    }

    const onWindowMouseUp = () => endDragSelection();
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [dragSelectMode, isDragging]);

  // ── Cell rendering helpers ────────────────────────────────────────────────

  const getSeatCellVisual = (seat: SeatLayoutSeat, code: string): { className: string; style?: CSSProperties } => {
    const ct = getCellType(seat);

    if (ct === "walkway")        return { className: "bg-muted-shadcn" };
    if (ct === "emergency_exit") return { className: "bg-orange-100" };
    if (ct === "door")           return { className: "bg-green-100" };
    if (ct === "empty")          return { className: "bg-muted-shadcn/30 border-dashed border-border-shadcn/40" };

    const isBooked   = bookedSeats?.has(code);
    const isSelected = selectedSeats?.has(code);

    if (isBooked)   return { className: "bg-gray-400 border-gray-500" };
    if (isSelected) return { className: "bg-primary-shadcn border-primary-shadcn scale-105 shadow-sm" };

    const seatType = mergedSeatTypes.find((st) => st.id === (seat.seatTypeId ?? 0));
    const hex = seat.seatColor ?? seatType?.seatColor;
    return getSeatTypeAppearance(hex, seat.seatTypeId, seatType?.name);
  };

  // Dedicated helper for border-band cells (doors/exits/empty) —
  // gives them the same look as the editor's perimeter.
  const getBorderCellBgClass = (seat: SeatLayoutSeat): string => {
    const ct = getCellType(seat);
    if (ct === "door")           return "bg-green-100 border-green-300 shadow-sm";
    if (ct === "emergency_exit") return "bg-orange-100 border-orange-300 shadow-sm";
    // empty border slot — subtle dashed outline
    return "bg-muted-shadcn/40 border-dashed border-border-shadcn/60";
  };

  const renderCellContent = (
    seat: SeatLayoutSeat,
    seats: SeatLayoutSeat[],
    seatIndex: number,
    fallbackRows: SeatLayout["rows"],
    rowIndex?: number,
  ) => {
    const ct = getCellType(seat);

    if (ct === "walkway")        return <Footprints  className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3", "text-muted-foreground-shadcn")} />;
    if (ct === "emergency_exit") return <AlertTriangle className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3", "text-orange-500")} />;
    if (ct === "door")           return <DoorOpen className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3", "text-green-600")} />;
    if (ct === "empty")          return null;

    const num = extractSeatNumber(seat.seatCode) || resolveContinuationNumber(seats, seatIndex, fallbackRows, rowIndex);
    if (!num) return null;
    return <span className={cn(cellText, "font-bold text-white")}>{num}</span>;
  };

  // ── Layout parsing ─────────────────────────────────────────────────────────
  // The serialised layout wraps the grid rows with outer border rows (first & last
  // rows have row === "" and are door/exit border rows; internal rows have
  // borderLeft as first cell and borderRight as last cell).

  const outerRows    = seatLayout.rows;
  const topBorderRow = outerRows[0];
  const bottomBorderRow = outerRows[outerRows.length - 1];
  const innerRows    = outerRows.slice(1, outerRows.length - 1);

  // Detect if the layout uses the wrapper-border format (first/last rows have row === "")
  const hasBorderWrap = topBorderRow?.row === "" && bottomBorderRow?.row === "";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      {/* Screen */}
      {showScreen && (
        <div className="w-full px-4">
          <div
            className="relative mx-auto h-7 flex items-center justify-center rounded-md"
            style={{
              background: "linear-gradient(180deg, oklch(0.6 0.18 20 / 0.9) 0%, oklch(0.6 0.18 20 / 0.25) 100%)",
              clipPath: "polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)",
              maxWidth: "80%",
            }}
          >
            <span className="text-[9px] font-bold tracking-[0.35em] text-white/90 uppercase">
              {t("admin.seatmap.viewer.screen_label")}
            </span>
          </div>
          <p className="text-center text-[9px] text-muted-foreground-shadcn mt-1 tracking-widest uppercase font-medium opacity-60">
            {t("admin.seatmap.viewer.auditorium_label")}
          </p>
        </div>
      )}

      {/* Grid */}
      <div className={cn("flex flex-col items-center select-none overflow-x-auto my-3", gap)}>
        {hasBorderWrap ? (
          <>
            {/* Top border row */}
            <div className={cn("flex items-center", gap)}>
              {/* Spacer aligned with row-label column */}
              <div className={cn(labelW, "shrink-0")} />
              {topBorderRow.seats.map((seat, i) => (
                <div
                  key={`tb-${i}`}
                  className={cn(
                    cellSize,
                    "rounded-sm flex items-center justify-center border transition-all",
                    getBorderCellBgClass(seat),
                  )}
                  title={getCellType(seat) !== "empty" ? getCellType(seat) : undefined}
                >
                  {renderCellContent(seat, topBorderRow.seats, i, outerRows)}
                </div>
              ))}
            </div>

            {/* Internal rows */}
            {innerRows.map((row, rowIdx) => {
              const isWalkwayRow = row.seats.slice(1, -1).every((s) => getCellType(s) === "walkway");
              const leftBorder   = row.seats[0];
              const rightBorder  = row.seats[row.seats.length - 1];
              const innerSeats   = row.seats.slice(1, row.seats.length - 1);

              return (
                <div key={rowIdx} className={cn("flex items-center", gap)}>
                  {/* Row label — outside the border */}
                  <span className={cn(labelW, "shrink-0 flex items-center justify-end pr-1 text-[10px] font-bold text-muted-foreground-shadcn")}>
                    {isWalkwayRow ? "—" : row.row}
                  </span>

                  {/* Left border cell */}
                  <div
                    className={cn(
                      cellSize,
                      "rounded-sm flex items-center justify-center border transition-all",
                      getBorderCellBgClass(leftBorder),
                    )}
                  >
                    {renderCellContent(leftBorder, row.seats, 0, innerRows, rowIdx)}
                  </div>

                  {/* Inner seat cells */}
                  {innerSeats.map((seat, sIdx) => {
                    const ct   = getCellType(seat);
                    const code = seat.seatCode;
                    const isBooked   = !!bookedSeats?.has(code);
                    const isSelected = !!selectedSeats?.has(code);
                    const isClickable = !readOnly && ct === "seat" && !isBooked && !!code;

                    const mergeClasses = getSeatMergeClasses(innerSeats, sIdx);
                    const isDragPicked = dragCodes.has(code);
                    const seatVisual = getSeatCellVisual(seat, code);

                    return (
                      <button
                        key={`${rowIdx}-${sIdx}`}
                        disabled={!isClickable && readOnly}
                        style={seatVisual.style}
                        onClick={() => {
                          if (!dragSelectMode && isClickable) onSeatClick?.(code);
                        }}
                        onMouseDown={() => {
                          if (!dragSelectMode || !isClickable) return;
                          setIsDragging(true);
                          dragCodesRef.current = new Set([code]);
                          setDragCodes(new Set([code]));
                        }}
                        onMouseEnter={() => {
                          if (!dragSelectMode || !isDragging || !isClickable) return;
                          collectDragCode(code);
                        }}
                        onMouseUp={() => {
                          if (dragSelectMode) endDragSelection();
                        }}
                        className={cn(
                          cellSize,
                          "rounded-sm flex items-center justify-center border-1 transition-all",
                          seatVisual.className,
                          ct === "seat" && !readOnly && !isBooked && code
                            ? "cursor-pointer hover:scale-110 hover:shadow-md active:scale-95"
                            : ct === "seat" ? "cursor-default" : "cursor-default",
                          (isSelected || isDragPicked) && "ring-2 ring-white ring-offset-1",
                          mergeClasses,
                        )}
                        title={code || ct}
                      >
                        {renderCellContent(seat, innerSeats, sIdx, innerRows, rowIdx)}
                      </button>
                    );
                  })}

                  {/* Right border cell */}
                  <div
                    className={cn(
                      cellSize,
                      "rounded-sm flex items-center justify-center border transition-all",
                      getBorderCellBgClass(rightBorder),
                    )}
                  >
                    {renderCellContent(rightBorder, row.seats, row.seats.length - 1, innerRows, rowIdx)}
                  </div>
                </div>
              );
            })}

            {/* Bottom border row */}
            <div className={cn("flex items-center", gap)}>
              {/* Spacer aligned with row-label column */}
              <div className={cn(labelW, "shrink-0")} />
              {bottomBorderRow.seats.map((seat, i) => (
                <div
                  key={`bb-${i}`}
                  className={cn(
                    cellSize,
                    "rounded-sm flex items-center justify-center border transition-all",
                    getBorderCellBgClass(seat),
                  )}
                  title={getCellType(seat) !== "empty" ? getCellType(seat) : undefined}
                >
                  {renderCellContent(seat, bottomBorderRow.seats, i, outerRows)}
                </div>
              ))}
            </div>
          </>
        ) : (
          // Simple layout (no border wrap — legacy / mock data format)
          outerRows.map((row, rowIdx) => (
            <div key={rowIdx} className={cn("flex items-center", gap)}>
              <span className={cn(cellSize, "shrink-0 flex items-center justify-end pr-1 text-[10px] font-bold text-muted-foreground-shadcn my-3")}>
                {row.row}
              </span>
              {row.seats.map((seat, sIdx) => {
                const ct   = getCellType(seat);
                const code = seat.seatCode;
                const isBooked   = !!bookedSeats?.has(code);
                const isSelected = !!selectedSeats?.has(code);
                const isClickable = !readOnly && ct === "seat" && !isBooked && !!code;

                const mergeClasses = getSeatMergeClasses(row.seats, sIdx);
                const isDragPicked = dragCodes.has(code);
                const seatVisual = getSeatCellVisual(seat, code);

                return (
                  <button
                    key={`${rowIdx}-${sIdx}`}
                    disabled={!isClickable}
                    style={seatVisual.style}
                    onClick={() => {
                      if (!dragSelectMode && isClickable) onSeatClick?.(code);
                    }}
                    onMouseDown={() => {
                      if (!dragSelectMode || !isClickable) return;
                      setIsDragging(true);
                      dragCodesRef.current = new Set([code]);
                      setDragCodes(new Set([code]));
                    }}
                    onMouseEnter={() => {
                      if (!dragSelectMode || !isDragging || !isClickable) return;
                      collectDragCode(code);
                    }}
                    onMouseUp={() => {
                      if (dragSelectMode) endDragSelection();
                    }}
                    className={cn(
                      cellSize,
                      "rounded-sm flex items-center justify-center border-1 transition-all",
                      seatVisual.className,
                      isClickable
                        ? "cursor-pointer hover:scale-110 hover:shadow-md active:scale-95"
                        : "cursor-default",
                      (isSelected || isDragPicked) && "ring-2 ring-white ring-offset-1",
                      mergeClasses,
                    )}
                    title={code || ct}
                  >
                    {renderCellContent(seat, row.seats, sIdx, outerRows, rowIdx)}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl border border-border-shadcn bg-muted-shadcn/20 px-5 py-2.5 text-xs">
          {/* Seat types */}
          {activeSeatTypes.map((st) => {
            const appearance = getSeatTypeAppearance(st.seatColor, st.id, st.name);
            return (
              <div key={st.id} className="flex items-center gap-1.5">
                <div
                  className={cn("h-3 w-3 rounded-sm border", appearance.className)}
                  style={appearance.style}
                />
                <span className="text-muted-foreground-shadcn">{st.name}</span>
              </div>
            );
          })}

          {(activeSeatTypes.length > 0) && <div className="h-3 w-px bg-border-shadcn" />}

          {/* State indicators shown only when interactive */}
          {!readOnly && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-primary-shadcn" />
                <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.selected")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-gray-400" />
                <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.booked")}</span>
              </div>
            </>
          )}

          {readOnly && bookedSeats !== undefined && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-blue-500/40" />
                <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.available")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-gray-400" />
                <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.booked")}</span>
              </div>
            </>
          )}

          <div className="h-3 w-px bg-border-shadcn" />

          <div className="flex items-center gap-1.5">
            <Footprints className="h-3 w-3 text-muted-foreground-shadcn" />
            <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.walkway")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.emergency_exit")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DoorOpen className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.door")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
