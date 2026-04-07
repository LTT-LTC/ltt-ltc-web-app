"use client";
import React from "react";
import Link from "next/link";

const SubNav: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="w-[92%] lg:w-[70%] mx-auto py-4 flex overflow-x-auto gap-2 sm:grid sm:grid-cols-3 md:grid-cols-5 sm:gap-4 scrollbar-hide">
                <Link href="theaters/all-cinemas/" className="flex flex-col items-center gap-2 group shrink-0 min-w-[80px]">
                    <div className="size-10 sm:size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">location_on</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-slate-500 text-center">All Cinemas</span>
                </Link>
                <Link href="/now-showing" className="flex flex-col items-center gap-2 group shrink-0 min-w-[80px]">
                    <div className="size-10 sm:size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">theaters</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-slate-500 text-center">Now Showing</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-2 group shrink-0 min-w-[80px]">
                    <div className="size-10 sm:size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">group</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-slate-500 text-center">Group Tickets</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-2 group shrink-0 min-w-[80px]">
                    <div className="size-10 sm:size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">card_giftcard</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-slate-500 text-center">News & Offers</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-2 group shrink-0 min-w-[80px]">
                    <div className="size-10 sm:size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-xl sm:text-2xl">person_add</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-slate-500 text-center">Register Account</span>
                </Link>
            </div>
        </div>
    );
};

export default SubNav;
