"use client";
import React from "react";
import { useLocalization } from "../../hooks/use-localization";
import { cn } from "../../utils/cn";

type LTTLanguageSwitchProps = {
    className?: string;
    variant?: "primary" | "neutral";
};

const LTTLanguageSwitch: React.FC<LTTLanguageSwitchProps> = ({ className, variant = "primary" }) => {
    const { currentLanguage, changeLanguage } = useLocalization();

    const toggle = () => {
        const next = currentLanguage.toUpperCase() === "VI" ? "en" : "vi";
        changeLanguage(next);
    };

    const isEN = currentLanguage.toUpperCase() === "EN";
    const isVI = currentLanguage.toUpperCase() === "VI";
    const isNeutral = variant === "neutral";

    return (
        <button
            type="button"
            onClick={toggle}
            className={cn(
                "flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all",
                isNeutral ? "text-gray-700 bg-white rounded-md px-2 py-1.5" : "text-white",
                className
            )}
        >
            <span className="material-symbols-outlined text-[18px] pointer-events-none">language</span>
            <div className={cn(
                "relative flex items-center rounded-full h-6 w-[72px] px-0.5 pointer-events-none",
                isNeutral ? "bg-gray-100" : "bg-white/20"
            )}>
                <div
                    className={`absolute h-5 w-[34px] rounded-full shadow transition-transform duration-300 pointer-events-none ${isNeutral ? "bg-primary" : "bg-white"} ${isEN ? "translate-x-[34px]" : "translate-x-0"
                        }`}
                />
                <span
                    className={`relative z-10 flex-1 text-center text-[11px] font-bold transition-colors duration-300 pointer-events-none ${isVI ? (isNeutral ? "text-white" : "text-primary") : (isNeutral ? "text-gray-600" : "text-white")
                        }`}
                >
                    VI
                </span>
                <span
                    className={`relative z-10 flex-1 text-center text-[11px] font-bold transition-colors duration-300 pointer-events-none ${isEN ? (isNeutral ? "text-white" : "text-primary") : (isNeutral ? "text-gray-600" : "text-white")
                        }`}
                >
                    EN
                </span>
            </div>
        </button>
    );
};

export default LTTLanguageSwitch;