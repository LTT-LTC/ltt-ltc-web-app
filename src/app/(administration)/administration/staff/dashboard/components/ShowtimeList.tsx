import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type StaffShowtime } from "@/src/app/(administration)/administration/_shared/staffMockData";

const STATUS_CONFIG: Record<StaffShowtime["status"], { label: string; cls: string }> = {
  ended:         { label: "Ended",      cls: "bg-muted-shadcn text-muted-shadcn-foreground uppercase tracking-wide" },
  live:          { label: "Live",       cls: "bg-red-50 text-red-600 uppercase tracking-wide" },
  starting_soon: { label: "Starts 18m", cls: "bg-orange-50 text-orange-600 uppercase tracking-wide" },
  open:          { label: "Open",       cls: "bg-success-50 text-success-600 uppercase tracking-wide" },
  full:          { label: "Full",       cls: "bg-gray-100 text-gray-500 uppercase tracking-wide" },
};

const PAGE_SIZE = 5;

interface ShowtimeListProps {
  showtimes: StaffShowtime[];
  selectedId: string | null;
  totalToday: number;
  nowShowing: number;
  onSelect: (showtime: StaffShowtime) => void;
}

export default function ShowtimeList({ showtimes, selectedId, totalToday, nowShowing, onSelect }: ShowtimeListProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(showtimes.length / PAGE_SIZE));
  const paginated  = showtimes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-xl border border-border-shadcn bg-white shadow-sm overflow-hidden">
      {/* Summary stats */}
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-4">
          TODAY'S SCHEDULE
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-gray-lighter border border-border-shadcn p-3 text-center">
            <p className="text-3xl font-bold text-gray-900">{totalToday}</p>
            <p className="text-[11px] text-muted-shadcn-foreground mt-1 font-medium">total today</p>
          </div>
          <div className="rounded-xl bg-accent-shadcn border border-primary-shadcn/10 p-3 text-center">
            <p className="text-3xl font-bold text-gray-900">{nowShowing}</p>
            <p className="text-[11px] text-muted-shadcn-foreground mt-1 font-medium">now showing</p>
          </div>
        </div>
      </div>

      {/* Showtime rows */}
      <div className="divide-y divide-border-shadcn">
        {paginated.map((st) => (
          <button
            key={st.id}
            onClick={() => onSelect(st)}
            className={`group w-full flex items-center justify-between px-5 py-3.5 text-left transition-all duration-150 ${
              selectedId === st.id ? "bg-accent-shadcn" : "bg-white hover:bg-gray-lighter"
            } ${st.status === "ended" ? "opacity-55" : ""}`}
          >
            <div className="flex items-center gap-5">
              <span className="text-sm font-bold text-gray-700 w-11 shrink-0">{st.startTime}</span>
              <div className={`border-l-2 pl-4 py-0.5 ${selectedId === st.id ? "border-primary-shadcn" : "border-transparent"}`}>
                <p className="text-sm font-bold text-gray-900 leading-snug">{st.movieTitle}</p>
                <p className="text-[11px] text-muted-shadcn-foreground font-medium mt-0.5">
                  Screen {st.screenNumber} · {st.format} · {st.seatCount} seats
                </p>
              </div>
            </div>
            <span className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold ${STATUS_CONFIG[st.status].cls}`}>
              {STATUS_CONFIG[st.status].label}
            </span>
          </button>
        ))}
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border-shadcn bg-gray-lighter/50">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-shadcn-foreground hover:bg-white border border-border-shadcn disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>

          <span className="text-xs text-muted-shadcn-foreground font-medium">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-shadcn-foreground hover:bg-white border border-border-shadcn disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
