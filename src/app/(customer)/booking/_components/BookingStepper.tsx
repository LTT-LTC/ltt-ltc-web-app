"use client";

import { LTTMultiStepFormProgress } from "@/src/@core/component/LTTShadcnUI/LTTMultiStepFormProgress";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export type BookingStep = "seats" | "confirm-seats" | "extras" | "summary" | "payment" | "processing";

export const STEP_ORDER: BookingStep[] = ["seats", "confirm-seats", "extras", "summary", "payment", "processing"];

const STEP_LABEL_KEYS: Record<BookingStep, string> = {
    seats: "customer.booking.stepper.seats",
    "confirm-seats": "customer.booking.stepper.confirm_seats",
    extras: "customer.booking.stepper.extras",
    summary: "customer.booking.stepper.summary",
    payment: "customer.booking.stepper.payment",
    processing: "customer.booking.stepper.processing",
};

interface BookingStepperProps {
    activeStep: BookingStep;
}

export default function BookingStepper({ activeStep }: BookingStepperProps) {
    const { t } = useLocalization();
    const activeIndex = STEP_ORDER.indexOf(activeStep);
    const currentStep = activeIndex >= 0 ? activeIndex + 1 : 1;
    const totalSteps = STEP_ORDER.length;

    return (
        <div className="mb-6 w-full rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
            <LTTMultiStepFormProgress
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepOfLabel={t("customer.booking.progress.step_of", {
                    current: currentStep,
                    total: totalSteps,
                })}
                stepLabel={t(STEP_LABEL_KEYS[activeStep])}
                showNavigation={false}
            />
        </div>
    );
}
