import { useMemo } from "react";
import LTTSeatMapViewer from "@/src/@core/component/LTTManager/LTTSeatMapViewer";
import { type StaffShowtime, type SeatAvailability, generateSeatLayout } from "@/src/app/(administration)/administration/_shared/staffMockData";

interface ShowtimeSelectionProps {
  showtimes: StaffShowtime[];
  selectedShowtime: StaffShowtime | null;
  seatData: SeatAvailability[];
  selectedSeats: Set<string>;
  onSelectShowtime: (showtime: StaffShowtime) => void;
  onToggleSeat: (code: string) => void;
}

export default function ShowtimeSelection({
  showtimes,
  selectedShowtime,
  seatData,
  selectedSeats,
  onSelectShowtime,
  onToggleSeat,
}: ShowtimeSelectionProps) {
  const seatLayout = useMemo(() => generateSeatLayout(seatData), [seatData]);

  const bookedSeats = useMemo(
    () => new Set(seatData.filter((s) => s.status === "booked").map((s) => s.code)),
    [seatData]
  );

  return (
    <div className="space-y-6">
      {/* Showtime cards */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-3">
          CHOOSE SHOWTIME
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {showtimes.map((st) => (
            <button
              key={st.id}
              onClick={() => onSelectShowtime(st)}
              className={`w-full rounded-xl border-2 p-3.5 text-left transition-all duration-150 ${
                selectedShowtime?.id === st.id
                  ? "border-primary-shadcn bg-accent-shadcn"
                  : "border-border-shadcn bg-white hover:border-primary-shadcn/40"
              }`}
            >
              <p className="text-sm font-bold text-gray-900">{st.startTime} today</p>
              <p className="text-xs text-muted-shadcn-foreground mt-1 leading-relaxed">
                {st.movieTitle} ·<br />Screen {st.screenNumber} · {st.format}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Seat picker */}
      {selectedShowtime && (
        <div className="border-t border-border-shadcn pt-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-4">
            PICK SEATS
          </h3>
          <div className="overflow-x-auto">
            <LTTSeatMapViewer
              seatLayout={seatLayout}
              selectedSeats={selectedSeats}
              bookedSeats={bookedSeats}
              onSeatClick={onToggleSeat}
              readOnly={false}
              showScreen={true}
              showLegend={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
