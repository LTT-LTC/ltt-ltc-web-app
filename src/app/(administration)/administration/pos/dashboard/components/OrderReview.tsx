const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";

type PaymentMethod = "cash" | "card" | "vnpay";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash:  "Cash",
  card:  "Card",
  vnpay: "VNPay QR",
};

const PAYMENT_HINTS: Record<PaymentMethod, string> = {
  cash:  "Staff collects cash and marks booking as paid.",
  card:  "Staff processes card payment at terminal.",
  vnpay: "Generate VNPay QR for customer to scan.",
};

interface OrderReviewProps {
  orderItems: { label: string; price: number }[];
  paymentMethod: PaymentMethod;
  onSelectPayment: (method: PaymentMethod) => void;
}

export default function OrderReview({ orderItems, paymentMethod, onSelectPayment }: OrderReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-4">
          ORDER DETAILS
        </h3>
        <div className="space-y-3">
          {orderItems.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center text-sm border-b border-border-shadcn pb-3 last:border-0 last:pb-0"
            >
              <span className="text-gray-700">{item.label}</span>
              <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-4">
          PAYMENT METHOD
        </h3>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => onSelectPayment(m)}
              className={`flex-1 min-w-[80px] rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                paymentMethod === m
                  ? "border-primary-shadcn bg-accent-shadcn text-primary-shadcn"
                  : "border-border-shadcn bg-white text-gray-700 hover:border-primary-shadcn/40"
              }`}
            >
              {PAYMENT_LABELS[m]}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-shadcn-foreground mt-2.5">{PAYMENT_HINTS[paymentMethod]}</p>
      </div>
    </div>
  );
}
