"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { toast } from "sonner";
import {
  currentStaff,
  mockStaffShowtimes,
  mockBookings,
  generateSeatAvailability,
  type StaffShowtime,
  type StaffBooking,
  type SeatAvailability,
} from "@/src/app/(administration)/administration/_shared/staffMockData";

import ShowtimeList from "./components/ShowtimeList";
import CheckInStation, { type CheckInState } from "./components/CheckInStation";
import SeatHeatmap from "./components/SeatHeatmap";

export default function StaffDashboard() {
  const navigate = useRouter();
  const [clock, setClock] = useState(new Date());
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [lookupState, setLookupState] = useState<CheckInState>("idle");
  const [foundBooking, setFoundBooking] = useState<StaffBooking | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<StaffShowtime | null>(null);
  const [seatData, setSeatData] = useState<SeatAvailability[]>([]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = clock.toLocaleTimeString("en-GB");
  const totalToday = mockStaffShowtimes.length;
  const nowShowing = mockStaffShowtimes.filter((s) => s.status === "live").length;

  const handleSelectShowtime = (st: StaffShowtime) => {
    setSelectedShowtime(st);
    setSeatData(generateSeatAvailability(st.id));
  };

  const handleLookup = () => {
    if (!bookingIdInput.trim()) return;
    const found = mockBookings.find(
      (b) => b.id.toLowerCase() === bookingIdInput.trim().toLowerCase()
    );
    if (!found) {
      setFoundBooking(null);
      setLookupState("not_found");
    } else if (found.status === "checked_in") {
      setFoundBooking(found);
      setLookupState("checked_in");
    } else {
      setFoundBooking(found);
      setLookupState("ready");
    }
  };

  const handleCheckIn = () => {
    if (!foundBooking) return;
    toast.success(`Checked in ${foundBooking.customerName} — ${foundBooking.seats.join(", ")}`);
    setFoundBooking(null);
    setLookupState("idle");
    setBookingIdInput("");
  };

  const bookedCount = seatData.filter((s) => s.status === "booked").length;
  const totalSeats = seatData.length;
  const occupancy = totalSeats > 0 ? Math.round((bookedCount / totalSeats) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-border-shadcn bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-shadcn/10 text-primary-shadcn text-xs font-bold border border-primary-shadcn/20">
            {currentStaff.name.split(" ").map((w) => w[0]).join("")}
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 leading-tight">{currentStaff.name}</p>
            <p className="text-xs text-muted-shadcn-foreground">{currentStaff.cinemaName} · {currentStaff.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-mono text-sm tabular-nums text-gray-600">{timeStr}</span>
          <LTTButton
            variant="outline"
            className="h-9 rounded-lg border-border-shadcn text-sm font-semibold gap-1.5 hover:bg-muted-shadcn"
            onClick={() => navigate.push("/administration/pos/dashboard")}
          >
            Open POS <ExternalLink className="h-3.5 w-3.5" />
          </LTTButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <ShowtimeList
          showtimes={mockStaffShowtimes}
          selectedId={selectedShowtime?.id ?? null}
          totalToday={totalToday}
          nowShowing={nowShowing}
          onSelect={handleSelectShowtime}
        />

        <div className="space-y-4">
          <CheckInStation
            bookingIdInput={bookingIdInput}
            lookupState={lookupState}
            foundBooking={foundBooking}
            onInputChange={setBookingIdInput}
            onLookup={handleLookup}
            onCheckIn={handleCheckIn}
          />
          <SeatHeatmap
            selectedShowtimeTitle={selectedShowtime?.movieTitle ?? null}
            seatData={seatData}
            bookedCount={bookedCount}
            totalSeats={totalSeats}
            occupancy={occupancy}
          />
        </div>
      </div>
    </div>
  );
}
