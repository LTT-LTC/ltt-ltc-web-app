"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TopBar from "../../_components/TopBar";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import NewsOfferImage from "../_components/NewsOfferImage";
import { newsAndOffersService } from "@/src/services/administration-service/news-and-offers/news-and-offers.service";
import { NewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";

export default function NewsOfferDetailPage() {
    const params = useParams<{ slug: string }>();
    const [item, setItem] = useState<NewsAndOffersOutputDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const selectedId = params.slug || "";
    const contentParagraphs = useMemo(
        () =>
            (item?.content || "")
                .split(/\r?\n/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean),
        [item?.content],
    );

    useEffect(() => {
        const fetchNewsAndOfferDetail = async () => {
            if (!selectedId) {
                setItem(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const result = await newsAndOffersService.getCustomerNewsAndOffersByIdAsync(selectedId);
                setItem(result || null);
            } catch {
                setItem(null);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchNewsAndOfferDetail();
    }, [selectedId]);

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
                    {isLoading ? (
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 py-16 flex items-center justify-center">
                            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                        </div>
                    ) : !item ? (
                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 py-16 px-6 text-center text-slate-500 dark:text-slate-300">
                            This news item is unavailable or inactive.
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                            <div className="w-full lg:w-[48%] overflow-hidden rounded-lg aspect-video">
                                <NewsOfferImage src={item?.posterUrl} alt={item?.title || "News detail"} />
                            </div>

                            <div className="w-full lg:w-[52%]">
                                <p className="text-xs sm:text-sm uppercase tracking-wide text-primary font-semibold mb-2">
                                    {item?.startDate
                                        ? new Date(item.startDate).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "-"}
                                </p>
                                <h1 className="text-2xl sm:text-3xl font-bold mb-3">{item?.title}</h1>
                                <div className="space-y-4">
                                    {contentParagraphs.map((paragraph, index) => (
                                        <p key={`${item?.id}-${index}`} className="text-sm sm:text-base leading-7 text-slate-700 dark:text-slate-200">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
