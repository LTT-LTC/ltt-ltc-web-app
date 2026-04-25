import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { type StaffBooking } from "@/src/app/(administration)/administration/_shared/staffMockData";

export type CheckInState = "idle" | "not_found" | "checked_in" | "ready";

interface CheckInStationProps {
  bookingIdInput: string;
  lookupState: CheckInState;
  foundBooking: StaffBooking | null;
  onInputChange: (value: string) => void;
  onLookup: () => void;
  onCheckIn: () => void;
}

export default function CheckInStation({
  bookingIdInput,
  lookupState,
  foundBooking,
  onInputChange,
  onLookup,
  onCheckIn,
}: CheckInStationProps) {
  return (
    <div className="rounded-xl border border-border-shadcn bg-white p-5 shadow-sm">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-4">
        CHECK-IN STATION
      </h2>

      <div className="flex gap-2 mb-4">
        <LTTInput
          placeholder="Booking ID or scan QR..."
          value={bookingIdInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLookup()}
          className="rounded-lg border-border-shadcn bg-white h-10 text-sm"
        />
        <LTTButton
          variant="outline"
          className="rounded-lg h-10 px-4 text-sm font-semibold border-border-shadcn shrink-0"
          onClick={onLookup}
        >
          Look up
        </LTTButton>
      </div>

      <div className="mb-4">
        {lookupState === "idle" && (
          <div className="rounded-lg bg-gray-lighter border border-border-shadcn p-4">
            <p className="text-sm text-muted-shadcn-foreground">
              Enter a booking ID or scan a QR code to begin
            </p>
          </div>
        )}
        {lookupState === "not_found" && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">Booking not found</p>
              <p className="text-xs text-red-500 mt-0.5">Check the booking ID and try again.</p>
            </div>
          </div>
        )}
        {lookupState === "checked_in" && foundBooking && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider mb-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Already checked in
            </div>
            <p className="text-sm text-gray-700">{foundBooking.customerName} — {foundBooking.movieTitle}</p>
            <p className="text-xs text-muted-shadcn-foreground mt-0.5">Seats: {foundBooking.seats.join(", ")}</p>
          </div>
        )}
        {lookupState === "ready" && foundBooking && (
          <div className="rounded-lg border border-success-200 bg-success-50 p-4">
            <div className="flex items-center gap-2 text-success-700 font-bold text-xs uppercase tracking-wider mb-1.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Ready to check in
            </div>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p><span className="text-muted-shadcn-foreground">Customer:</span> {foundBooking.customerName}</p>
              <p><span className="text-muted-shadcn-foreground">Movie:</span> {foundBooking.movieTitle}</p>
              <p><span className="text-muted-shadcn-foreground">Seats:</span> {foundBooking.seats.join(", ")}</p>
            </div>
          </div>
        )}
      </div>

      <button
        disabled={lookupState !== "ready"}
        onClick={onCheckIn}
        className="w-full h-11 rounded-xl border border-border-shadcn bg-white text-sm font-semibold text-gray-700 hover:bg-gray-lighter transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Mark as checked in
      </button>
    </div>
  );
}
