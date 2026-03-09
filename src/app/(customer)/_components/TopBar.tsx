"use client";
import React, { useState } from "react";
import Link from "next/link";
// import LTTSwitch from "@/src/@core/component/AntD/LTTSwitch";
import LTTLanguageSwitch from "@/src/@core/component/LTTLanguageSwitch";

const TopBar: React.FC = () => {
    // const [isVi, setIsVi] = useState(true);

    return (
        <div className="bg-primary text-white py-2 border-b border-white/10">
            <div className="w-[70%] mx-auto flex justify-end items-center gap-6 text-xs font-medium">
                <Link href="#" className="hover:text-white/60 transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">campaign</span> News and Offers
                </Link>
                <Link href="#" className="hover:text-white/60 transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">confirmation_number</span> My Ticket
                </Link>
                <Link href="#" className="hover:text-white/60 transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">account_circle</span> Account
                </Link>
                <LTTLanguageSwitch />
                {/*<div className="flex items-center gap-2">*/}
                {/*    <span className={`text-xs font-bold ${isVi ? "text-white" : "text-white/50"}`}>VI</span>*/}
                {/*    <LTTSwitch*/}
                {/*        checked={!isVi}*/}
                {/*        onChange={(checked: boolean) => setIsVi(!checked)}*/}
                {/*        size="small"*/}
                {/*    />*/}
                {/*    <span className={`text-xs font-bold ${!isVi ? "text-white" : "text-white/50"}`}>EN</span>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

export default TopBar;
