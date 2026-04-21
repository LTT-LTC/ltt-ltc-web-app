"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import TopBar from "../../_components/TopBar";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import { NEWS_OFFERS_BY_ID, NEWS_OFFERS_BY_SLUG } from "../newsOffersData";

export default function NewsOfferDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const item = NEWS_OFFERS_BY_SLUG[slug] || NEWS_OFFERS_BY_ID[slug];

    if (!item) {
        notFound();
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            <TopBar />
            <Header />

            <main className="w-[92%] lg:w-[70%] mx-auto py-10 sm:py-14">
                <div className="mb-6 flex flex-wrap gap-3">
                    <Link
                        href="/news-offers"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to News & Offers
                    </Link>
                    <Link
                        href="/homepage"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">home</span>
                        Back to homepage
                    </Link>
                </div>

                <section className="p-1 sm:p-2">
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                        <div className="w-full lg:w-[48%] overflow-hidden rounded-lg">
                            <img src={item.banner} alt={item.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="w-full lg:w-[52%]">
                            <p className="text-xs sm:text-sm uppercase tracking-wide text-primary font-semibold mb-2">
                                {item.dateLabel}
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{item.title}</h1>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 leading-7">
                                {item.excerpt}
                            </p>

                            <div className="space-y-4">
                                {item.details.map((paragraph, index) => (
                                    <p key={`${item.slug}-${index}`} className="text-sm sm:text-base leading-7 text-slate-700 dark:text-slate-200">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
