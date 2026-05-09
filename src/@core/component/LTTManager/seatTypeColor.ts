"use client";

import type { CSSProperties } from "react";

type SeatTypeColor = {
  bg: string;
  border: string;
  text: string;
};

const SEAT_TYPE_PALETTE: SeatTypeColor[] = [
  { bg: "bg-blue-500", border: "border-blue-600", text: "text-white" },
  { bg: "bg-amber-500", border: "border-amber-600", text: "text-white" },
  { bg: "bg-pink-500", border: "border-pink-600", text: "text-white" },
  { bg: "bg-purple-500", border: "border-purple-600", text: "text-white" },
  { bg: "bg-green-500", border: "border-green-600", text: "text-white" },
];

const getSeatTypeColorIndex = (seatTypeId?: number): number => {
  const id = Number(seatTypeId);
  if (!Number.isFinite(id)) return 0;
  if (id >= 1) return (id - 1) % SEAT_TYPE_PALETTE.length;
  return Math.abs(id) % SEAT_TYPE_PALETTE.length;
};

const normalizeSeatTypeName = (name?: string): string => (name || "").trim().toLowerCase();

/** `#RRGGBB` only (leading `#`, exactly 6 hex digits). */
export function isValidSeatColorHex(v?: string | null): v is string {
  return typeof v === "string" && /^#[0-9A-Fa-f]{6}$/.test(v.trim());
}

function darkenHex(hex: string, factor = 0.72): string {
  const trimmed = hex.trim();
  const m = /^#([0-9A-Fa-f]{6})$/.exec(trimmed);
  if (!m) return trimmed;
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 0xff) * factor);
  const g = Math.round(((n >> 8) & 0xff) * factor);
  const b = Math.round((n & 0xff) * factor);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export const getSeatTypeColor = (seatTypeId?: number, seatTypeName?: string): SeatTypeColor => {
  const normalizedName = normalizeSeatTypeName(seatTypeName);

  if (normalizedName.includes("standard") || normalizedName.includes("economy")) {
    return SEAT_TYPE_PALETTE[0];
  }
  if (normalizedName.includes("vip") || normalizedName.includes("premium")) {
    return SEAT_TYPE_PALETTE[1];
  }
  if (normalizedName.includes("sweetbox") || normalizedName.includes("couple")) {
    return SEAT_TYPE_PALETTE[2];
  }

  return SEAT_TYPE_PALETTE[getSeatTypeColorIndex(seatTypeId)] ?? SEAT_TYPE_PALETTE[0];
};

export type SeatTypeAppearance = {
  className: string;
  style?: CSSProperties;
};

/**
 * Prefer configured hex from API/layout snapshot; fall back to semantic palette by id/name.
 */
export function getSeatTypeAppearance(
  seatColorHex?: string | null,
  seatTypeId?: number,
  seatTypeName?: string,
): SeatTypeAppearance {
  const hex = seatColorHex?.trim();
  if (hex !== undefined && isValidSeatColorHex(hex)) {
    const fill = hex;
    return {
      className: "border text-white",
      style: {
        backgroundColor: fill,
        borderColor: darkenHex(fill),
      },
    };
  }

  const palette = getSeatTypeColor(seatTypeId, seatTypeName);
  return {
    className: `${palette.bg} ${palette.border} ${palette.text}`.trim(),
  };
}
