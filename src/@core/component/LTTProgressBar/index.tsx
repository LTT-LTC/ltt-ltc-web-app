"use client";
import React from "react";

export interface LTTProgressBarProps {
    value: number;         // 0-100
    label?: string;
    showValue?: boolean;
    color?: "primary" | "success" | "error" | "warning" | "info";
    size?: "sm" | "md" | "lg";
}

const colorMap: Record<string, string> = {
    primary: "bg-primary",
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
};

const trackColorMap: Record<string, string> = {
    primary: "bg-primary/20",
    success: "bg-green-500/20",
    error: "bg-red-500/20",
    warning: "bg-yellow-500/20",
    info: "bg-blue-500/20",
};

const heightMap: Record<string, string> = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
};

const LTTProgressBar: React.FC<LTTProgressBarProps> = ({
    value,
    label,
    showValue = true,
    color = "error",
    size = "md",
}) => {
    const clampedValue = Math.max(0, Math.min(100, value));

    return (
        <div className="w-full">
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1">
                    {label && (
                        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
                    )}
                    {showValue && (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {clampedValue}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full rounded-full overflow-hidden ${heightMap[size]} ${trackColorMap[color]}`}>
                <div
                    className={`${heightMap[size]} rounded-full transition-all duration-500 ease-out ${colorMap[color]}`}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
        </div>
    );
};

export default LTTProgressBar;
