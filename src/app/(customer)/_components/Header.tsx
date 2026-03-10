"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import { DropdownItem } from "@/src/@core/component/LTTDropdown/DropdownItem";
import LTTBadge from "@/src/@core/component/LTTBadge";
import LTTRenderIf from "@/src/@core/component/LTTRenderIf";
import NavArrowDownIcon from "@/src/@core/component/LTTIcon/iconoir/nav-arrow-down";
import SearchIcon from "@/src/@core/component/LTTIcon/iconoir/search";
import UserIcon from "@/src/@core/component/LTTIcon/iconoir/user";
import CartIcon from "@/src/@core/component/LTTIcon/iconoir/cart";

// --- Navigation data ---
interface NavItem {
    label: string;
    children: { label: string; href: string; badge?: string }[];
}

const NAV_ITEMS: NavItem[] = [
    {
        label: "MOVIES",
        children: [
            { label: "Now Showing", href: "/now-showing", badge: "Hot" },
            { label: "Coming Soon", href: "/coming-soon" },
        ],
    },
    {
        label: "THEATERS",
        children: [
            { label: "All Cinemas", href: "#" },
            { label: "Special Cinemas", href: "#" },
            { label: "3D Cinemas", href: "#" },
        ],
    },
    {
        label: "MEMBERSHIP",
        children: [
            { label: "My Cinema", href: "#" },
            { label: "Member Benefits", href: "#" },
        ],
    },
    {
        label: "CULTUREPLEX",
        children: [
            { label: "Online Store", href: "#" },
            { label: "Group Tickets", href: "#" },
            { label: "Giftcodes & Vouchers", href: "#" },
            { label: "Cinema Rules", href: "#" },
        ],
    },
];

// --- Desktop nav dropdown ---
const NavDropdown: React.FC<{ item: NavItem }> = ({ item }) => {
    return (
        <div className="relative group py-6">
            {/* Trigger */}
            <button className="flex items-center gap-1 font-bold text-sm tracking-widest text-slate-700 dark:text-slate-200 hover:text-primary transition-colors duration-200 cursor-pointer">
                {item.label}
                <NavArrowDownIcon
                    className="!w-4 !h-4 transition-transform duration-300 group-hover:rotate-180"
                />
            </button>

            {/* Animated underline */}
            <span className="absolute bottom-4 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />

            {/* Dropdown panel */}
            <div
                className="
                    absolute top-full left-1/2 -translate-x-1/2 min-w-[200px]
                    bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-xl
                    py-2 origin-top
                    scale-y-0 opacity-0 pointer-events-none
                    group-hover:scale-y-100 group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-[transform,opacity] duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                "
            >
                {item.children.map((child, idx) => (
                    <DropdownItem
                        key={child.label}
                        tag="a"
                        href={child.href}
                        baseClassName="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary transition-colors duration-150"
                        className={`animate-[fadeSlideIn_0.25s_ease_both] ${idx > 0 ? `[animation-delay:${idx * 50}ms]` : ""}`}
                    >
                        {child.label}
                        <LTTRenderIf condition={!!child.badge}>
                            <LTTBadge variant="solid" color="error" size="sm">{child.badge}</LTTBadge>
                        </LTTRenderIf>
                    </DropdownItem>
                ))}
            </div>
        </div>
    );
};

// --- Mobile nav menu ---
const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Slide-in panel */}
            <div
                ref={menuRef}
                className={`fixed top-0 right-0 z-50 h-full w-[300px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl
                    transition-transform duration-400 ease-[cubic-bezier(.4,0,.2,1)]
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Close button */}
                <div className="flex justify-end p-4">
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {/* Menu items */}
                <nav className="px-4 pb-8 overflow-y-auto max-h-[calc(100vh-80px)]">
                    {NAV_ITEMS.map((item, idx) => (
                        <div
                            key={item.label}
                            className="border-b border-slate-100 dark:border-slate-800"
                            style={{ animationDelay: isOpen ? `${idx * 60}ms` : "0ms" }}
                        >
                            <button
                                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                                className="flex items-center justify-between w-full py-4 text-sm font-bold tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                                {item.label}
                                <NavArrowDownIcon
                                    className={`!w-4 !h-4 transition-transform duration-300 ${expandedIndex === idx ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Collapsible children */}
                            <div
                                className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
                                style={{
                                    maxHeight: expandedIndex === idx ? `${item.children.length * 48}px` : "0px",
                                    opacity: expandedIndex === idx ? 1 : 0,
                                }}
                            >
                                {item.children.map((child) => (
                                    <DropdownItem
                                        key={child.label}
                                        tag="a"
                                        href={child.href}
                                        onItemClick={onClose}
                                        baseClassName="flex items-center gap-2 w-full pl-4 pr-2 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors duration-150"
                                    >
                                        {child.label}
                                        <LTTRenderIf condition={!!child.badge}>
                                            <LTTBadge variant="solid" color="error" size="sm">{child.badge}</LTTBadge>
                                        </LTTRenderIf>
                                    </DropdownItem>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Mobile CTA */}
                    <div className="mt-6">
                        <LTTButton variant="primary" size="lg" className="!w-full !bg-primary !text-white">
                            Book Now
                        </LTTButton>
                    </div>
                </nav>
            </div>
        </>
    );
};

// --- Main Header ---
const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

    return (
        <>
            <header
                className={`bg-white dark:bg-slate-900 sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-lg" : "shadow-sm"}`}
            >
                <div className="w-[92%] lg:w-[70%] mx-auto flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary p-1.5 rounded-lg text-white transition-transform duration-300 ease-out group-hover:rotate-12 group-hover:scale-110">
                            <span className="material-symbols-outlined text-3xl">movie</span>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tighter text-primary dark:text-white select-none m-0 p-0 leading-none">
                            LTC<span className="text-slate-400 transition-colors duration-300 group-hover:text-primary/60">inema</span>
                        </h1>
                    </Link>

                    {/* Desktop navigation */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {NAV_ITEMS.map((item) => (
                            <NavDropdown key={item.label} item={item} />
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        {/* Cart */}
                        <button className="hidden sm:flex items-center justify-center size-10 rounded-full hover:bg-primary/5 text-slate-500 hover:text-primary transition-all duration-200 cursor-pointer">
                            <CartIcon className="!w-5 !h-5" />
                        </button>
                        {/* User */}
                        <button className="hidden sm:flex items-center justify-center size-10 rounded-full hover:bg-primary/5 text-slate-500 hover:text-primary transition-all duration-200 cursor-pointer">
                            <UserIcon className="!w-5 !h-5" />
                        </button>

                        {/* Book Now - desktop */}
                        <div className="hidden lg:block ml-2">
                            <LTTButton
                                variant="primary"
                                size="sm"
                                className="!bg-primary !text-white hover:!scale-105 transition-transform duration-200"
                            >
                                Book Now
                            </LTTButton>
                        </div>

                        {/* Hamburger - mobile */}
                        <button
                            className="lg:hidden flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 transition-colors cursor-pointer"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile menu overlay */}
            <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />

            {/* Keyframe for staggered dropdown items */}
            <style jsx global>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default Header;
