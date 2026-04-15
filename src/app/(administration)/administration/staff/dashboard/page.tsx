"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Search, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
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

const statusConfig: Record<StaffShowtime["status"], { label: string; cls: string }> = {
  ended: { label: "Ended", cls: "bg-muted text-muted-foreground" },
  live: { label: "Live", cls: "bg-red-100 text-red-700" },
  starting_soon: { label: "Starts 18m", cls: "bg-amber-100 text-amber-700" },
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-700" },
  full: { label: "Full", cls: "bg-orange-100 text-orange-700" },
};

const StaffDashboard = () => {
  const navigate = useRouter();
  const [clock, setClock] = useState(new Date());
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [lookupResult, setLookupResult] = useState<{ booking: StaffBooking | null; state: "idle" | "not_found" | "checked_in" | "ready" }>(
    { booking: null, state: "idle" }
  );
  const [selectedShowtime, setSelectedShowtime] = useState<StaffShowtime | null>(null);
  const [seatData, setSeatData] = useState<SeatAvailability[]>([]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = clock.toLocaleTimeString("en-GB");

  const totalToday = mockStaffShowtimes.length;
  const nowShowing = mockStaffShowtimes.filter((s) => s.status === "live").length;

  // Select showtime and generate seat data
  const handleSelectShowtime = (st: StaffShowtime) => {
    setSelectedShowtime(st);
    setSeatData(generateSeatAvailability(st.id));
  };

  // Booking lookup
  const handleLookup = () => {
    if (!bookingIdInput.trim()) return;
    const found = mockBookings.find((b) => b.id.toLowerCase() === bookingIdInput.trim().toLowerCase());
    if (!found) {
      setLookupResult({ booking: null, state: "not_found" });
    } else if (found.status === "checked_in") {
      setLookupResult({ booking: found, state: "checked_in" });
    } else {
      setLookupResult({ booking: found, state: "ready" });
    }
  };

  const handleCheckIn = () => {
    if (!lookupResult.booking) return;
    toast.success(`Checked in ${lookupResult.booking.customerName} — ${lookupResult.booking.seats.join(", ")}`);
    setLookupResult({ booking: null, state: "idle" });
    setBookingIdInput("");
  };

  // Seat heatmap
  const bookedCount = seatData.filter((s) => s.status === "booked").length;
  const totalSeats = seatData.length;
  const occupancy = totalSeats > 0 ? Math.round((bookedCount / totalSeats) * 100) : 0;

  // Group seats by row for heatmap
  const seatRows = useMemo(() => {
    const map: Record<string, SeatAvailability[]> = {};
    seatData.forEach((s) => {
      if (!map[s.row]) map[s.row] = [];
      map[s.row].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [seatData]);

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {currentStaff.name.split(" ").map((w) => w[0]).join("")}
          </div>
          <div>
            <p className="font-semibold text-sm">{currentStaff.name}</p>
            <p className="text-xs text-muted-foreground">{currentStaff.cinemaName} · {currentStaff.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg tabular-nums text-muted-foreground">{timeStr}</span>
          <LTTButton variant="outline" size="sm" className="gap-1.5" onClick={() => navigate.push("/staff/pos")}>
            Open POS <ExternalLink className="h-3.5 w-3.5" />
          </LTTButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Left: Today's Schedule ── */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Today's Schedule</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-2xl font-bold">{totalToday}</p>
                <p className="text-xs text-muted-foreground">total today</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-2xl font-bold">{nowShowing}</p>
                <p className="text-xs text-muted-foreground">now showing</p>
              </div>
            </div>

            <div className="space-y-0">
              {mockStaffShowtimes.map((st) => (
                <LTTButton
                  key={st.id}
                  onClick={() => handleSelectShowtime(st)}
                  className={`w-full flex items-center justify-between border-l-4 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    selectedShowtime?.id === st.id ? "bg-muted/60 border-l-primary" : "border-l-transparent"
                  } ${st.status === "ended" ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-11 pt-0.5">{st.startTime}</span>
                    <div>
                      <p className="text-sm font-semibold">{st.movieTitle}</p>
                      <p className="text-xs text-muted-foreground">Screen {st.screenNumber} · {st.screenType} · {st.seatCount} seats</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusConfig[st.status].cls}`}>
                    {statusConfig[st.status].label}
                  </span>
                </LTTButton>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Check-in + Seat Availability ── */}
        <div className="space-y-4">
          {/* Check-in Station */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Check-In Station</h2>
            <div className="flex gap-2 mb-3">
              <LTTInput
                placeholder="Booking ID or scan QR..."
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              />
              <LTTButton variant="outline" onClick={handleLookup}>Look up</LTTButton>
            </div>

            {lookupResult.state === "idle" && (
              <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-4 text-center">
                Enter a booking ID or scan a QR code to begin
              </p>
            )}

            {lookupResult.state === "not_found" && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <XCircle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Booking not found</p>
                  <p className="text-muted-foreground text-xs">Check the booking ID and try again.</p>
                </div>
              </div>
            )}

            {lookupResult.state === "checked_in" && lookupResult.booking && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm space-y-1">
                <div className="flex items-center gap-2 text-amber-700 font-medium">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  Already checked in
                </div>
                <p className="text-xs text-muted-foreground">{lookupResult.booking.customerName} — {lookupResult.booking.movieTitle} {lookupResult.booking.showtime}</p>
                <p className="text-xs text-muted-foreground">Seats: {lookupResult.booking.seats.join(", ")}</p>
              </div>
            )}

            {lookupResult.state === "ready" && lookupResult.booking && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  Ready to check in
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p><strong>Customer:</strong> {lookupResult.booking.customerName}</p>
                  <p><strong>Movie:</strong> {lookupResult.booking.movieTitle} @ {lookupResult.booking.showtime}</p>
                  <p><strong>Screen:</strong> {lookupResult.booking.screenNumber} · Seats: {lookupResult.booking.seats.join(", ")}</p>
                </div>
                <LTTButton className="w-full mt-2" onClick={handleCheckIn}>
                  Mark as checked in
                </LTTButton>
              </div>
            )}
          </div>

          {/* Seat Availability Heatmap */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Seat Availability — {selectedShowtime ? "Selected Showtime" : "Select a showtime"}
            </h2>

            {selectedShowtime ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Booked</span>
                    <span className="ml-2 font-semibold">{bookedCount} / {totalSeats}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="ml-2 font-semibold">{occupancy}%</span>
                  </div>
                </div>

                {/* Heatmap grid */}
                <div className="space-y-1">
                  {seatRows.map(([row, seats]) => (
                    <div key={row} className="flex gap-0.5">
                      {seats.sort((a, b) => a.col - b.col).map((seat) => (
                        <div
                          key={seat.code}
                          className={`h-5 flex-1 rounded-sm ${
                            seat.status === "booked" ? "bg-red-400/80" : "bg-emerald-200/60"
                          }`}
                          title={`${seat.code} — ${seat.status === "booked" ? "Booked" : "Available"}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-emerald-200/60" /> Available
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-sm bg-red-400/80" /> Booked
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Click a showtime on the left to view seat availability</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
