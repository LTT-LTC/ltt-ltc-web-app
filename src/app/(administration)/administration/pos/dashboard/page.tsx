"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, QrCode } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { toast } from "sonner";
import {
  currentStaff,
  mockStaffShowtimes,
  posProducts,
  generateSeatAvailability,
  type StaffShowtime,
  type SeatAvailability,
  type POSProduct,
} from "@/src/app/(administration)/administration/_shared/staffMockData";

const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";

const POS = () => {
  const navigate = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [selectedShowtime, setSelectedShowtime] = useState<StaffShowtime | null>(null);
  const [seatData, setSeatData] = useState<SeatAvailability[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  // Step 2 state
  const [productQty, setProductQty] = useState<Record<string, number>>({});

  // Step 3 state
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "vnpay">("cash");
  const [confirmed, setConfirmed] = useState(false);

  const availableShowtimes = mockStaffShowtimes.filter((s) => s.status !== "ended" && s.status !== "full");

  const handleSelectShowtime = (st: StaffShowtime) => {
    setSelectedShowtime(st);
    setSelectedSeats(new Set());
    setSeatData(generateSeatAvailability(st.id));
  };

  const toggleSeat = (code: string) => {
    const seat = seatData.find((s) => s.code === code);
    if (!seat || seat.status === "booked") return;
    const next = new Set(selectedSeats);
    next.has(code) ? next.delete(code) : next.add(code);
    setSelectedSeats(next);
  };

  // Group seats by row
  const seatRows = useMemo(() => {
    const map: Record<string, SeatAvailability[]> = {};
    seatData.forEach((s) => {
      if (!map[s.row]) map[s.row] = [];
      map[s.row].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [seatData]);

  const seatPrice = useMemo(() => {
    return seatData.filter((s) => selectedSeats.has(s.code)).reduce((sum, s) => sum + s.price, 0);
  }, [seatData, selectedSeats]);

  const products = posProducts.filter((p) => p.category === "product");
  const combos = posProducts.filter((p) => p.category === "combo");

  const updateQty = (id: string, delta: number) => {
    setProductQty((prev) => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [id]: next };
    });
  };

  const productTotal = useMemo(() => {
    return Object.entries(productQty).reduce((sum, [id, qty]) => {
      const p = posProducts.find((x) => x.id === id);
      return sum + (p ? p.price * qty : 0);
    }, 0);
  }, [productQty]);

  const grandTotal = seatPrice + productTotal;

  const selectedSeatsList = [...selectedSeats].sort();

  const orderItems = useMemo(() => {
    const items: { label: string; price: number }[] = [];
    selectedSeatsList.forEach((code) => {
      const seat = seatData.find((s) => s.code === code);
      items.push({ label: `Ticket · ${code}`, price: seat?.price || 95000 });
    });
    Object.entries(productQty).forEach(([id, qty]) => {
      if (qty <= 0) return;
      const p = posProducts.find((x) => x.id === id);
      if (p) items.push({ label: `${p.name} ×${qty}`, price: p.price * qty });
    });
    return items;
  }, [selectedSeatsList, seatData, productQty]);

  const handleConfirm = () => {
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
  };

  // Step indicator
  const steps = [
    { num: 1, label: "Select showtime & seats" },
    { num: 2, label: "Add products" },
    { num: 3, label: "Confirm & pay" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3 mb-4">
        <div>
          <h1 className="text-lg font-bold">Point of sale — walk-in booking</h1>
          <p className="text-xs text-muted-foreground">Staff: {currentStaff.name} · {currentStaff.cinemaName}</p>
        </div>
        <LTTButton variant="outline" size="sm" className="gap-1.5" onClick={() => navigate.push("/staff")}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </LTTButton>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-0 mb-6">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-xs font-medium ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`mx-3 h-px w-16 md:w-24 ${step > s.num ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {confirmed ? (
        /* ── Success screen ── */
        <div className="max-w-md mx-auto text-center space-y-4 py-12">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">Booking Created!</h2>
          <p className="text-sm text-muted-foreground">Booking ID: <strong>BK-{Date.now()}</strong></p>
          <div className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">QR tickets sent to POS printer</span>
          </div>
          <LTTButton onClick={handleNewBooking} className="mt-4">New booking</LTTButton>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          {/* ── Main panel ── */}
          <div className="rounded-xl border border-border bg-card p-5">
            {step === 1 && (
              <div className="space-y-5">
                {/* Choose showtime */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Choose Showtime</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {availableShowtimes.map((st) => (
                      <LTTButton
                        key={st.id}
                        onClick={() => handleSelectShowtime(st)}
                        className={`rounded-lg border-2 p-3 text-left transition-colors ${
                          selectedShowtime?.id === st.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <p className="text-sm font-bold">{st.startTime} today</p>
                        <p className="text-xs text-muted-foreground">{st.movieTitle} · Screen {st.screenNumber} · {st.screenType}</p>
                      </LTTButton>
                    ))}
                  </div>
                </div>

                {/* Seat picker */}
                {selectedShowtime && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pick Seats</h3>
                    <div className="text-center text-[10px] text-muted-foreground mb-3 tracking-widest">— Screen —</div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      {seatRows.map(([row, seats]) => (
                        <div key={row} className="flex items-center gap-1">
                          <span className="w-5 text-xs font-medium text-muted-foreground text-right">{row}</span>
                          <div className="flex gap-1 flex-1">
                            {seats.sort((a, b) => a.col - b.col).map((seat) => {
                              const isSelected = selectedSeats.has(seat.code);
                              const isBooked = seat.status === "booked";
                              return (
                                <LTTButton
                                  key={seat.code}
                                  onClick={() => toggleSeat(seat.code)}
                                  disabled={isBooked}
                                  className={`h-7 w-7 rounded text-[9px] font-medium border transition-colors ${
                                    isBooked
                                      ? "bg-muted text-muted-foreground/40 border-border cursor-not-allowed"
                                      : isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                  }`}
                                  title={seat.code}
                                >
                                  {seat.code.slice(1)}
                                </LTTButton>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-emerald-50 border border-emerald-300" /> Free</div>
                      <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-primary" /> Selected</div>
                      <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-muted border border-border" /> Taken</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Products</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {products.map((p) => (
                      <div key={p.id} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-primary font-medium">{formatPrice(p.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <LTTButton variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(p.id, -1)}>−</LTTButton>
                          <span className="text-sm font-medium w-6 text-center">{productQty[p.id] || 0}</span>
                          <LTTButton variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(p.id, 1)}>+</LTTButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Combos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {combos.map((p) => (
                      <div key={p.id} className="rounded-lg border border-primary/30 p-3">
                        <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary rounded px-1.5 py-0.5">combo</span>
                        <p className="text-sm font-semibold mt-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(p.price)} {p.savings && <span className="text-emerald-600">Save {(p.savings / 1000).toFixed(0)}k</span>}</p>
                        {p.description && <p className="text-[10px] text-muted-foreground">{p.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <LTTButton variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(p.id, -1)}>−</LTTButton>
                          <span className="text-sm font-medium w-6 text-center">{productQty[p.id] || 0}</span>
                          <LTTButton variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(p.id, 1)}>+</LTTButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Order Details</h3>
                  <div className="space-y-2">
                    {orderItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="font-medium">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Method</h3>
                  <div className="flex gap-2">
                    {(["cash", "card", "vnpay"] as const).map((m) => (
                      <LTTButton
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`rounded-lg border-2 px-5 py-2 text-sm font-medium transition-colors ${
                          paymentMethod === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                      >
                        {m === "cash" ? "Cash" : m === "card" ? "Card" : "VNPay QR"}
                      </LTTButton>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {paymentMethod === "cash" && "Staff collects cash and marks booking as paid."}
                    {paymentMethod === "card" && "Staff processes card payment at terminal."}
                    {paymentMethod === "vnpay" && "Generate VNPay QR for customer to scan."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="rounded-xl border border-border bg-card p-5 h-fit lg:sticky lg:top-4">
            {step < 3 ? (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Order Summary</h3>
                <div className="space-y-1.5 mb-4">
                  {orderItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No items yet</p>
                  ) : (
                    orderItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-foreground/80">{item.label}</span>
                        <span className="font-medium">{formatPrice(item.price)}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
                  <span>{step === 1 ? "Subtotal" : "Total"}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {step === 1 && (
                    <>
                      <LTTButton
                        className="w-full gap-1.5"
                        disabled={selectedSeats.size === 0}
                        onClick={() => setStep(2)}
                      >
                        Add products <ArrowRight className="h-3.5 w-3.5" />
                      </LTTButton>
                    </>
                  )}
                  {step === 2 && (
                    <div className="flex gap-2">
                      <LTTButton variant="outline" className="flex-1 gap-1" onClick={() => setStep(1)}>
                        <ArrowLeft className="h-3.5 w-3.5" /> Back
                      </LTTButton>
                      <LTTButton className="flex-1 gap-1" onClick={() => setStep(3)}>
                        Review order <ArrowRight className="h-3.5 w-3.5" />
                      </LTTButton>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Booking Total</h3>
                <p className="text-2xl font-bold text-primary mb-2">Total <span className="float-right">{formatPrice(grandTotal)}</span></p>
                <p className="text-xs text-muted-foreground mb-4">
                  Booking will be created with <strong className="text-foreground">soldByEmployeeId</strong> set to this staff account.
                  A ticket with QR code is generated per seat.
                </p>
                <LTTButton className="w-full" onClick={handleConfirm}>Confirm & create booking</LTTButton>
                <div className="flex gap-2 mt-2">
                  <LTTButton variant="outline" className="flex-1 gap-1" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </LTTButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
