"use client";
import React from "react";

export interface LTTRatingProps {
    value: number;        // e.g. 8.8
    max?: number;         // e.g. 10
    totalVotes?: string;  // e.g. "1.2k votes"
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

const LTTRating: React.FC<LTTRatingProps> = ({
    value,
    max = 10,
    totalVotes,
    size = "md",
    showLabel = true,
}) => {
    const filledStars = Math.round((value / max) * 5);
    const sizeMap = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };
    const starSizeMap = {
        sm: "text-[14px]",
        md: "text-[18px]",
        lg: "text-[22px]",
    };

    return (
        <div className="inline-flex items-center gap-1.5">
            {/* Stars */}
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span
                        key={i}
                        className={`material-symbols-outlined ${starSizeMap[size]} ${i < filledStars ? "text-yellow-400" : "text-slate-300 dark:text-slate-600"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        star
                    </span>
                ))}
            </div>
            {/* Score */}
            {showLabel && (
                <span className={`font-bold ${sizeMap[size]} text-slate-900 dark:text-white`}>
                    {value}
                </span>
            )}
            {showLabel && (
                <span className={`text-slate-400 ${sizeMap[size]}`}>
                    /{max}
                </span>
            )}
            {totalVotes && (
                <span className="text-slate-400 text-xs ml-1">({totalVotes})</span>
            )}
        </div>
    );
};

export default LTTRating;
