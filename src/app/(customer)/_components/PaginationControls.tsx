"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
    className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
    className,
}) => {
    return (
        <div className={className || "flex items-center gap-2 shrink-0 self-end sm:self-auto"}>
            <button
                type="button"
                onClick={onPrevious}
                disabled={currentPage <= 1}
                className="size-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-slate-200"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-500 min-w-16 text-center">
                {currentPage} / {totalPages}
            </span>
            <button
                type="button"
                onClick={onNext}
                disabled={currentPage >= totalPages}
                className="size-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-slate-200"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

export default PaginationControls;
