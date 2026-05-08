"use client";

import { Check } from "lucide-react";
import { cn } from "@/src/@core/utils/cn";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export type BookingStep = "seats" | "confirm-seats" | "extras" | "summary" | "payment" | "processing";

const STEP_ORDER: BookingStep[] = ["seats", "confirm-seats", "extras", "summary", "payment", "processing"];

const STEP_LABEL_KEYS: Record<BookingStep, string> = {
    "seats": "customer.booking.stepper.seats",
    "confirm-seats": "customer.booking.stepper.confirm_seats",
    "extras": "customer.booking.stepper.extras",
    "summary": "customer.booking.stepper.summary",
    "payment": "customer.booking.stepper.payment",
    "processing": "customer.booking.stepper.processing",
};

interface BookingStepperProps {
    activeStep: BookingStep;
}

export default function BookingStepper({ activeStep }: BookingStepperProps) {
    const { t } = useLocalization();
    const activeIndex = STEP_ORDER.indexOf(activeStep);

    return (
        <div className="w-full bg-white border border-gray-100 rounded-xl shadow-sm px-4 py-4 mb-6">
            <ol className="flex w-full items-center gap-2">
                {STEP_ORDER.map((step, index) => {
                    const isCompleted = index < activeIndex;
                    const isActive = index === activeIndex;
                    const isUpcoming = index > activeIndex;
                    return (
                        <li key={step} className="flex items-center flex-1 min-w-0">
                            <div className="flex flex-col items-center flex-1 min-w-0">
                                <div
                                    className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                                        isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                                        isActive && "bg-[#cd1e25] border-[#cd1e25] text-white shadow-md",
                                        isUpcoming && "bg-white border-gray-300 text-gray-400",
                                    )}
                                >
                                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                                </div>
                                <span
                                    className={cn(
                                        "text-[11px] mt-1.5 text-center px-1 truncate w-full",
                                        isActive ? "text-[#cd1e25] font-semibold" : "text-gray-500",
                                    )}
                                >
                                    {t(STEP_LABEL_KEYS[step])}
                                </span>
                            </div>
                            {index < STEP_ORDER.length - 1 && (
                                <div
                                    className={cn(
                                        "h-0.5 flex-1 -mt-5 mx-1 rounded-full",
                                        isCompleted ? "bg-emerald-500" : "bg-gray-200",
                                    )}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
