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

export const getSeatTypeColor = (seatTypeId?: number): SeatTypeColor =>
  SEAT_TYPE_PALETTE[getSeatTypeColorIndex(seatTypeId)] ?? SEAT_TYPE_PALETTE[0];

