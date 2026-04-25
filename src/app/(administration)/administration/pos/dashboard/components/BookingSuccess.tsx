import { CheckCircle2, QrCode } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

interface BookingSuccessProps {
  bookingId: string;
  onNewBooking: () => void;
}

export default function BookingSuccess({ bookingId, onNewBooking }: BookingSuccessProps) {
  return (
    <div className="max-w-sm mx-auto text-center space-y-5 py-16 rounded-xl border border-border-shadcn bg-white shadow-sm px-8">
      <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-success-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Booking Created!</h2>
        <p className="text-sm text-muted-shadcn-foreground mt-1.5">
          Booking ID: <strong className="text-gray-900">{bookingId}</strong>
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-shadcn-foreground">
        <QrCode className="h-4 w-4" />
        QR tickets generated per seat
      </div>
      <LTTButton onClick={onNewBooking} className="w-full h-11 rounded-lg">
        New booking
      </LTTButton>
    </div>
  );
}
