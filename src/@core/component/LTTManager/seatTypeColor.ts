"use client";

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

export const getSeatTypeColor = (seatTypeId?: number, seatTypeName?: string): SeatTypeColor => {
  const normalizedName = normalizeSeatTypeName(seatTypeName);

  // Keep semantic colors stable across manager/customer regardless of backend id ordering.
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

