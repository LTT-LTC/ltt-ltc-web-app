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
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-x-1 sm:gap-x-2">
                {STEP_ORDER.map((step, index) => {
                    const isCompleted = index < activeIndex;
                    const isActive = index === activeIndex;
                    const isUpcoming = index > activeIndex;
                    const connectorDone = index < activeIndex;

                    return (
                        <div key={step} className="contents">
                            <div className="flex min-w-0 flex-col items-center">
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
                                        "text-[11px] mt-1.5 text-center leading-4 w-full max-w-[110px] sm:max-w-[130px]",
                                        isActive ? "text-[#cd1e25] font-semibold" : "text-gray-500",
                                    )}
                                >
                                    {t(STEP_LABEL_KEYS[step])}
                                </span>
                            </div>
                            {index < STEP_ORDER.length - 1 && (
                                <div className="flex items-center pt-4">
                                    <div
                                        className={cn(
                                            "h-0.5 w-full rounded-full transition-colors",
                                            connectorDone ? "bg-emerald-500" : "bg-gray-200",
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
