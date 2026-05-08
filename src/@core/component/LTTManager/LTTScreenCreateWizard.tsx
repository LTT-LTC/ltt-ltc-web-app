"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  DoorOpen,
  MousePointer2,
  AlertTriangle,
  Footprints,
  RotateCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocalization } from "@/src/@core/hooks/use-localization";

import { cn } from "@/src/@core/utils/cn";
import { LTTDialog, LTTDialogContent, LTTDialogFooter, LTTDialogHeader, LTTDialogTitle } from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTTextarea } from "@/src/@core/component/LTTShadcnUI/LTTTextarea";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { LTTSelect, LTTSelectContent, LTTSelectItem, LTTSelectTrigger, LTTSelectValue } from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { getSeatTypeColor } from "@/src/@core/component/LTTManager/seatTypeColor";

import {
  type Screen,
  type SeatLayout,
  type SeatLayoutSeat,
  mockAdminCinemas,
  screenTypes,
  type SeatType,
} from "@/src/@core/const/mock/adminMockData";

const SESSION_STORAGE_KEY = "admin_screen_wizard_draft";

type LayoutType = "rectangle" | "square" | "curve";

type CellType =
  | "seat"
  | "seat_continuation"
  | "empty"
  | "walkway"
  | "emergency_exit"
  | "door";

type BorderCellType = "empty" | "door" | "emergency_exit";

const formatNowGmt7 = (): string => {
  // Force timestamp rendering in GMT+7 and dd/MM/yyyy format.
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${pick("day")}/${pick("month")}/${pick("year")} ${pick("hour")}:${pick("minute")}:${pick("second")} GMT+7`;
};

interface GridCell {
  row: string;
  /** Seat number (compressed after recalc), not the physical index. */
  col: number;
  type: CellType;
  seatTypeId: number;
  seatCode: string;
  /** For multi-cell seats, the origin cell indices. */
  originCol?: number;
  originRow?: number;
}

interface Props {
  onClose: () => void;
  onCreated: (screen: Screen) => void;
  onUpdate?: (screen: Screen) => void;
  initialData?: Screen;
  fixedCinemaId?: string;
  entityType?: "screen" | "seatmap";
  isSubmitting?: boolean;
  seatTypes?: SeatType[];
  /** When true, renders as a page-level card instead of a modal dialog */
  inline?: boolean;
}

export default function LTTScreenCreateWizard({
  onClose,
  onCreated,
  onUpdate,
  initialData,
  fixedCinemaId,
  entityType = "screen",
  isSubmitting = false,
  seatTypes: externalSeatTypes = [],
  inline = false,
}: Props) {
  const { t } = useLocalization();
  const isEditMode = !!initialData;
  const isSeatMapMode = entityType === "seatmap";
  const [step, setStep] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const [seatTypes, setSeatTypes] = useState<SeatType[]>(externalSeatTypes);

  // Step 1 fields
  const [tenantId, setTenantId] = useState("tenant-001");
  const [cinemaId, setCinemaId] = useState("");
  const [seatMapName, setSeatMapName] = useState("");
  const [seatMapDescription, setSeatMapDescription] = useState("");
  const [screenNumber, setScreenNumber] = useState("");
  const [screenType, setScreenType] = useState("");
  const [seatCount, setSeatCount] = useState("100");

  // Step 2 fields
  const [layoutType, setLayoutType] = useState<LayoutType>("rectangle");
  const [gridSize, setGridSize] = useState(10); // square: single dimension
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(12);

  const [activeTool, setActiveTool] = useState<
    "select" | "walkway" | "emergency_exit" | "door" | "delete"
  >("select");
  const [activeSeatTypeId, setActiveSeatTypeId] = useState(1);

  const [grid, setGrid] = useState<GridCell[][]>([]);

  // Outer border for door/emergency outside the seatmap
  const [borderTop, setBorderTop] = useState<BorderCellType[]>([]);
  const [borderBottom, setBorderBottom] = useState<BorderCellType[]>([]);
  const [borderLeft, setBorderLeft] = useState<BorderCellType[]>([]);
  const [borderRight, setBorderRight] = useState<BorderCellType[]>([]);

  // Drag selection
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ r: number; c: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ r: number; c: number } | null>(null);

  const gridRef = useRef<HTMLDivElement | null>(null);

  const getSeatType = useCallback(
    (id: number): SeatType | undefined => seatTypes.find((s) => s.id === id),
    [seatTypes]
  );

  const orderedSeatTypes = useMemo(() => {
    const normalized = [...seatTypes];
    const standardRegex = /\bstandard\b/i;

    normalized.sort((left, right) => {
      const leftOccupied = left.seatOccupied ?? 1;
      const rightOccupied = right.seatOccupied ?? 1;

      // Keep single-chair seat types above x2 (couple/bed) seat types.
      if (leftOccupied !== rightOccupied) {
        return leftOccupied - rightOccupied;
      }

      const leftIsStandard = standardRegex.test(left.name || "");
      const rightIsStandard = standardRegex.test(right.name || "");

      // If Standard exists in the same occupancy bucket, pin it first.
      if (leftIsStandard !== rightIsStandard) {
        return leftIsStandard ? -1 : 1;
      }

      return (left.name || "").localeCompare(right.name || "");
    });

    return normalized;
  }, [seatTypes]);

  const preferredSeatTypeId = useMemo(() => {
    if (orderedSeatTypes.length === 0) return 1;
    const standardSingle = orderedSeatTypes.find(
      (seatType) =>
        /\bstandard\b/i.test(seatType.name || "") && (seatType.seatOccupied ?? 1) === 1
    );
    if (standardSingle) return standardSingle.id;
    const firstSingle = orderedSeatTypes.find((seatType) => (seatType.seatOccupied ?? 1) === 1);
    return firstSingle?.id ?? orderedSeatTypes[0].id;
  }, [orderedSeatTypes]);

  useEffect(() => {
    setSeatTypes(externalSeatTypes);
  }, [externalSeatTypes]);

  useEffect(() => {
    if (seatTypes.length === 0) return;
    setActiveSeatTypeId((current) => {
      if (!seatTypes.some((x) => x.id === current)) return preferredSeatTypeId;
      // Force default to Standard/single seat at initialization to avoid couple-seat defaults.
      if (current !== preferredSeatTypeId && (current === 1 || current === 0)) {
        return preferredSeatTypeId;
      }
      return current;
    });
  }, [seatTypes, preferredSeatTypeId]);

  /**
   * Recalculate seat codes:
   * - compress numbering (single number for couple/sweetbox)
   * - skip any row/column painted as `walkway`
   * - skip columns that have no seat "origin" (seat_continuation only)
   */
  const recalcSeatCodes = useCallback((g: GridCell[][]): GridCell[][] => {
    if (!g.length || !g[0].length) return g;

    const numRows = g.length;
    const numCols = g[0].length;

    // Match the source behavior: only skip row/column fully painted as `walkway`.
    // This ensures numbering compresses when the user converts an entire row/column into walkway,
    // without wiping labels for partially-painted rows.
    const walkwayRowIndices = new Set<number>();
    for (let r = 0; r < numRows; r++) {
      if (g[r].every((c) => c.type === "walkway")) walkwayRowIndices.add(r);
    }

    const walkwayColIndices = new Set<number>();
    for (let c = 0; c < numCols; c++) {
      if (g.every((row) => row[c]?.type === "walkway")) walkwayColIndices.add(c);
    }

    const originSeatRowIndices = new Set<number>();
    const originSeatColIndices = new Set<number>();
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (g[r][c].type === "seat") {
          originSeatRowIndices.add(r);
          originSeatColIndices.add(c);
        }
      }
    }

    // Row labels
    let rowLabelIdx = 0;
    const rowLabels: string[] = [];
    for (let r = 0; r < numRows; r++) {
      if (walkwayRowIndices.has(r) || !originSeatRowIndices.has(r)) rowLabels[r] = "";
      else {
        rowLabels[r] = String.fromCharCode(65 + rowLabelIdx);
        rowLabelIdx++;
      }
    }

    // Compute sequential column numbers per row
    const gridColIds: number[][] = Array.from({ length: numRows }, () => []);
    for (let r = 0; r < numRows; r++) {
      let colCounter = 0;
      for (let c = 0; c < numCols; c++) {
        const cell = g[r][c];
        if (cell.type === "seat") {
          colCounter++;
          gridColIds[r][c] = colCounter;
        } else if (
          cell.type === "seat_continuation" &&
          cell.originRow !== undefined &&
          cell.originCol !== undefined
        ) {
          gridColIds[r][c] = gridColIds[cell.originRow]?.[cell.originCol] || 0;
        } else {
          gridColIds[r][c] = 0;
        }
      }
    }

    const result = g.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        const updated: GridCell = { ...cell };

        let targetR = rIdx;
        let targetC = cIdx;

        // For continuation cells, inherit the row/col numbering from the origin
        if (
          cell.type === "seat_continuation" &&
          cell.originRow !== undefined &&
          cell.originCol !== undefined
        ) {
          targetR = cell.originRow;
          targetC = cell.originCol;
        }

        updated.row = rowLabels[targetR] || "";
        updated.col = gridColIds[rIdx][cIdx] || 0;

        if (cell.type === "seat" || cell.type === "seat_continuation") {
          const rl = rowLabels[targetR];
          const cn = updated.col;
          updated.seatCode = rl && cn ? `${rl}${cn}` : "";
        } else {
          // walkways, doors, empty, etc.
          updated.seatCode = "";
        }

        return updated;
      })
    );

    return result;
  }, []);

  const initGrid = useCallback(
    (numRows: number, numCols: number, layout: LayoutType) => {
      const g: GridCell[][] = [];

      for (let r = 0; r < numRows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        const rowCells: GridCell[] = [];
        for (let c = 0; c < numCols; c++) {
          let type: CellType = "seat";

          if (layout === "curve") {
            // Shape seats like the source: carve the "front" area to form a curve.
            if (r < numRows * 0.4) {
              const rowRatio = 1 - r / (numRows * 0.4);
              const colCenter = (numCols - 1) / 2;
              const distFromCol = Math.abs(c - colCenter);
              const maxDist = colCenter * (1 - rowRatio * 0.5);
              if (distFromCol > maxDist) type = "empty";
            }
          }

          rowCells.push({
            row: rowLabel,
            col: c + 1,
            type,
            seatTypeId: preferredSeatTypeId,
            seatCode: type === "seat" ? `${rowLabel}${c + 1}` : "",
          });
        }
        g.push(rowCells);
      }

      const recalced = recalcSeatCodes(g);
      setGrid(recalced);

      // Border cells wrap the internal seatmap:
      // - top/bottom: (cols + 2) to include corners around left/right border cells
      // - left/right: (rows)
      const emptyBorderTop = Array(numCols + 2).fill("empty") as BorderCellType[];
      setBorderTop(emptyBorderTop);
      setBorderBottom([...emptyBorderTop]);
      setBorderLeft(Array(numRows).fill("empty") as BorderCellType[]);
      setBorderRight(Array(numRows).fill("empty") as BorderCellType[]);
    },
    [recalcSeatCodes, preferredSeatTypeId]
  );

  const handleRegenerateGrid = () => {
    if (layoutType === "square") {
      initGrid(gridSize, gridSize, "square");
      setRows(gridSize);
      setCols(gridSize);
    } else {
      initGrid(rows, cols, layoutType);
    }
  };

  // Load draft or initial data
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      // If editing an existing screen, load from its data directly (skip session draft)
      if (initialData) {
        setTenantId(initialData.tenantId || "tenant-001");
        setCinemaId(initialData.cinemaId);
        setSeatMapName(initialData.name || "");
        setSeatMapDescription(initialData.description || "");
        setScreenNumber(String(initialData.screenNumber));
        setScreenType(initialData.screenType);
        setSeatCount(String(initialData.seatCount));

        // Reverse-map the SeatLayout back to grid + borders
        const layout = initialData.seatLayout;
        const outerRows = layout.rows;
        if (outerRows.length >= 3) {
          const topRow = outerRows[0];
          const bottomRow = outerRows[outerRows.length - 1];
          const internalRows = outerRows.slice(1, outerRows.length - 1);

          // borderTop & borderBottom (full width: includes corners)
          const parseBorderType = (seat: { seatCode: string; type?: string }): BorderCellType => {
            if (seat.type === "door") return "door";
            if (seat.type === "emergency_exit") return "emergency_exit";
            return "empty";
          };
          setBorderTop(topRow.seats.map(parseBorderType));
          setBorderBottom(bottomRow.seats.map(parseBorderType));

          // borderLeft & borderRight
          const newBorderLeft: BorderCellType[] = [];
          const newBorderRight: BorderCellType[] = [];
          const newGrid: GridCell[][] = [];

          internalRows.forEach((row, rIdx) => {
            const leftSeat = row.seats[0];
            const rightSeat = row.seats[row.seats.length - 1];
            newBorderLeft.push(parseBorderType(leftSeat));
            newBorderRight.push(parseBorderType(rightSeat));

            const innerSeats = row.seats.slice(1, row.seats.length - 1);
            const gridRow: GridCell[] = innerSeats.map((seat, cIdx) => {
              const seatType = (seat.type ?? "seat") as CellType;
              const isContinuation = seatType === "seat" && !seat.seatCode;
              const cellType: CellType = isContinuation ? "seat_continuation" : seatType;
              return {
                row: row.row,
                col: cIdx + 1,
                type: cellType,
                seatTypeId: seat.seatTypeId || 0,
                seatCode: seat.seatCode || "",
              };
            });
            newGrid.push(gridRow);
          });

          // Fix up seat_continuation origin references
          for (let r = 0; r < newGrid.length; r++) {
            for (let c = 0; c < newGrid[r].length; c++) {
              const cell = newGrid[r][c];
              if (cell.type === "seat_continuation") {
                // Look for origin to the left (horizontal) or above (vertical)
                let found = false;
                if (c > 0 && newGrid[r][c - 1].type === "seat" && newGrid[r][c - 1].seatTypeId === cell.seatTypeId) {
                  cell.originRow = r;
                  cell.originCol = c - 1;
                  found = true;
                } else if (r > 0 && newGrid[r - 1][c].type === "seat" && newGrid[r - 1][c].seatTypeId === cell.seatTypeId) {
                  cell.originRow = r - 1;
                  cell.originCol = c;
                  found = true;
                }
                // If we couldn't find an adjacent seat origin, try looking further left
                if (!found) {
                  for (let lc = c - 1; lc >= 0; lc--) {
                    if (newGrid[r][lc].type === "seat") {
                      cell.originRow = r;
                      cell.originCol = lc;
                      break;
                    }
                  }
                }
              }
            }
          }

          setBorderLeft(newBorderLeft);
          setBorderRight(newBorderRight);
          setRows(newGrid.length);
          setCols(newGrid[0]?.length ?? 12);
          setGrid(newGrid);
        }
        return;
      }

      // Otherwise load from session draft
      const draft = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.step) setStep(parsed.step);
        if (parsed.tenantId) setTenantId(parsed.tenantId);
        if (parsed.cinemaId) setCinemaId(parsed.cinemaId);
        if (parsed.seatMapName) setSeatMapName(parsed.seatMapName);
        if (parsed.seatMapDescription) setSeatMapDescription(parsed.seatMapDescription);
        if (parsed.screenNumber) setScreenNumber(parsed.screenNumber);
        if (parsed.screenType) setScreenType(parsed.screenType);
        if (parsed.seatCount) setSeatCount(parsed.seatCount);
        if (parsed.rows) setRows(parsed.rows);
        if (parsed.cols) setCols(parsed.cols);
        if (parsed.gridSize) setGridSize(parsed.gridSize);
        if (parsed.layoutType) setLayoutType(parsed.layoutType);
        if (parsed.grid) setGrid(parsed.grid);
        if (parsed.borderTop) setBorderTop(parsed.borderTop);
        if (parsed.borderBottom) setBorderBottom(parsed.borderBottom);
        if (parsed.borderLeft) setBorderLeft(parsed.borderLeft);
        if (parsed.borderRight) setBorderRight(parsed.borderRight);
        return;
      }
    } catch {}

    initGrid(8, 12, "rectangle");
  }, [initGrid, initialData]);

  useEffect(() => {
    if (fixedCinemaId) {
      setCinemaId(fixedCinemaId);
    }
  }, [fixedCinemaId]);

  // Auto-save draft & track dirtiness
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            step,
            tenantId,
            cinemaId,
            seatMapName,
            seatMapDescription,
            screenNumber,
            screenType,
            seatCount,
            rows,
            cols,
            gridSize,
            layoutType,
            grid,
            borderTop,
            borderBottom,
            borderLeft,
            borderRight,
          })
        );
      } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [
    step,
    tenantId,
    cinemaId,
    seatMapName,
    seatMapDescription,
    screenNumber,
    screenType,
    seatCount,
    rows,
    cols,
    gridSize,
    layoutType,
    grid,
    borderTop,
    borderBottom,
    borderLeft,
    borderRight,
  ]);

  // isDirty tracking (simplified: any change to key fields sets dirty)
  useEffect(() => {
    if (tenantId !== "tenant-001" || cinemaId !== "" || seatMapName !== "" || screenNumber !== "" || screenType !== "" || grid.length > 0) {
      if (!isDirty && grid.length > 0) setIsDirty(true);
    }
  }, [tenantId, cinemaId, seatMapName, screenNumber, screenType, grid]);

  // Beforeunload guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleSafeClose = () => {
    if (isDirty) {
      setExitConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    onClose();
  };

  const actualSeatCount = grid.flat().filter((c) => c.type === "seat").length;

  const layoutSummary = (() => {
    const seatCells = grid.flat().filter((c) => c.type === "seat");
    const breakdown = new Map<number, number>();
    for (const cell of seatCells) {
      breakdown.set(cell.seatTypeId, (breakdown.get(cell.seatTypeId) || 0) + 1);
    }
    const seatTypeBreakdown = Array.from(breakdown.entries()).map(([id, count]) => ({
      id,
      name: getSeatType(id)?.name || `#${id}`,
      count,
    }));
    const innerExits = grid.flat().filter((c) => c.type === "emergency_exit").length;
    const innerEntrances = grid.flat().filter((c) => c.type === "door").length;
    const borders: BorderCellType[] = [
      ...borderTop,
      ...borderBottom,
      ...borderLeft,
      ...borderRight,
    ];
    const borderExits = borders.filter((c) => c === "emergency_exit").length;
    const borderEntrances = borders.filter((c) => c === "door").length;
    return {
      totalSeats: seatCells.length,
      seatTypeBreakdown,
      exits: innerExits + borderExits,
      entrances: innerEntrances + borderEntrances,
    };
  })();

  const placeSeat = (g: GridCell[][], rIdx: number, cIdx: number, seatTypeId: number) => {
    const st = getSeatType(seatTypeId);
    const occupied = st?.seatOccupied || 1;
    const orientation = st?.orientation || "square";

    const next = g.map((row) => row.map((cell) => ({ ...cell })));

    // Single-seat or square seats occupy 1 grid cell visually
    if (occupied === 1 || orientation === "square") {
      next[rIdx][cIdx].type = "seat";
      next[rIdx][cIdx].seatTypeId = seatTypeId;
      return next;
    }

    if (orientation === "horizontal") {
      if (cIdx + occupied > next[0].length) return next;

      next[rIdx][cIdx].type = "seat";
      next[rIdx][cIdx].seatTypeId = seatTypeId;

      for (let i = 1; i < occupied; i++) {
        next[rIdx][cIdx + i].type = "seat_continuation";
        next[rIdx][cIdx + i].seatTypeId = seatTypeId;
        next[rIdx][cIdx + i].originCol = cIdx;
        next[rIdx][cIdx + i].originRow = rIdx;
      }
      return next;
    }

    // vertical
    if (rIdx + occupied > next.length) return next;

    next[rIdx][cIdx].type = "seat";
    next[rIdx][cIdx].seatTypeId = seatTypeId;

    for (let i = 1; i < occupied; i++) {
      next[rIdx + i][cIdx].type = "seat_continuation";
      next[rIdx + i][cIdx].seatTypeId = seatTypeId;
      next[rIdx + i][cIdx].originCol = cIdx;
      next[rIdx + i][cIdx].originRow = rIdx;
    }
    return next;
  };

  const clearFootprint = (
    g: GridCell[][],
    rIdx: number,
    cIdx: number,
    toType: CellType
  ) => {
    const cell = g[rIdx][cIdx];

    let oR = rIdx;
    let oC = cIdx;
    if (
      cell.type === "seat_continuation" &&
      cell.originRow !== undefined &&
      cell.originCol !== undefined
    ) {
      oR = cell.originRow;
      oC = cell.originCol;
    }

    const st = getSeatType(g[oR][oC].seatTypeId);
    const occupied = st?.seatOccupied || 1;
    const orientation = st?.orientation || "square";

    const next = g.map((row) => row.map((cc) => ({ ...cc })));

    if (orientation === "horizontal") {
      for (let i = 0; i < occupied; i++) {
        if (!next[oR]?.[oC + i]) continue;
        next[oR][oC + i].type = toType;
        next[oR][oC + i].seatTypeId = 0;
      }
    } else if (orientation === "vertical") {
      for (let i = 0; i < occupied; i++) {
        if (!next[oR + i]?.[oC]) continue;
        next[oR + i][oC].type = toType;
        next[oR + i][oC].seatTypeId = 0;
      }
    } else {
      next[oR][oC].type = toType;
      next[oR][oC].seatTypeId = 0;
    }

    return next;
  };

  const handleCellClick = (r: number, c: number) => {
    setGrid((prev) => {
      if (!prev.length) return prev;
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      const cell = next[r][c];

      if (activeTool === "select") {
        const seatTypeId = activeSeatTypeId;

        // If the clicked cell is already part of another multi-cell seat, clear that footprint first.
        // This prevents overlapping "continuation" segments that would break numbering.
        const isExistingSeatPart = cell.type === "seat" || cell.type === "seat_continuation";
        const prepared = isExistingSeatPart ? clearFootprint(next, r, c, "empty") : next;

        return recalcSeatCodes(placeSeat(prepared, r, c, seatTypeId));
      }

      if (activeTool === "delete") {
        // If deleting a continuation, delete the origin footprint.
        if (
          cell.type === "seat_continuation" &&
          cell.originRow !== undefined &&
          cell.originCol !== undefined
        ) {
          const cleared = clearFootprint(next, r, c, "empty");
          return recalcSeatCodes(cleared);
        }

        if (cell.type === "seat" || cell.type === "seat_continuation") {
          const cleared = clearFootprint(next, r, c, "empty");
          return recalcSeatCodes(cleared);
        }

        // empty/walkway/etc
        next[r][c].type = "empty";
        next[r][c].seatTypeId = 0;
        return recalcSeatCodes(next);
      }

      // walkway/emergency_exit/door
      // - If user converts any part of a multi-cell seat, convert the whole footprint.
      const isSeatPart = cell.type === "seat" || cell.type === "seat_continuation";
      if (isSeatPart && (cell.type === "seat" || cell.seatTypeId)) {
        const converted = clearFootprint(
          next,
          r,
          c,
          activeTool as CellType
        );
        // Keep border seatTypeId as 0; recalc will handle seatCode/col.
        return recalcSeatCodes(converted);
      }

      next[r][c].type = activeTool;
      next[r][c].seatTypeId = 0;
      return recalcSeatCodes(next);
    });
  };

  const handleMouseDown = (r: number, c: number) => {
    setIsDragging(true);
    setDragStart({ r, c });
    setDragEnd({ r, c });
  };

  const handleMouseOver = (r: number, c: number) => {
    if (isDragging) setDragEnd({ r, c });
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return;

    const minR = Math.min(dragStart.r, dragEnd.r);
    const maxR = Math.max(dragStart.r, dragEnd.r);
    const minC = Math.min(dragStart.c, dragEnd.c);
    const maxC = Math.max(dragStart.c, dragEnd.c);

    setGrid((prev) => {
      let next = prev.map((row) => row.map((cell) => ({ ...cell })));
      for (let rr = minR; rr <= maxR; rr++) {
        for (let cc = minC; cc <= maxC; cc++) {
          if (activeTool === "select") {
            const st = getSeatType(activeSeatTypeId);
            const occupied = st?.seatOccupied || 1;
            const orientation = st?.orientation || "square";

            if (occupied > 1 && orientation === "horizontal") {
              // place origins spaced by `occupied` to avoid overlapping footprints
              if ((cc - minC) % occupied === 0) {
                next = placeSeat(next, rr, cc, activeSeatTypeId);
              }
            } else if (occupied > 1 && orientation === "vertical") {
              if ((rr - minR) % occupied === 0) {
                next = placeSeat(next, rr, cc, activeSeatTypeId);
              }
            } else {
              next[rr][cc].type = "seat";
              next[rr][cc].seatTypeId = activeSeatTypeId;
            }
          } else if (activeTool === "delete") {
            if (next[rr][cc].type === "seat" || next[rr][cc].type === "seat_continuation") {
              next = clearFootprint(next, rr, cc, "empty");
            } else {
              next[rr][cc].type = "empty";
              next[rr][cc].seatTypeId = 0;
            }
          } else {
            // convert cell / footprint
            if (
              next[rr][cc].type === "seat" ||
              next[rr][cc].type === "seat_continuation"
            ) {
              next = clearFootprint(next, rr, cc, activeTool as CellType);
            } else {
              next[rr][cc].type = activeTool;
              next[rr][cc].seatTypeId = 0;
            }
          }
        }
      }
      return recalcSeatCodes(next);
    });

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const isInDragArea = (r: number, c: number) => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    const minR = Math.min(dragStart.r, dragEnd.r);
    const maxR = Math.max(dragStart.r, dragEnd.r);
    const minC = Math.min(dragStart.c, dragEnd.c);
    const maxC = Math.max(dragStart.c, dragEnd.c);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  const handleBorderClick = (side: "top" | "bottom" | "left" | "right", idx: number) => {
    // Border only supports door / emergency outside the seatmap.
    if (activeTool !== "door" && activeTool !== "emergency_exit" && activeTool !== "delete") return;

    const setBorder =
      side === "top"
        ? setBorderTop
        : side === "bottom"
        ? setBorderBottom
        : side === "left"
        ? setBorderLeft
        : setBorderRight;

    setBorder((prev) => {
      const next = [...prev];
      const nextType: BorderCellType =
        activeTool === "delete"
          ? "empty"
          : (activeTool as BorderCellType);

      next[idx] = next[idx] === nextType ? "empty" : nextType;
      return next;
    });
  };

  const goToStep2 = () => {
    if (isSeatMapMode) {
      setStep(2);
      return;
    }

    if (!cinemaId || !screenNumber || !screenType) {
      toast.error(t("admin.seatmap.wizard.validation.required_fields"));
      return;
    }
    setStep(2);
  };

  const getBorderCellContent = (type: BorderCellType) => {
    if (type === "door") return <DoorOpen className="h-3 w-3 text-green-600" />;
    if (type === "emergency_exit") return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    return null;
  };

  const getBorderCellBgClass = (type: BorderCellType) => {
    if (type === "door") return "bg-green-100 border-green-300 shadow-sm";
    if (type === "emergency_exit") return "bg-orange-100 border-orange-300 shadow-sm";
    return "bg-muted-shadcn/40 border-dashed border-border-shadcn/60 hover:bg-muted-shadcn/60";
  };

  const getSeatCellBgClass = (cell: GridCell) => {
    if (cell.type === "seat" || cell.type === "seat_continuation") {
      return getSeatTypeColor(cell.seatTypeId).bg;
    }
    if (cell.type === "walkway") return "bg-muted-shadcn";
    if (cell.type === "emergency_exit") return "bg-orange-100";
    if (cell.type === "door") return "bg-green-100";
    if (cell.type === "empty") return "bg-muted-shadcn/50";
    return "bg-muted-shadcn/50";
  };

  const getSeatCellDisplay = (cell: GridCell) => {
    if (cell.type === "empty") return null;
    if (cell.type === "walkway") return <Footprints className="h-3 w-3 text-muted-foreground-shadcn" />;
    if (cell.type === "emergency_exit") return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    if (cell.type === "door") return <DoorOpen className="h-3 w-3 text-green-600" />;

    // seat & continuation: show compressed seat number
    return (
      <span className="text-[8px] font-bold text-white">
        {cell.col || ""}
      </span>
    );
  };

  const buildSeatLayout = (): SeatLayout => {
    // Expanded layout including outer border cells.
    // - top row: borderTop
    // - internal rows: borderLeft[r] + grid[r] + borderRight[r]
    // - bottom row: borderBottom

    const layoutRows: SeatLayout["rows"] = [];

    const toSeatLayoutCell = (
      type: CellType | BorderCellType,
      seatTypeId: number,
      seatCode: string
    ): SeatLayoutSeat => {
      // For seat_continuation in internal grid, we store it as "seat" with empty seatCode,
      // so the seat map can render background but not count it.
      const mappedType =
        type === "seat_continuation" ? undefined : (type as SeatLayoutSeat["type"]);

      return {
        seatCode,
        x: 0,
        y: 0,
        seatTypeId,
        ...(mappedType ? { type: mappedType } : {}),
      };
    };

    // Top border row (row label empty)
    const topSeats: SeatLayoutSeat[] = borderTop.map((bt, idx) =>
      toSeatLayoutCell(bt, 0, "")
    );
    layoutRows.push({ row: "", seats: topSeats });

    // Internal rows
    for (let r = 0; r < grid.length; r++) {
      const internalRowCells: SeatLayoutSeat[] = [];

      // left border
      internalRowCells.push(
        toSeatLayoutCell(borderLeft[r] ?? "empty", 0, "")
      );

      // grid cells
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        internalRowCells.push(
          toSeatLayoutCell(cell.type, cell.seatTypeId, cell.seatCode)
        );
      }

      // right border
      internalRowCells.push(
        toSeatLayoutCell(borderRight[r] ?? "empty", 0, "")
      );

      layoutRows.push({
        row: grid[r][0]?.row || "",
        seats: internalRowCells.map((s, i) => ({
          ...s,
          x: i * 40,
          y: r * 40,
        })),
      });
    }

    // Bottom border row
    const bottomSeats: SeatLayoutSeat[] = borderBottom.map((bt) =>
      toSeatLayoutCell(bt, 0, "")
    );
    layoutRows.push({
      row: "",
      seats: bottomSeats.map((s, i) => ({ ...s, x: i * 40, y: grid.length * 40 })),
    });

    return { rows: layoutRows };
  };

  const handleConfirmCreate = () => {
    if (isSeatMapMode && !seatMapName.trim()) {
      toast.error(t("admin.seatmap.wizard.validation.name_required"));
      return;
    }

    const now = formatNowGmt7();

    const screen: Screen = {
      id: initialData?.id ?? `scr-${Date.now()}`,
      tenantId,
      cinemaId,
      seatMapId: initialData?.seatMapId,
      name: seatMapName.trim() || undefined,
      description: seatMapDescription.trim() || undefined,
      screenNumber: parseInt(screenNumber),
      screenType,
      seatLayout: buildSeatLayout(),
      seatCount: actualSeatCount,
      createdAt: initialData?.createdAt ?? now,
      updatedAt: now,
    };

    if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_STORAGE_KEY);

    if (isEditMode && onUpdate) {
      onUpdate(screen);
    } else {
      onCreated(screen);
    }
    setConfirmOpen(false);
  };

  const getSeatTypeToolList = () => (
    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
      {seatTypes.length === 0 && (
        <div className="rounded-md border border-dashed p-2 text-[11px] text-muted-foreground-shadcn">
          {t("admin.seatmap.wizard.empty_seat_type_data")}
        </div>
      )}
      {orderedSeatTypes.map((st) => (
        <button
          key={st.id}
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all border my-3",
            activeSeatTypeId === st.id && activeTool === "select"
              ? "border-primary-shadcn bg-primary-shadcn/5 text-primary-shadcn shadow-inner"
              : "border-transparent text-muted-foreground-shadcn hover:bg-muted-shadcn"
          )}
          onClick={() => {
            setActiveSeatTypeId(st.id);
            setActiveTool("select");
          }}
        >
          <div className={cn("h-3.5 w-3.5 rounded shadow-sm", getSeatTypeColor(st.id).bg)} />
          <span className="truncate">{st.name}</span>
          <span className="ml-auto opacity-60 text-[10px]">
            x{st.seatOccupied}
          </span>
        </button>
      ))}
    </div>
  );

  const wizardContent = (
    <div className={cn(
      "flex flex-col",
      inline ? "" : "flex-1 overflow-y-auto p-6"
    )}>
            {/* Progress Bar */}
            <div className="mb-8 space-y-2">
              <div className="h-2 w-full bg-muted-shadcn rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-shadcn transition-all duration-500 ease-out"
                  style={{ width: `${(step / 2) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground-shadcn px-1">
                <span className={cn(step >= 1 ? "text-primary-shadcn" : "text-muted-foreground-shadcn")}>
                  {isSeatMapMode ? t("admin.seatmap.wizard.progress.design") : t("admin.seatmap.wizard.progress.cinema_info")}
                </span>
                <span className={cn(step >= 2 ? "text-primary-shadcn" : "text-muted-foreground-shadcn")}>
                  {isSeatMapMode ? t("admin.seatmap.wizard.progress.map_info") : t("admin.seatmap.wizard.progress.design")}
                </span>
              </div>
            </div>

            {((step === 1 && !isSeatMapMode) || (step === 2 && isSeatMapMode)) && (
              <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto py-4">
                {isSeatMapMode ? (
                  <>
                    <div className="sm:col-span-2 rounded-lg border border-border-shadcn bg-muted-shadcn/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <LTTLabel className="text-sm font-semibold">
                          {t("admin.seatmap.wizard.summary.title")}
                        </LTTLabel>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-md border border-border-shadcn bg-card px-3 py-2">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground-shadcn">
                            {t("admin.seatmap.wizard.summary.total_seats")}
                          </p>
                          <p className="text-2xl font-bold text-primary-shadcn">{layoutSummary.totalSeats}</p>
                        </div>
                        <div className="rounded-md border border-border-shadcn bg-card px-3 py-2">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground-shadcn">
                            {t("admin.seatmap.wizard.summary.entrances")}
                          </p>
                          <p className="text-2xl font-bold">{layoutSummary.entrances}</p>
                        </div>
                        <div className="rounded-md border border-border-shadcn bg-card px-3 py-2">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground-shadcn">
                            {t("admin.seatmap.wizard.summary.exits")}
                          </p>
                          <p className="text-2xl font-bold">{layoutSummary.exits}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground-shadcn">
                          {t("admin.seatmap.wizard.summary.seat_types")}
                        </p>
                        {layoutSummary.seatTypeBreakdown.length === 0 ? (
                          <p className="text-xs text-muted-foreground-shadcn">
                            {t("admin.seatmap.wizard.summary.no_seats")}
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {layoutSummary.seatTypeBreakdown.map((b) => (
                              <span
                                key={b.id}
                                className="inline-flex items-center gap-2 rounded-full border border-border-shadcn bg-card px-3 py-1 text-xs font-medium"
                              >
                                <span
                                  className={cn(
                                    "h-2.5 w-2.5 rounded-full",
                                    getSeatTypeColor(b.id).bg || "bg-muted-foreground-shadcn"
                                  )}
                                />
                                {b.name}
                                <span className="text-muted-foreground-shadcn">({b.count})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <LTTLabel>{t("admin.seatmap.wizard.form.name_label")}</LTTLabel>
                      <LTTInput
                        value={seatMapName}
                        onChange={(e) => setSeatMapName(e.target.value)}
                        placeholder={t("admin.seatmap.wizard.form.name_placeholder")}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <LTTLabel>{t("admin.seatmap.wizard.form.description_label")}</LTTLabel>
                      <LTTTextarea
                        value={seatMapDescription}
                        onChange={(e) => setSeatMapDescription(e.target.value)}
                        placeholder={t("admin.seatmap.wizard.form.description_placeholder")}
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <>
                <div className="space-y-2">
                  <LTTLabel>Tenant ID</LTTLabel>
                  <LTTInput
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <LTTLabel>{t("admin.seatmap.wizard.form.cinema_label")}</LTTLabel>
                  {fixedCinemaId ? (
                    <LTTInput
                      value={mockAdminCinemas.find((c) => c.id === fixedCinemaId)?.name ?? fixedCinemaId}
                      disabled
                    />
                  ) : (
                    <LTTSelect value={cinemaId} onValueChange={setCinemaId}>
                      <LTTSelectTrigger>
                        <LTTSelectValue placeholder={t("admin.seatmap.wizard.form.cinema_placeholder")} />
                      </LTTSelectTrigger>
                      <LTTSelectContent>
                        {mockAdminCinemas.map((c) => (
                          <LTTSelectItem key={c.id} value={c.id}>
                            {c.name}
                          </LTTSelectItem>
                        ))}
                      </LTTSelectContent>
                    </LTTSelect>
                  )}
                </div>
                <div className="space-y-2">
                  <LTTLabel>{t("admin.seatmap.wizard.form.screen_number_label")}</LTTLabel>
                  <LTTInput
                    type="number"
                    value={screenNumber}
                    onChange={(e) => setScreenNumber(e.target.value)}
                    placeholder="VD: 1, 2, 3..."
                  />
                </div>
                <div className="space-y-2">
                  <LTTLabel>{t("admin.seatmap.wizard.form.screen_type_label")}</LTTLabel>
                  <LTTSelect value={screenType} onValueChange={setScreenType}>
                    <LTTSelectTrigger>
                      <LTTSelectValue placeholder={t("admin.seatmap.wizard.form.screen_type_placeholder")} />
                    </LTTSelectTrigger>
                    <LTTSelectContent>
                      {screenTypes.map((t) => (
                        <LTTSelectItem key={t} value={t}>
                          {t}
                        </LTTSelectItem>
                      ))}
                    </LTTSelectContent>
                  </LTTSelect>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <LTTLabel>{t("admin.seatmap.wizard.form.estimated_seats_label")}</LTTLabel>
                  <LTTInput
                    type="number"
                    value={seatCount}
                    onChange={(e) => setSeatCount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground-shadcn">
                    {t("admin.seatmap.wizard.form.estimated_seats_hint")}
                  </p>
                </div>
                  </>
                )}
              </div>
            )}

            {((step === 2 && !isSeatMapMode) || (step === 1 && isSeatMapMode)) && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Screen Area */}
                <div className="flex-1 space-y-6 min-w-0">
                  <div className="space-y-4 px-10">
                    <div
                      className="relative mx-auto h-8 flex items-center justify-center rounded-md"
                      style={{
                        background: "linear-gradient(180deg, oklch(0.6 0.18 20 / 0.9) 0%, oklch(0.6 0.18 20 / 0.4) 100%)",
                        clipPath: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
                        maxWidth: "80%",
                      }}
                    >
                      <span className="text-[10px] font-bold tracking-[0.4em] text-white uppercase">
                        {t("admin.seatmap.wizard.canvas.screen_display")}
                      </span>
                    </div>
                  </div>

                  {/* Grid with outer border */}
                  <div
                    ref={gridRef}
                    className="flex flex-col items-center gap-0 select-none overflow-x-auto pb-2"
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Top border row */}
                    <div className="flex items-center gap-0.5 mb-0.5">
                      {/* Spacer: aligns with w-8 row label */}
                      <div className="w-8 shrink-0" />
                      {borderTop.map((bt, i) => (
                        <div
                          key={`bt-${i}`}
                          className={cn(
                            "h-7 w-7 rounded-sm flex items-center justify-center cursor-pointer border transition-all",
                            getBorderCellBgClass(bt)
                          )}
                          onClick={() => handleBorderClick("top", i)}
                          title={bt === "empty" ? "" : bt}
                        >
                          {getBorderCellContent(bt)}
                        </div>
                      ))}
                    </div>

                    {/* Internal rows */}
                    {grid.map((row, rIdx) => {
                      const isWalkwayRow = row.every((c) => c.type === "walkway");
                      return (
                        <div
                          key={rIdx}
                          className="flex items-center gap-0.5 mb-0.5"
                        >
                          {/* Row label */}
                          <span className="w-8 text-[11px] font-bold text-muted-foreground-shadcn text-right pr-2">
                            {isWalkwayRow ? "—" : row[0]?.row || ""}
                          </span>

                          {/* Left border */}
                          <div
                            className={cn(
                              "h-7 w-7 rounded-sm flex items-center justify-center cursor-pointer border transition-all",
                              getBorderCellBgClass(borderLeft[rIdx] ?? "empty")
                            )}
                            onClick={() => handleBorderClick("left", rIdx)}
                          >
                            {getBorderCellContent(borderLeft[rIdx] ?? "empty")}
                          </div>

                          {/* Cells */}
                          <div className="flex items-center gap-0.5">
                            {row.map((cell, cIdx) => {
                              const cellIsInDrag = isInDragArea(rIdx, cIdx);
                              const borderClass =
                                cell.type === "empty"
                                  ? "border-dashed border-border-shadcn/70"
                                  : "border-transparent";

                              const seatBg = getSeatCellBgClass(cell);

                              // Continuation merging: keep the "merged rectangle" feel for horizontal seats
                              let roundedClass = "rounded-sm";
                              if (cell.type === "seat_continuation") {
                                const st = getSeatType(cell.seatTypeId);
                                const orientation = st?.orientation || "square";
                                if (orientation === "horizontal") {
                                  const nextCell = row[cIdx + 1];
                                  const isLast =
                                    !nextCell ||
                                    nextCell.type !== "seat_continuation" ||
                                    nextCell.originCol !== cell.originCol;
                                  roundedClass = isLast
                                    ? "rounded-r-sm"
                                    : "rounded-none";
                                } else if (st?.orientation === "vertical") {
                                  roundedClass = "rounded-none";
                                }
                              }

                              return (
                                <div
                                  key={`${rIdx}-${cIdx}`}
                                  className={cn(
                                    "h-7 w-7 flex items-center justify-center cursor-pointer transition-all border shadow-sm hover:scale-105 active:scale-95",
                                    seatBg,
                                    borderClass,
                                    roundedClass,
                                    cellIsInDrag && "ring-2 ring-primary-shadcn ring-offset-2"
                                  )}
                                  onClick={() => handleCellClick(rIdx, cIdx)}
                                  onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                                  onMouseOver={() => handleMouseOver(rIdx, cIdx)}
                                >
                                  {getSeatCellDisplay(cell)}
                                </div>
                              );
                            })}
                          </div>

                          {/* Right border */}
                          <div
                            className={cn(
                              "h-7 w-7 rounded-sm flex items-center justify-center cursor-pointer border transition-all",
                              getBorderCellBgClass(borderRight[rIdx] ?? "empty")
                            )}
                            onClick={() => handleBorderClick("right", rIdx)}
                          >
                            {getBorderCellContent(borderRight[rIdx] ?? "empty")}
                          </div>
                        </div>
                      );
                    })}

                    {/* Bottom border row */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {/* Spacer: aligns with w-8 row label */}
                      <div className="w-8 shrink-0" />
                      {borderBottom.map((bt, i) => (
                        <div
                          key={`bb-${i}`}
                          className={cn(
                            "h-7 w-7 rounded-sm flex items-center justify-center cursor-pointer border transition-all",
                            getBorderCellBgClass(bt)
                          )}
                          onClick={() => handleBorderClick("bottom", i)}
                          title={bt === "empty" ? "" : bt}
                        >
                          {getBorderCellContent(bt)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-border-shadcn bg-muted-shadcn/20 px-6 py-4 text-xs">
                    <div className="flex items-center gap-1.5 font-bold mr-4">
                      {t("admin.seatmap.wizard.canvas.total_seats")}:{" "}
                      <span className="text-primary-shadcn text-sm">
                        {actualSeatCount}
                      </span>
                    </div>

                    {orderedSeatTypes.map((st) => (
                      <div key={st.id} className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "h-3.5 w-3.5 rounded-sm shadow-sm",
                            getSeatTypeColor(st.id).bg
                          )}
                        />
                        <span className="text-muted-foreground-shadcn">
                          {st.name}
                        </span>
                      </div>
                    ))}

                    <div className="h-4 w-px bg-border-shadcn mx-2" />

                    <div className="flex items-center gap-1.5">
                      <div className="h-3.5 w-3.5 rounded-sm bg-muted-shadcn/50 border border-dashed border-border-shadcn" />
                      <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.available")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Footprints className="h-3.5 w-3.5 text-muted-foreground-shadcn" />
                      <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.walkway")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.emergency_exit")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DoorOpen className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-muted-foreground-shadcn">{t("admin.seatmap.viewer.legend.door")}</span>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar Tools */}
                <div className="w-full lg:w-72 shrink-0 space-y-5 rounded-xl border border-border-shadcn bg-card p-5 shadow-sm">
                  <div className="space-y-3">
                    <LTTLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground-shadcn">
                      {t("admin.seatmap.wizard.grid.title")}
                    </LTTLabel>

                    <LTTSelect value={layoutType} onValueChange={(v) => setLayoutType(v as LayoutType)}>
                      <LTTSelectTrigger>
                        <LTTSelectValue placeholder={t("admin.seatmap.wizard.grid.layout_placeholder")} />
                      </LTTSelectTrigger>
                      <LTTSelectContent>
                        <LTTSelectItem value="rectangle">Rectangle</LTTSelectItem>
                        <LTTSelectItem value="square">Square</LTTSelectItem>
                        <LTTSelectItem value="curve">Curve</LTTSelectItem>
                      </LTTSelectContent>
                    </LTTSelect>

                    {layoutType === "square" ? (
                      <div className="space-y-2">
                        <LTTLabel className="text-[10px]">{t("admin.seatmap.wizard.grid.size")}</LTTLabel>
                        <LTTInput
                          type="number"
                          min={1}
                          max={30}
                          className="h-9 text-sm"
                          value={gridSize}
                          onChange={(e) => setGridSize(Number(e.target.value) || 1)}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 my-3">
                        <div className="space-y-1.5">
                          <LTTLabel className="text-[10px]">{t("admin.seatmap.wizard.grid.rows")}</LTTLabel>
                          <LTTInput
                            type="number"
                            min={1}
                            max={26}
                            className="h-9 text-sm"
                            value={rows}
                            onChange={(e) => setRows(Number(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <LTTLabel className="text-[10px]">{t("admin.seatmap.wizard.grid.cols")}</LTTLabel>
                          <LTTInput
                            type="number"
                            min={1}
                            max={30}
                            className="h-9 text-sm"
                            value={cols}
                            onChange={(e) => setCols(Number(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    )}

                    <LTTButton
                      variant="outline"
                      size="sm"
                      className="w-full h-9 text-xs font-medium"
                      onClick={handleRegenerateGrid}
                    >
                      <RotateCw className="h-4 w-4" /> {t("admin.seatmap.wizard.grid.reset")}
                    </LTTButton>
                  </div>

                  <div className="border-t border-border-shadcn pt-5 space-y-3">
                    <LTTLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground-shadcn">
                      {t("admin.seatmap.wizard.tools.title")}
                    </LTTLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-lg p-2.5 text-[10px] font-bold transition-all border",
                          activeTool === "select"
                            ? "border-primary-shadcn bg-primary-shadcn/5 text-primary-shadcn"
                            : "border-transparent text-muted-foreground-shadcn hover:bg-muted-shadcn"
                        )}
                        onClick={() => setActiveTool("select")}
                      >
                        <MousePointer2 className="h-5 w-5" />
                        <span>{t("admin.seatmap.wizard.tools.seat")}</span>
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-lg p-2.5 text-[10px] font-bold transition-all border",
                          activeTool === "walkway"
                            ? "border-primary-shadcn bg-primary-shadcn/5 text-primary-shadcn"
                            : "border-transparent text-muted-foreground-shadcn hover:bg-muted-shadcn"
                        )}
                        onClick={() => setActiveTool("walkway")}
                      >
                        <Footprints className="h-5 w-5" />
                        <span>{t("admin.seatmap.wizard.tools.walkway")}</span>
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-lg p-2.5 text-[10px] font-bold transition-all border",
                          activeTool === "emergency_exit"
                            ? "border-primary-shadcn bg-primary-shadcn/5 text-primary-shadcn"
                            : "border-transparent text-muted-foreground-shadcn hover:bg-muted-shadcn"
                        )}
                        onClick={() => setActiveTool("emergency_exit")}
                      >
                        <AlertTriangle className="h-5 w-5" />
                        <span>{t("admin.seatmap.wizard.tools.emergency_exit")}</span>
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-lg p-2.5 text-[10px] font-bold transition-all border",
                          activeTool === "door"
                            ? "border-primary-shadcn bg-primary-shadcn/5 text-primary-shadcn"
                            : "border-transparent text-muted-foreground-shadcn hover:bg-muted-shadcn"
                        )}
                        onClick={() => setActiveTool("door")}
                      >
                        <DoorOpen className="h-5 w-5" />
                        <span>{t("admin.seatmap.wizard.tools.door")}</span>
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-lg p-2.5 text-[10px] font-bold transition-all border col-span-2",
                          activeTool === "delete"
                            ? "border-destructive bg-destructive/5 text-destructive"
                            : "border-transparent text-muted-foreground-shadcn hover:bg-muted-shadcn"
                        )}
                        onClick={() => setActiveTool("delete")}
                      >
                        <Trash2 className="h-5 w-5" />
                        <span>{t("admin.seatmap.wizard.tools.delete_cell")}</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border-shadcn pt-5 space-y-3">
                    <LTTLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground-shadcn my-3">
                      {t("admin.seatmap.wizard.tools.seat_type_apply")}
                    </LTTLabel>
                    {getSeatTypeToolList()}
                  </div>
                </div>
              </div>
            )}
    </div>
  );

  const wizardFooter = (
    <>
      {step === 2 && (
              <LTTButton
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2 mr-auto"
              >
                <ArrowLeft className="h-4 w-4" /> {isSeatMapMode ? t("admin.seatmap.wizard.actions.back_to_design") : t("admin.seatmap.wizard.actions.back_to_info")}
              </LTTButton>
            )}

            <LTTButton variant="ghost" onClick={handleSafeClose}>
              {t("admin.seatmap.wizard.actions.cancel")}
            </LTTButton>

            {step === 1 && (
              <LTTButton onClick={goToStep2} className="gap-2 px-6">
                {isSeatMapMode ? t("admin.seatmap.wizard.actions.next_to_info") : t("admin.seatmap.wizard.actions.next_to_design")} <ArrowRight className="h-4 w-4" />
              </LTTButton>
            )}

      {step === 2 && (
        <LTTButton
          onClick={() => setConfirmOpen(true)}
          className="gap-2 px-8"
        >
          <Check className="h-4 w-4" />
          {isEditMode ? t("admin.seatmap.wizard.actions.finish_update") : t("admin.seatmap.wizard.actions.finish_create")}
        </LTTButton>
      )}
    </>
  );

  if (inline) {
    return (
      <>
        <div className="rounded-xl border border-border-shadcn bg-white shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-shadcn">
            <h2 className="font-semibold text-base">
              {step === 1
                ? (
                  isSeatMapMode
                    ? (isEditMode ? t("admin.seatmap.wizard.step_titles.edit_design") : t("admin.seatmap.wizard.step_titles.design"))
                    : (isEditMode ? t("admin.seatmap.wizard.step_titles.edit_screen_info") : t("admin.seatmap.wizard.step_titles.screen_info"))
                )
                : (
                  isSeatMapMode
                    ? (isEditMode ? t("admin.seatmap.wizard.step_titles.edit_map_info") : t("admin.seatmap.wizard.step_titles.map_info"))
                    : (isEditMode ? t("admin.seatmap.wizard.step_titles.edit_design") : t("admin.seatmap.wizard.step_titles.design"))
                )}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">{wizardContent}</div>
          <div className="px-6 py-4 border-t border-border-shadcn bg-muted-shadcn/10 flex items-center gap-3">
            {wizardFooter}
          </div>
        </div>

        {/* Confirm dialog */}
        <LTTDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <LTTDialogContent className="sm:max-w-sm bg-white">
            <LTTDialogHeader>
              <LTTDialogTitle>
                {isEditMode ? t("admin.seatmap.wizard.confirm.update_title") : t("admin.seatmap.wizard.confirm.create_title")}
              </LTTDialogTitle>
            </LTTDialogHeader>
            <div className="space-y-3 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground-shadcn">{t("admin.seatmap.wizard.confirm.cinema_label")}</span>
                <span className="font-bold">
                  {isSeatMapMode ? seatMapName : mockAdminCinemas.find((c) => c.id === cinemaId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground-shadcn">{isSeatMapMode ? t("admin.seatmap.wizard.confirm.description_label") : t("admin.seatmap.wizard.confirm.screen_label")}</span>
                <span className="font-bold">{isSeatMapMode ? (seatMapDescription || "—") : screenNumber}</span>
              </div>
              {!isSeatMapMode && <div className="flex justify-between">
                <span className="text-muted-foreground-shadcn">{t("admin.seatmap.wizard.confirm.screen_type_label")}</span>
                <span className="font-bold">{screenType}</span>
              </div>}
              <div className="flex justify-between border-t border-border-shadcn pt-2 mt-2">
                <span className="text-muted-foreground-shadcn font-bold">{t("admin.seatmap.wizard.confirm.total_seats")}</span>
                <span className="font-bold text-primary-shadcn text-lg">{actualSeatCount}</span>
              </div>
            </div>
            <LTTDialogFooter>
              <LTTButton variant="outline" onClick={() => setConfirmOpen(false)}>{t("admin.seatmap.wizard.confirm.cancel")}</LTTButton>
              <LTTButton onClick={handleConfirmCreate} loading={isSubmitting} disabled={isSubmitting}>
                {isEditMode ? t("admin.seatmap.wizard.confirm.confirm_update") : t("admin.seatmap.wizard.confirm.confirm_create")}
              </LTTButton>
            </LTTDialogFooter>
          </LTTDialogContent>
        </LTTDialog>

        {/* Exit confirm dialog */}
        <LTTDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
          <LTTDialogContent className="sm:max-w-sm bg-white">
            <LTTDialogHeader>
              <LTTDialogTitle>{t("admin.seatmap.wizard.exit_confirm.title")}</LTTDialogTitle>
            </LTTDialogHeader>
            <div className="py-2 text-sm text-muted-foreground-shadcn leading-relaxed">
              {t("admin.seatmap.wizard.exit_confirm.message")}
            </div>
            <LTTDialogFooter className="gap-3 mx-1">
              <LTTButton variant="outline" onClick={() => setExitConfirmOpen(false)} className="flex-1">
                {t("admin.seatmap.wizard.exit_confirm.stay")}
              </LTTButton>
              <LTTButton variant="destructive" onClick={handleConfirmExit} className="flex-1">
                {t("admin.seatmap.wizard.exit_confirm.exit_discard")}
              </LTTButton>
            </LTTDialogFooter>
          </LTTDialogContent>
        </LTTDialog>
      </>
    );
  }

  // Default: dialog mode
  return (
    <>
      <LTTDialog open onOpenChange={handleSafeClose}>
        <LTTDialogContent className="sm:max-w-6xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white">
          <LTTDialogHeader className="px-6 py-4 border-b border-border-shadcn">
            <LTTDialogTitle>
              {step === 1
                ? (
                  isSeatMapMode
                    ? (isEditMode ? t("admin.seatmap.wizard.step_titles.edit_design") : t("admin.seatmap.wizard.step_titles.design"))
                    : (isEditMode ? t("admin.seatmap.wizard.step_titles.edit_screen_info") : t("admin.seatmap.wizard.step_titles.screen_info"))
                )
                : (
                  isSeatMapMode
                    ? (isEditMode ? t("admin.seatmap.wizard.step_titles.edit_map_info") : t("admin.seatmap.wizard.step_titles.map_info"))
                    : (isEditMode ? t("admin.seatmap.wizard.step_titles.edit_design") : t("admin.seatmap.wizard.step_titles.design"))
                )}
            </LTTDialogTitle>
          </LTTDialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {wizardContent}
          </div>

          <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn bg-muted-shadcn/10 gap-3">
            {wizardFooter}
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <LTTDialogContent className="sm:max-w-sm bg-white">
          <LTTDialogHeader>
            <LTTDialogTitle>
              {isEditMode ? t("admin.seatmap.wizard.confirm.update_title") : t("admin.seatmap.wizard.confirm.create_title")}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="space-y-3 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground-shadcn">{isSeatMapMode ? t("admin.seatmap.wizard.confirm.name_label") : t("admin.seatmap.wizard.confirm.cinema_label")}</span>
              <span className="font-bold">
                {isSeatMapMode ? seatMapName : mockAdminCinemas.find((c) => c.id === cinemaId)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground-shadcn">{isSeatMapMode ? t("admin.seatmap.wizard.confirm.description_label") : t("admin.seatmap.wizard.confirm.screen_label")}</span>
              <span className="font-bold">{isSeatMapMode ? (seatMapDescription || "—") : screenNumber}</span>
            </div>
            {!isSeatMapMode && <div className="flex justify-between">
              <span className="text-muted-foreground-shadcn">{t("admin.seatmap.wizard.confirm.screen_type_label")}</span>
              <span className="font-bold">{screenType}</span>
            </div>}
            <div className="flex justify-between border-t border-border-shadcn pt-2 mt-2">
              <span className="text-muted-foreground-shadcn font-bold">{t("admin.seatmap.wizard.confirm.total_seats")}</span>
              <span className="font-bold text-primary-shadcn text-lg">{actualSeatCount}</span>
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setConfirmOpen(false)}>{t("admin.seatmap.wizard.confirm.cancel")}</LTTButton>
            <LTTButton onClick={handleConfirmCreate} loading={isSubmitting} disabled={isSubmitting}>
              {isEditMode ? t("admin.seatmap.wizard.confirm.confirm_update") : t("admin.seatmap.wizard.confirm.confirm_create")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <LTTDialogContent className="sm:max-w-sm bg-white">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.seatmap.wizard.exit_confirm.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-2 text-sm text-muted-foreground-shadcn leading-relaxed">
            {t("admin.seatmap.wizard.exit_confirm.message")}
          </div>
          <LTTDialogFooter className="gap-3">
            <LTTButton variant="outline" onClick={() => setExitConfirmOpen(false)} className="flex-1">
              {t("admin.seatmap.wizard.exit_confirm.stay")}
            </LTTButton>
            <LTTButton variant="destructive" onClick={handleConfirmExit} className="flex-1">
              {t("admin.seatmap.wizard.exit_confirm.exit_discard")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </>
  );
}
