"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import UserDropdown from "@/src/layouts/components/header/UserDropdown";
import { DropdownItem } from "@/src/@core/component/LTTDropdown/DropdownItem";
import LTTBadge from "@/src/@core/component/LTTBadge";
import LTTRenderIf from "@/src/@core/component/LTTRenderIf";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import NavArrowDownIcon from "@/src/@core/component/LTTIcon/iconoir/nav-arrow-down";
import SearchIcon from "@/src/@core/component/LTTIcon/iconoir/search";
import UserIcon from "@/src/@core/component/LTTIcon/iconoir/user";
import CartIcon from "@/src/@core/component/LTTIcon/iconoir/cart";

// --- Navigation data ---
interface NavItem {
    label: string;
    children: { label: string; href: string; badge?: string }[];
}

// --- Navigation data hook ---
const useNavItems = () => {
    const { t } = useLocalization();
    return [
        {
            label: t("customer.nav.movies") || "MOVIES",
            children: [
                { label: t("customer.nav.now_showing") || "Now Showing", href: "/now-showing", badge: "Hot" },
                { label: t("customer.nav.coming_soon") || "Coming Soon", href: "/coming-soon" },
            ],
        },
        {
            label: t("customer.nav.theaters") || "THEATERS",
            children: [
                { label: t("customer.nav.all_cinemas") || "All Cinemas", href: "/theaters/all-cinemas" },
                { label: t("customer.nav.special_cinemas") || "Special Cinemas", href: "#" },
                { label: t("customer.nav.cinemas_3d") || "3D Cinemas", href: "#" },
            ],
        },
        {
            label: t("customer.nav.cultureplex") || "CULTUREPLEX",
            children: [
                { label: t("customer.nav.online_store") || "Online Store", href: "#" },
                { label: t("customer.nav.group_tickets") || "Group Tickets", href: "#" },
                { label: t("customer.nav.giftcodes_vouchers") || "Giftcodes & Vouchers", href: "/my-ltc/vouchers" },
                { label: t("customer.nav.cinema_rules") || "Cinema Rules", href: "#" },
            ],
        }
    ];
};

// --- Desktop nav dropdown ---
const NavDropdown: React.FC<{ item: NavItem }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className="relative group py-6"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Trigger */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-1 font-bold text-sm tracking-widest text-slate-700 dark:text-slate-200 hover:text-primary transition-colors duration-200 cursor-pointer"
            >
                {item.label}
                <NavArrowDownIcon
                    className={`!w-4 !h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:rotate-180'}`}
                />
            </button>

            {/* Animated underline */}
            <span className={`absolute bottom-4 left-0 h-0.5 bg-primary transition-all duration-300 rounded-full ${isOpen ? 'w-full' : 'w-0 group-hover:w-full'}`} />

            {/* Dropdown panel */}
            <div
                className={`
                    absolute top-full left-1/2 -translate-x-1/2 min-w-[200px]
                    bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-xl
                    py-2 origin-top
                    transition-[transform,opacity] duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                    ${isOpen ? 'scale-y-100 opacity-100 pointer-events-auto' : 'scale-y-0 opacity-0 pointer-events-none group-hover:scale-y-100 group-hover:opacity-100 group-hover:pointer-events-auto'}
                `}
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
    const navItems = useNavItems();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const isChildActive = (href: string) => {
        if (!href || href === "#") return false;
        return pathname === href || pathname === `${href}/` || pathname.startsWith(`${href}/`);
    };

    const isParentActive = (children: { href: string }[]) => {
        return children.some((child) => isChildActive(child.href));
    };

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

    useEffect(() => {
        if (isOpen) {
            setExpandedIndex(null);
            onClose();
        }
    }, [pathname]);

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

                {/* User section */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <UserDropdown />
                </div>

                {/* Menu items */}
                <nav className="px-4 pb-8 overflow-y-auto max-h-[calc(100vh-80px)]">
                    {navItems.map((item, idx) => (
                        <div
                            key={item.label}
                            className="border-b border-slate-100 dark:border-slate-800"
                            style={{ animationDelay: isOpen ? `${idx * 60}ms` : "0ms" }}
                        >
                            <button
                                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                                className={`flex items-center justify-between w-full py-4 text-sm font-bold tracking-widest cursor-pointer transition-colors ${isParentActive(item.children)
                                    ? "text-[#cc3434]"
                                    : "text-slate-700 dark:text-slate-200"
                                    }`}
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
                                    maxHeight: expandedIndex === idx ? "420px" : "0px",
                                    opacity: expandedIndex === idx ? 1 : 0,
                                }}
                            >
                                {item.children.map((child) => (
                                    <DropdownItem
                                        key={child.label}
                                        tag="a"
                                        href={child.href}
                                        onItemClick={onClose}
                                        baseClassName={`flex items-center gap-2 w-full pl-4 pr-2 py-3 text-sm rounded-lg transition-colors duration-150 ${isChildActive(child.href)
                                            ? "bg-[#fff1f1] !text-[#cc3434] hover:!text-[#cc3434] visited:!text-[#cc3434] focus:!text-[#cc3434]"
                                            : "!text-slate-600 dark:!text-slate-400 hover:!text-[#cc3434] visited:!text-slate-600 focus:!text-[#cc3434] hover:bg-[#fff1f1]"
                                            }`}
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
                            {useLocalization().t("customer.nav.book_now") || "Book Now"}
                        </LTTButton>
                    </div>
                </nav>
            </div>
        </>
    );
};

// --- Main Header ---
const Header: React.FC = () => {
    const navItems = useNavItems();
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
                        {navItems.map((item) => (
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
                        <div className="hidden sm:flex items-center">
                            <UserDropdown />
                        </div>

                        {/* Book Now - desktop */}
                        {/*<div className="hidden lg:block ml-2">*/}
                        {/*    <LTTButton*/}
                        {/*        variant="primary"*/}
                        {/*        size="sm"*/}
                        {/*        className="!bg-primary !text-white hover:!scale-105 transition-transform duration-200"*/}
                        {/*    >*/}
                        {/*        Book Now*/}
                        {/*    </LTTButton>*/}
                        {/*</div>*/}

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
