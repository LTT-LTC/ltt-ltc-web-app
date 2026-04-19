import { mockAdminShowtimes, mockAdminMovies, mockAdminCinemas, mockScreens, mockFnBItems, type SeatLayout, mockSeatTypes } from "./adminMockData";

// ─── Staff Showtimes (today-focused) ───
export interface StaffShowtime {
  id: string;
  movieTitle: string;
  screenNumber: number;
  screenType: string;
  seatCount: number;
  date: string;
  startTime: string;
  endTime: string;
  format: string;
  status: "ended" | "live" | "starting_soon" | "open" | "full";
  bookedSeats: number;
}

export const mockStaffShowtimes: StaffShowtime[] = [
  { id: "st-t1", movieTitle: "Avengers: Doomsday", screenNumber: 3, screenType: "2D", seatCount: 187, date: "2026-04-15", startTime: "09:15", endTime: "11:30", format: "2D", status: "ended", bookedSeats: 120 },
  { id: "st-t2", movieTitle: "Thunderbolts", screenNumber: 1, screenType: "IMAX", seatCount: 210, date: "2026-04-15", startTime: "11:30", endTime: "13:40", format: "IMAX", status: "live", bookedSeats: 195 },
  { id: "st-t3", movieTitle: "Mission Impossible 8", screenNumber: 2, screenType: "2D", seatCount: 156, date: "2026-04-15", startTime: "13:45", endTime: "15:55", format: "2D", status: "open", bookedSeats: 98 },
  { id: "st-t4", movieTitle: "Avengers: Doomsday", screenNumber: 4, screenType: "3D", seatCount: 187, date: "2026-04-15", startTime: "14:00", endTime: "16:15", format: "3D", status: "open", bookedSeats: 45 },
  { id: "st-t5", movieTitle: "Thunderbolts", screenNumber: 1, screenType: "IMAX", seatCount: 210, date: "2026-04-15", startTime: "16:20", endTime: "18:30", format: "IMAX", status: "open", bookedSeats: 130 },
  { id: "st-t6", movieTitle: "Mission Impossible 8", screenNumber: 2, screenType: "2D", seatCount: 156, date: "2026-04-15", startTime: "18:30", endTime: "20:40", format: "2D", status: "open", bookedSeats: 88 },
  { id: "st-t7", movieTitle: "Avengers: Doomsday", screenNumber: 3, screenType: "IMAX", seatCount: 187, date: "2026-04-15", startTime: "20:00", endTime: "22:15", format: "IMAX", status: "full", bookedSeats: 187 },
  { id: "st-t8", movieTitle: "Thunderbolts", screenNumber: 5, screenType: "2D", seatCount: 140, date: "2026-04-15", startTime: "22:15", endTime: "00:25", format: "2D", status: "open", bookedSeats: 30 },
];

// ─── Booking for check-in ───
export interface StaffBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  movieTitle: string;
  showtimeId: string;
  showtime: string;
  screenNumber: number;
  seats: string[];
  products: { name: string; qty: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  status: "confirmed" | "checked_in" | "cancelled";
  createdAt: string;
}

export const mockBookings: StaffBooking[] = [
  { id: "BK-20260415-001", customerName: "Nguyễn Văn An", customerPhone: "0901234567", movieTitle: "Thunderbolts", showtimeId: "st-t2", showtime: "11:30", screenNumber: 1, seats: ["C3", "C4"], products: [{ name: "Bắp rang bơ (L)", qty: 1, price: 59000 }], totalAmount: 309000, paymentMethod: "VNPay", status: "confirmed", createdAt: "2026-04-14 20:30" },
  { id: "BK-20260415-002", customerName: "Trần Thị Bích", customerPhone: "0912345678", movieTitle: "Mission Impossible 8", showtimeId: "st-t3", showtime: "13:45", screenNumber: 2, seats: ["A5", "A6", "A7"], products: [], totalAmount: 285000, paymentMethod: "Card", status: "confirmed", createdAt: "2026-04-14 22:15" },
  { id: "BK-20260415-003", customerName: "Lê Hoàng Nam", customerPhone: "0923456789", movieTitle: "Thunderbolts", showtimeId: "st-t2", showtime: "11:30", screenNumber: 1, seats: ["D8"], products: [{ name: "Combo Couple", qty: 1, price: 129000 }], totalAmount: 254000, paymentMethod: "Cash", status: "checked_in", createdAt: "2026-04-15 10:00" },
  { id: "BK-20260415-004", customerName: "Phạm Minh Đức", customerPhone: "0934567890", movieTitle: "Avengers: Doomsday", showtimeId: "st-t4", showtime: "14:00", screenNumber: 4, seats: ["B2", "B3"], products: [{ name: "Nachos Phô Mai", qty: 1, price: 45000 }, { name: "Coca-Cola (L)", qty: 2, price: 35000 }], totalAmount: 325000, paymentMethod: "VNPay", status: "confirmed", createdAt: "2026-04-15 08:45" },
];

// ─── Seat availability mock ───
export type SeatStatus = "available" | "booked" | "selected";

export interface SeatAvailability {
  code: string;
  row: string;
  col: number;
  status: SeatStatus;
  seatTypeId: number;
  price: number;
}

export function generateSeatAvailability(showtimeId: string): SeatAvailability[] {
  const rows = ["A", "B", "C", "D"];
  const cols = 10;
  const basePrice = 95000;
  const seats: SeatAvailability[] = [];
  // Deterministic "random" based on showtimeId
  const seed = showtimeId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  for (let r = 0; r < rows.length; r++) {
    let logicalSeatId = 0;
    for (let c = 1; c <= cols; c++) {
      const hash = (seed + r * cols + c) % 10;
      // Some seats are "empty" (walkway etc.)
      if ((r === 0 && (c === 1 || c === 4 || c === 8)) || (r === 1 && c === 3)) continue;

      const seatTypeId = r === 3 ? 3 : 1; // row 3 gets Sweetbox (id: 3)
      
      // Sweetbox occupies 2 horizontal spaces. We skip logging a ticket for the second space.
      if (seatTypeId === 3 && c % 2 === 0) continue;

      logicalSeatId++;

      seats.push({
        code: `${rows[r]}${logicalSeatId}`,
        row: rows[r],
        col: c,
        status: hash < 5 ? "booked" : "available",
        seatTypeId,
        price: seatTypeId === 3 ? basePrice * 2.0 : basePrice,
      });
    }
  }
  return seats;
}

/**
 * Converts a flat SeatAvailability list into the SeatLayout shape
 * consumed by LTTSeatMapViewer.
 * Booked/available status is carried via the returned array —
 * callers should pass `bookedSeats` separately to the viewer.
 */
export function generateSeatLayout(seats: SeatAvailability[]): SeatLayout {
  const rowMap: Record<string, SeatAvailability[]> = {};
  let maxCol = 10; // Default fallback

  for (const seat of seats) {
    if (!rowMap[seat.row]) rowMap[seat.row] = [];
    rowMap[seat.row].push(seat);
    if (seat.col > maxCol) maxCol = seat.col;
  }

  const innerRows = Object.entries(rowMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([row, rowSeats]) => {
      // Build exactly `maxCol` cells to keep alignment in flex
      const paddedSeats: any[] = [];
      
      // Left exterior empty border cell
      paddedSeats.push({ seatCode: "", x: 0, y: 0, seatTypeId: 0, type: "empty" as const });

      for (let c = 1; c <= maxCol; c++) {
        const s = rowSeats.find((x) => x.col === c);
        if (s) {
          paddedSeats.push({
            seatCode: s.code,
            x: s.col * 40,
            y: 0,
            seatTypeId: s.seatTypeId,
            type: "seat" as const,
          });

          const st = mockSeatTypes.find((t) => t.id === s.seatTypeId);
          const occupied = st?.seatOccupied || 1;

          // Push continuations for multi-cell seats exactly like the DB does
          for (let i = 1; i < occupied; i++) {
            c++;
            paddedSeats.push({
              seatCode: "",
              x: c * 40,
              y: 0,
              seatTypeId: s.seatTypeId,
              // Continuation cells lack a "type" field natively
            });
          }
        } else {
          // Fill gap correctly
          paddedSeats.push({
            seatCode: "", x: c * 40, y: 0, seatTypeId: 0, type: "empty" as const
          });
        }
      }

      // Right exterior empty border cell
      paddedSeats.push({ seatCode: "", x: 0, y: 0, seatTypeId: 0, type: "empty" as const });

      return {
        row,
        seats: paddedSeats,
      };
    });

  if (innerRows.length === 0) return { rows: [] };

  const numCols = innerRows[0].seats.length;
  
  const createEmptyRow = () => ({
    row: "",
    seats: Array.from({ length: numCols }).map(() => ({
      seatCode: "", x: 0, y: 0, seatTypeId: 0, type: "empty" as const
    }))
  });

  return { rows: [createEmptyRow(), ...innerRows, createEmptyRow()] };
}


// ─── POS Products & Combos ───
export interface POSProduct {
  id: string;
  name: string;
  price: number;
  category: "product" | "combo";
  description?: string;
  savings?: number;
}

export const posProducts: POSProduct[] = [
  { id: "pos-1", name: "Large Popcorn", price: 65000, category: "product" },
  { id: "pos-2", name: "Medium Pepsi", price: 40000, category: "product" },
  { id: "pos-3", name: "Nachos + Salsa", price: 55000, category: "product" },
  { id: "pos-4", name: "Hotdog", price: 50000, category: "product" },
  { id: "pos-5", name: "Couple Combo", price: 130000, category: "combo", description: "2× Large Popcorn + 2× Pepsi", savings: 20000 },
  { id: "pos-6", name: "Solo Snack", price: 95000, category: "combo", description: "1× Large Popcorn + 1× Pepsi", savings: 10000 },
];

// ─── Current staff context ───
export const currentStaff = {
  id: "s-3",
  name: "Tran Nguyen",
  role: "Staff",
  cinemaName: "Galaxy Cinema — Nguyen Hue",
};
