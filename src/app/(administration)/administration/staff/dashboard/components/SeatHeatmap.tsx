import { useMemo } from "react";
import LTTSeatMapViewer from "@/src/@core/component/LTTManager/LTTSeatMapViewer";
import { type SeatAvailability, generateSeatLayout } from "@/src/app/(administration)/administration/_shared/staffMockData";

interface SeatHeatmapProps {
  selectedShowtimeTitle: string | null;
  seatData: SeatAvailability[];
  bookedCount: number;
  totalSeats: number;
  occupancy: number;
}

export default function SeatHeatmap({
  selectedShowtimeTitle,
  seatData,
  bookedCount,
  totalSeats,
  occupancy,
}: SeatHeatmapProps) {
  const seatLayout = useMemo(() => generateSeatLayout(seatData), [seatData]);

  const bookedSeats = useMemo(
    () => new Set(seatData.filter((s) => s.status === "booked").map((s) => s.code)),
    [seatData]
  );

  return (
    <div className="rounded-xl border border-border-shadcn bg-white p-5 shadow-sm">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-4">
        SEAT AVAILABILITY — {selectedShowtimeTitle ? "SELECTED SHOWTIME" : "SELECT A SHOWTIME"}
      </h2>

      {selectedShowtimeTitle ? (
        <div className="space-y-3">
          {/* Stats row */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-shadcn-foreground text-xs font-medium uppercase tracking-wider">Booked</span>
              <span className="ml-2 font-bold text-gray-900">{bookedCount} / {totalSeats}</span>
            </div>
            <div>
              <span className="text-muted-shadcn-foreground text-xs font-medium uppercase tracking-wider">Occupancy</span>
              <span className="ml-2 font-bold text-gray-900">{occupancy}%</span>
            </div>
          </div>

          {/* Seat map */}
          <div className="overflow-x-auto py-1">
            <LTTSeatMapViewer
              seatLayout={seatLayout}
              bookedSeats={bookedSeats}
              readOnly
              showScreen={false}
              compact
              showLegend={false}
            />
          </div>

          {/* Compact legend */}
          <div className="flex items-center gap-5 text-xs text-muted-shadcn-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-blue-500/70 border border-blue-600/50" />
              Available
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-red-400 border border-red-500" />
              Booked
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-shadcn-foreground text-center py-8">
          Click a showtime on the left to view seat availability
        </p>
      )}
    </div>
  );
}
