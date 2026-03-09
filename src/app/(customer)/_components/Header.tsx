"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";

const Header: React.FC = () => {
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50">
            <div className="w-[70%] mx-auto flex items-center justify-between h-20">
                {/* Logo */}
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-primary p-1.5 rounded-lg text-white transform group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined text-3xl">movie</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tighter text-primary dark:text-white">LTC<span className="text-slate-400">inema</span></h1>
                </div>

                {/* Navigation Menu */}
                <nav className="hidden lg:flex items-center gap-8">
                    <div className="relative group py-6">
                        <button className="flex items-center gap-1 font-bold text-sm tracking-widest text-slate-700 hover:text-primary transition-colors">
                            MOVIES <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <div className="absolute top-full left-0 w-48 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">Now Showing</Link>
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">Coming Up</Link>
                        </div>
                    </div>
                    <div className="relative group py-6">
                        <button className="flex items-center gap-1 font-bold text-sm tracking-widest text-slate-700 hover:text-primary transition-colors">
                            THEATERS <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <div className="absolute top-full left-0 w-48 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">All Cinemas</Link>
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">Special Cinemas</Link>
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">3D Cinemas</Link>
                        </div>
                    </div>
                    <div className="relative group py-6">
                        <button className="flex items-center gap-1 font-bold text-sm tracking-widest text-slate-700 hover:text-primary transition-colors">
                            MEMBERSHIP <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <div className="absolute top-full left-0 w-48 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">My Cinema</Link>
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">Member Benefits</Link>
                        </div>
                    </div>
                    <div className="relative group py-6">
                        <button className="flex items-center gap-1 font-bold text-sm tracking-widest text-slate-700 hover:text-primary transition-colors">
                            CULTUREPLEX <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <div className="absolute top-full left-0 w-56 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">Online Store</Link>
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">Group Tickets</Link>
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm">Giftcodes & Vouchers</Link>
                            <Link href="#" className="block px-4 py-2 hover:bg-primary/5 text-sm border-t border-slate-50 mt-1">Cinema Rules</Link>
                        </div>
                    </div>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="lg:hidden p-2 text-slate-600">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="hidden sm:block">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search movies..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className={`bg-slate-100 dark:bg-slate-800 border rounded-full py-2 px-4 pl-10 pr-9 text-sm outline-none transition-all duration-300 ${
                                    searchFocused
                                        ? "w-72 border-primary ring-2 ring-primary/20"
                                        : "w-48 xl:w-64 border-transparent"
                                }`}
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            {searchValue && (
                                <button
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setSearchValue("");
                                        inputRef.current?.focus();
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
