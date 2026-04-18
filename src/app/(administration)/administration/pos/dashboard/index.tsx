"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  currentStaff,
  mockStaffShowtimes,
  posProducts,
  generateSeatAvailability,
  type StaffShowtime,
  type SeatAvailability,
} from "@/src/app/(administration)/administration/_shared/staffMockData";

import { POSHeader, POSStepIndicator } from "./components/POSHeader";
import ShowtimeSelection from "./components/ShowtimeSelection";
import ProductSelection from "./components/ProductSelection";
import OrderReview from "./components/OrderReview";
import OrderSummary from "./components/OrderSummary";
import BookingSuccess from "./components/BookingSuccess";

type PaymentMethod = "cash" | "card" | "vnpay";

export default function POSDashboard() {
  const navigate = useRouter();
  const [step, setStep] = useState(1);
  const [selectedShowtime, setSelectedShowtime] = useState<StaffShowtime | null>(null);
  const [seatData, setSeatData] = useState<SeatAvailability[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [productQty, setProductQty] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const availableShowtimes = mockStaffShowtimes.filter(
    (s) => s.status !== "ended" && s.status !== "full"
  );

  const handleSelectShowtime = (st: StaffShowtime) => {
    setSelectedShowtime(st);
    setSelectedSeats(new Set());
    setSeatData(generateSeatAvailability(st.id));
  };

  const handleToggleSeat = (code: string) => {
    const seat = seatData.find((s) => s.code === code);
    if (!seat || seat.status === "booked") return;
    const next = new Set(selectedSeats);
    next.has(code) ? next.delete(code) : next.add(code);
    setSelectedSeats(next);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setProductQty((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleConfirm = () => {
    const id = `BK-${Date.now()}`;
    setBookingId(id);
    setConfirmed(true);
    toast.success("Booking created successfully!");
  };

  const handleNewBooking = () => {
    setStep(1);
    setSelectedShowtime(null);
    setSeatData([]);
    setSelectedSeats(new Set());
    setProductQty({});
    setPaymentMethod("cash");
    setConfirmed(false);
    setBookingId("");
  };


  const seatPrice = useMemo(
    () => seatData.filter((s) => selectedSeats.has(s.code)).reduce((sum, s) => sum + s.price, 0),
    [seatData, selectedSeats]
  );

  const productTotal = useMemo(
    () =>
      Object.entries(productQty).reduce((sum, [id, qty]) => {
        const p = posProducts.find((x) => x.id === id);
        return sum + (p ? p.price * qty : 0);
      }, 0),
    [productQty]
  );

  const grandTotal = seatPrice + productTotal;

  const orderItems = useMemo(() => {
    const items: { label: string; price: number }[] = [];
    [...selectedSeats].sort().forEach((code) => {
      const seat = seatData.find((s) => s.code === code);
      items.push({ label: `Ticket · ${code}`, price: seat?.price || 95000 });
    });
    Object.entries(productQty).forEach(([id, qty]) => {
      if (qty <= 0) return;
      const p = posProducts.find((x) => x.id === id);
      if (p) items.push({ label: `${p.name} ×${qty}`, price: p.price * qty });
    });
    return items;
  }, [selectedSeats, seatData, productQty]);

  const products = posProducts.filter((p) => p.category === "product");
  const combos = posProducts.filter((p) => p.category === "combo");

  return (
    <div className="space-y-5">
      <POSHeader
        staffName={currentStaff.name}
        cinemaName={currentStaff.cinemaName}
        onBack={() => navigate.push("/administration/staff/dashboard")}
      />
      <POSStepIndicator currentStep={step} />

      {confirmed ? (
        <BookingSuccess bookingId={bookingId} onNewBooking={handleNewBooking} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-border-shadcn bg-white p-5 shadow-sm">
            {step === 1 && (
              <ShowtimeSelection
                showtimes={availableShowtimes}
                selectedShowtime={selectedShowtime}
                seatData={seatData}
                selectedSeats={selectedSeats}
                onSelectShowtime={handleSelectShowtime}
                onToggleSeat={handleToggleSeat}
              />
            )}
            {step === 2 && (
              <ProductSelection
                products={products}
                combos={combos}
                productQty={productQty}
                onUpdateQty={handleUpdateQty}
              />
            )}
            {step === 3 && (
              <OrderReview
                orderItems={orderItems}
                paymentMethod={paymentMethod}
                onSelectPayment={setPaymentMethod}
              />
            )}
          </div>

          <OrderSummary
            step={step}
            orderItems={orderItems}
            grandTotal={grandTotal}
            canAdvanceStep1={selectedSeats.size > 0}
            onStep={setStep}
            onConfirm={handleConfirm}
          />
        </div>
      )}
    </div>
  );
}
