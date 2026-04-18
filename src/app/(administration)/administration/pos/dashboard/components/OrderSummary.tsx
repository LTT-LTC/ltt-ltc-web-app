import { ArrowLeft, ArrowRight } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";

interface OrderSummaryProps {
  step: number;
  orderItems: { label: string; price: number }[];
  grandTotal: number;
  canAdvanceStep1: boolean;
  onStep: (step: number) => void;
  onConfirm: () => void;
}

export default function OrderSummary({
  step,
  orderItems,
  grandTotal,
  canAdvanceStep1,
  onStep,
  onConfirm,
}: OrderSummaryProps) {
  if (step < 3) {
    return (
      <div className="rounded-xl border border-border-shadcn bg-white p-5 shadow-sm h-fit lg:sticky lg:top-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-4">
          ORDER SUMMARY
        </h3>
        <div className="space-y-2.5 mb-5 min-h-[60px]">
          {orderItems.length === 0 ? (
            <p className="text-xs text-muted-shadcn-foreground">No items yet</p>
          ) : (
            orderItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border-shadcn pt-3 mb-4 flex justify-between font-bold text-gray-900">
          <span>{step === 1 ? "Subtotal" : "Total"}</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
        {step === 1 && (
          <LTTButton
            className="w-full h-11 rounded-xl gap-1.5 font-semibold"
            disabled={!canAdvanceStep1}
            onClick={() => onStep(2)}
          >
            Add products <ArrowRight className="h-4 w-4" />
          </LTTButton>
        )}
        {step === 2 && (
          <div className="flex gap-2">
            <LTTButton
              variant="outline"
              className="flex-1 h-11 rounded-xl border-border-shadcn font-semibold gap-1"
              onClick={() => onStep(1)}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </LTTButton>
            <LTTButton
              className="flex-[2] h-11 rounded-xl gap-1.5 font-semibold"
              onClick={() => onStep(3)}
            >
              Review order <ArrowRight className="h-4 w-4" />
            </LTTButton>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-shadcn bg-white p-5 shadow-sm h-fit lg:sticky lg:top-4">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-4">
        BOOKING TOTAL
      </h3>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-base font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-gray-900">{formatPrice(grandTotal)}</span>
      </div>
      <p className="text-xs text-muted-shadcn-foreground mb-5 leading-relaxed">
        Booking will be created with{" "}
        <strong className="text-gray-800">soldByEmployeeId</strong> set to this staff account.
        A ticket with QR code is generated per seat.
      </p>
      <LTTButton className="w-full h-11 rounded-xl font-bold mb-2" onClick={onConfirm}>
        Confirm & create booking
      </LTTButton>
      <LTTButton
        variant="outline"
        className="w-full h-10 rounded-xl border-border-shadcn font-semibold text-sm gap-1"
        onClick={() => onStep(2)}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </LTTButton>
    </div>
  );
}
