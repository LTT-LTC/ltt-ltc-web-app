"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/@core/utils/cn";
import { LTTProgress } from "@/src/@core/component/LTTShadcnUI/LTTProgress";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";

export interface LTTMultiStepFormProgressProps {
  /** 1-based index of the current step */
  currentStep: number;
  totalSteps: number;
  /** Localized line, e.g. "Step 1 of 6" */
  stepOfLabel: string;
  /** Title for the current step (localized) */
  stepLabel: React.ReactNode;
  showNavigation?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

export function LTTMultiStepFormProgress({
  currentStep,
  totalSteps,
  stepOfLabel,
  stepLabel,
  showNavigation = false,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: LTTMultiStepFormProgressProps) {
  const safeTotal = Math.max(1, totalSteps);
  const clampedStep = Math.min(Math.max(1, currentStep), safeTotal);
  const progressValue = (clampedStep / safeTotal) * 100;

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{stepOfLabel}</p>
        <p className="text-sm text-muted-foreground-shadcn">{stepLabel}</p>
      </div>

      <LTTProgress value={progressValue} className="h-2" />

      {showNavigation && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <LTTButton
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={onPrevious}
            disabled={previousDisabled || !onPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            {previousLabel}
          </LTTButton>
          <LTTButton
            type="button"
            variant="default"
            size="sm"
            className="gap-1"
            onClick={onNext}
            disabled={nextDisabled || !onNext}
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </LTTButton>
        </div>
      )}
    </div>
  );
}
