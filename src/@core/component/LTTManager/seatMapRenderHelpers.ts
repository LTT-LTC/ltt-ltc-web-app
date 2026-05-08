"use client";

import { type SeatLayout, type SeatLayoutSeat } from "@/src/@core/const/mock/adminMockData";

type CellType = "seat" | "walkway" | "emergency_exit" | "door" | "empty";

export function getCellType(seat: SeatLayoutSeat): CellType {
  if (!seat.type || seat.type === "seat") return "seat";
  return seat.type as CellType;
}

export function extractSeatNumber(seatCode?: string): string {
  if (!seatCode) return "";
  return seatCode.replace(/^[A-Z]+/, "");
}

export function resolveContinuationNumber(
  seats: SeatLayoutSeat[],
  seatIndex: number,
  fallbackRows: SeatLayout["rows"],
  rowIndex?: number,
): string {
  const current = seats[seatIndex];
  if (!current) return "";

  // Prefer left origin in the same row (horizontal multi-seat).
  for (let i = seatIndex - 1; i >= 0; i--) {
    const candidate = seats[i];
    if (getCellType(candidate) !== "seat") continue;
    if ((candidate.seatTypeId ?? 0) !== (current.seatTypeId ?? 0)) continue;
    const num = extractSeatNumber(candidate.seatCode);
    if (num) return num;
  }

  // Fallback to previous rows same visual column (vertical multi-seat).
  if (typeof rowIndex === "number") {
    for (let r = rowIndex - 1; r >= 0; r--) {
      const candidate = fallbackRows[r]?.seats?.[seatIndex];
      if (!candidate) continue;
      if (getCellType(candidate) !== "seat") continue;
      if ((candidate.seatTypeId ?? 0) !== (current.seatTypeId ?? 0)) continue;
      const num = extractSeatNumber(candidate.seatCode);
      if (num) return num;
    }
  }

  return "";
}

export function getSeatMergeClasses(seats: SeatLayoutSeat[], seatIndex: number): string {
  const seat = seats[seatIndex];
  if (!seat || getCellType(seat) !== "seat") return "";

  const prevSeat = seats[seatIndex - 1];
  const nextSeat = seats[seatIndex + 1];

  const isSameAsPrev =
    !!prevSeat &&
    getCellType(prevSeat) === "seat" &&
    (prevSeat.seatTypeId ?? 0) === (seat.seatTypeId ?? 0) &&
    !prevSeat.seatCode;

  const isSameAsNext =
    !!nextSeat &&
    getCellType(nextSeat) === "seat" &&
    (nextSeat.seatTypeId ?? 0) === (seat.seatTypeId ?? 0) &&
    !nextSeat.seatCode;

  const isOriginWithContinuation = !!seat.seatCode && isSameAsNext;
  const isContinuation = !seat.seatCode && (isSameAsPrev || isSameAsNext);

  if (isOriginWithContinuation) return "rounded-l-sm rounded-r-none";
  if (isContinuation) return isSameAsNext ? "rounded-none" : "rounded-r-sm rounded-l-none";

  return "";
}

