import { type POSProduct } from "@/src/app/(administration)/administration/_shared/staffMockData";

const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";

interface ProductSelectionProps {
  products: POSProduct[];
  combos: POSProduct[];
  productQty: Record<string, number>;
  onUpdateQty: (id: string, delta: number) => void;
}

function QtyCounter({
  id,
  qty,
  onUpdate,
}: {
  id: string;
  qty: number;
  onUpdate: (id: string, delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 mt-3">
      <button
        onClick={() => onUpdate(id, -1)}
        className="h-7 w-7 rounded-md border border-border-shadcn flex items-center justify-center hover:bg-gray-lighter text-gray-600 font-bold text-base leading-none"
      >
        −
      </button>
      <span className="text-sm font-bold w-6 text-center text-gray-900">{qty}</span>
      <button
        onClick={() => onUpdate(id, 1)}
        className="h-7 w-7 rounded-md border border-border-shadcn flex items-center justify-center hover:bg-gray-lighter text-gray-600 font-bold text-base leading-none"
      >
        +
      </button>
    </div>
  );
}

export default function ProductSelection({ products, combos, productQty, onUpdateQty }: ProductSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-3">
          PRODUCTS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-xl border border-border-shadcn bg-white p-4">
              <p className="text-sm font-bold text-gray-900">{p.name}</p>
              <p className="text-xs text-muted-shadcn-foreground mt-0.5">{formatPrice(p.price)}</p>
              <QtyCounter id={p.id} qty={productQty[p.id] || 0} onUpdate={onUpdateQty} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-shadcn-foreground mb-3">
          COMBOS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {combos.map((p) => (
            <div key={p.id} className="rounded-xl border border-border-shadcn bg-white p-4">
              <span className="inline-block text-[9px] font-bold uppercase bg-accent-shadcn text-accent-shadcn-foreground rounded px-2 py-0.5 mb-2">
                combo
              </span>
              <p className="text-sm font-bold text-gray-900">{p.name}</p>
              <p className="text-xs text-muted-shadcn-foreground mt-0.5">
                {formatPrice(p.price)}{" "}
                {p.savings && (
                  <span className="text-success-600 font-semibold">
                    Save {(p.savings / 1000).toFixed(0)}k
                  </span>
                )}
              </p>
              {p.description && (
                <p className="text-[10px] text-muted-shadcn-foreground mt-0.5">{p.description}</p>
              )}
              <QtyCounter id={p.id} qty={productQty[p.id] || 0} onUpdate={onUpdateQty} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
