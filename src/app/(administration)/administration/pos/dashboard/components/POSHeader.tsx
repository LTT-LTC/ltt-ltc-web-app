import { ArrowLeft } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

const POS_STEPS = [
  { num: 1, label: "Select showtime & seats" },
  { num: 2, label: "Add products" },
  { num: 3, label: "Confirm & pay" },
] as const;

interface POSHeaderProps {
  staffName: string;
  cinemaName: string;
  onBack: () => void;
}

export function POSHeader({ staffName, cinemaName, onBack }: POSHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border-shadcn bg-white px-5 py-3 shadow-sm">
      <div>
        <h1 className="text-base font-bold text-gray-900">Point of sale — walk-in booking</h1>
        <p className="text-xs text-muted-shadcn-foreground mt-0.5">
          Staff: {staffName} · {cinemaName}
        </p>
      </div>
      <LTTButton
        variant="outline"
        className="h-9 rounded-lg border-border-shadcn text-sm font-semibold gap-1.5 hover:bg-muted-shadcn shrink-0"
        onClick={onBack}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </LTTButton>
    </div>
  );
}

interface POSStepIndicatorProps {
  currentStep: number;
}

export function POSStepIndicator({ currentStep }: POSStepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {POS_STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2 transition-all ${
                currentStep === s.num
                  ? "bg-primary-shadcn border-primary-shadcn text-white shadow-sm"
                  : currentStep > s.num
                  ? "bg-primary-shadcn border-primary-shadcn text-white"
                  : "bg-white border-border-shadcn text-muted-shadcn-foreground"
              }`}
            >
              {currentStep > s.num ? "✓" : s.num}
            </div>
            <span
              className={`text-xs font-semibold ${
                currentStep >= s.num ? "text-gray-900" : "text-muted-shadcn-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < POS_STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-4 ${currentStep > s.num ? "bg-primary-shadcn" : "bg-border-shadcn"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
