"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopBar from "../_components/TopBar";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import PaginationControls from "../_components/PaginationControls";
import NewsOfferImage from "./_components/NewsOfferImage";
import { newsAndOffersService } from "@/src/services/administration-service/news-and-offers/news-and-offers.service";
import { NewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";

const DEFAULT_NEWS_FETCH_SIZE = 10;

interface NewsOfferCardItem {
    id: string;
    title: string;
    dateLabel: string;
    banner?: string;
}

export default function NewsOffersPage() {
    const [items, setItems] = useState<NewsAndOffersOutputDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [fetchSize] = useState(DEFAULT_NEWS_FETCH_SIZE);
    const [totalCount, setTotalCount] = useState(0);

    const cards = useMemo<NewsOfferCardItem[]>(
        () =>
            items.map((item) => ({
                id: item.id,
                title: item.title,
                dateLabel: item.startDate
                    ? new Date(item.startDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })
                    : "-",
                banner: item.posterUrl,
            })),
        [items],
    );

    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / fetchSize)), [totalCount, fetchSize]);

    useEffect(() => {
        const fetchActiveNewsAndOffers = async () => {
            try {
                setIsLoading(true);
                const result = await newsAndOffersService.getCustomerActiveNewsAndOffersListAsync({
                    page,
                    fetch: fetchSize,
                    keyword: "",
                });
                setItems(result?.items || []);
                setTotalCount(result?.totalCount || 0);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchActiveNewsAndOffers();
    }, [page, fetchSize]);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            <TopBar />
            <Header />

            <main className="w-[92%] lg:w-[70%] mx-auto py-10 sm:py-14">
                <section className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">News & Offers</h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                        Explore the latest promotions, campaign updates, and special offers from LTCinema.
                    </p>
                </section>

                {isLoading ? (
                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 py-16 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {cards.map((item) => (
                            <article
                                key={item.id}
                                className="group rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                            >
                                <Link href={`/news-offers/${item.id}`} className="block w-full">
                                    <div className="relative aspect-video overflow-hidden">
                                        <NewsOfferImage src={item.banner} alt={item.title} zoomOnHover />
                                    </div>
                                </Link>

                                <div className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                                    <Link href={`/news-offers/${item.id}`} className="block hover:text-primary transition-colors">
                                        <p className="font-semibold text-sm sm:text-base leading-6">{item.title}</p>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">{item.dateLabel}</p>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </section>
                )}

                {!isLoading && (
                    <div className="mt-8 flex items-center justify-center">
                        <PaginationControls
                            currentPage={page}
                            totalPages={totalPages}
                            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                            onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                        />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
