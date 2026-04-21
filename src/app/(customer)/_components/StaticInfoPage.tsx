"use client";

import React from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import { useRouter } from "next/navigation";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import Link from "next/link";
import type { InfoNavItem } from "./footerInfoData";

type Section = {
    heading: string;
    content: string;
};

type StaticInfoPageProps = {
    title: string;
    description: string;
    sections: Section[];
    backHref?: string;
    backLabel?: string;
    sideNavTitle?: string;
    sideNavItems?: InfoNavItem[];
    activeNavHref?: string;
};

export default function StaticInfoPage({
    title,
    description,
    sections,
    backHref = "/homepage",
    backLabel,
    sideNavTitle,
    sideNavItems = [],
    activeNavHref,
}: StaticInfoPageProps) {
    const router = useRouter();
    const { t } = useLocalization();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            <TopBar />
            <Header />

            <main className="w-[92%] lg:w-[70%] mx-auto py-10 sm:py-14">
                <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-7 lg:gap-12">
                    <aside>
                        {sideNavItems.length > 0 ? (
                            <div className="lg:sticky lg:top-24">
                                <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">{sideNavTitle || "Information"}</p>
                                <nav className="flex flex-col gap-1">
                                    {sideNavItems.map((item) => {
                                        const isActive = activeNavHref === item.href;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                    ? "bg-primary text-white"
                                                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        ) : null}
                    </aside>

                    <div>
                        <button
                            type="button"
                            onClick={() => router.push(backHref)}
                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-5"
                        >
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                            <span>{backLabel || t("customer.footer_pages.back_to_home") || "Back to homepage"}</span>
                        </button>

                        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3">{title}</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-8">{description}</p>

                        <div className="space-y-6 leading-7 text-sm sm:text-base text-slate-700 dark:text-slate-200">
                            {sections.map((section) => (
                                <div key={section.heading}>
                                    <h2 className="font-semibold text-base sm:text-lg mb-2">{section.heading}</h2>
                                    <p>{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
