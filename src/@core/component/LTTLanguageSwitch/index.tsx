"use client";
import React from "react";
import { useLocalization } from "../../hooks/use-localization";

const LTTLanguageSwitch: React.FC = () => {
    const { currentLanguage, changeLanguage } = useLocalization();

    const toggle = () => {
        const next = currentLanguage.toUpperCase() === "VI" ? "en" : "vi";
        changeLanguage(next);
    };

    const isEN = currentLanguage.toUpperCase() === "EN";
    const isVI = currentLanguage.toUpperCase() === "VI";

    return (
        <button
            onClick={toggle}
            className="flex items-center gap-1.5 text-white text-xs font-medium cursor-pointer transition-all"
        >
            <span className="material-symbols-outlined text-[18px]">language</span>
            <div className="relative flex items-center bg-white/20 rounded-full h-6 w-[72px] px-0.5">
                <div
                    className={`absolute h-5 w-[34px] bg-white rounded-full shadow transition-transform duration-300 ${
                        isEN ? "translate-x-[34px]" : "translate-x-0"
                    }`}
                />
                <span
                    className={`relative z-10 flex-1 text-center text-[11px] font-bold transition-colors duration-300 ${
                        isVI ? "text-primary" : "text-white"
                    }`}
                >
                    VI
                </span>
                <span
                    className={`relative z-10 flex-1 text-center text-[11px] font-bold transition-colors duration-300 ${
                        isEN ? "text-primary" : "text-white"
                    }`}
                >
                    EN
                </span>
            </div>
        </button>
    );
};

export default LTTLanguageSwitch;