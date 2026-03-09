"use client";
import React from "react";
import Link from "next/link";

const SubNav: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="w-[70%] mx-auto py-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link href="#" className="flex flex-col items-center gap-2 group">
                    <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight text-slate-500">All Cinemas</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-2 group">
                    <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">theaters</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight text-slate-500">Now Showing</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-2 group">
                    <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">group</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight text-slate-500">Group Tickets</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-2 group">
                    <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">card_giftcard</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight text-slate-500">News & Offers</span>
                </Link>
                <Link href="#" className="flex flex-col items-center gap-2 group col-span-2 md:col-span-1">
                    <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">person_add</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight text-slate-500">Register Account</span>
                </Link>
            </div>
        </div>
    );
};

export default SubNav;
