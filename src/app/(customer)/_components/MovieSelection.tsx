"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LTTMovieCard from "@/src/@core/component/LTTMovieCard";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import {
    getMovieSelectionMutation,
    MovieSelectionTab,
} from "@/src/mutations/customer-content/getMovieSelection.mutation";
import { CustomerMovieOutputDto } from "@/src/services/customer-service/content/models/output.model";

const PAGE_SIZE = 8;

const MovieSelection: React.FC = () => {
    const { t } = useLocalization();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<MovieSelectionTab>("now_showing");
    const [page, setPage] = useState(0);

    const { mutation, data, isLoading } = useLTTMutation<CustomerMovieOutputDto[], MovieSelectionTab>({
        mutationFn: getMovieSelectionMutation,
    });

    const movies = data ?? [];
    const totalPages = Math.max(1, Math.ceil(movies.length / PAGE_SIZE));

    const currentMovies = useMemo(
        () => movies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
        [movies, page]
    );

    useEffect(() => {
        mutation(activeTab);
        setPage(0);
    }, [activeTab]);

    const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages - 1));
    const goPrev = () => setPage((prev) => Math.max(prev - 1, 0));

    const isNowShowing = activeTab === "now_showing";
    const isComingSoon = activeTab === "coming_soon";

    return (
        <section className="w-[92%] lg:w-[70%] mx-auto py-8 sm:py-16">
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-10 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl">movie_filter</span>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight uppercase">{t("customer.homepage.movie_selection") || "Movie Selection"}</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab("now_showing")}
                            className={`px-4 sm:px-6 py-2 font-bold rounded-t-lg text-xs sm:text-sm whitespace-nowrap ${isNowShowing
                                ? "bg-primary text-white"
                                : "text-slate-500 hover:bg-slate-100"
                                }`}
                        >
                            {t("customer.homepage.now_showing") || "NOW SHOWING"}
                        </button>
                        <button
                            onClick={() => setActiveTab("coming_soon")}
                            className={`px-4 sm:px-6 py-2 font-bold rounded-t-lg text-xs sm:text-sm whitespace-nowrap ${isComingSoon
                                ? "bg-primary text-white"
                                : "text-slate-500 hover:bg-slate-100"
                                }`}
                        >
                            {t("customer.homepage.coming_soon") || "COMING SOON"}
                        </button>
                        <button className="px-4 sm:px-6 py-2 text-slate-500 hover:bg-slate-100 font-bold rounded-t-lg text-xs sm:text-sm whitespace-nowrap">{t("customer.homepage.special_screening") || "SPECIAL SCREENING"}</button>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                                onClick={goPrev}
                                disabled={page === 0}
                                className="size-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-slate-200"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                            </button>
                            <span className="text-xs text-slate-500 min-w-[3rem] text-center">{page + 1} / {totalPages}</span>
                            <button
                                onClick={goNext}
                                disabled={page === totalPages - 1}
                                className="size-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-slate-200"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="relative min-h-[200px]">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 rounded-xl backdrop-blur-sm">
                        <Image
                            src="/images/main/LTTAppLoading.gif"
                            alt="Loading..."
                            width={80}
                            height={80}
                            priority
                        />
                    </div>
                )}
                <div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 transition-all duration-300 ease-in-out opacity-100 translate-x-0"
                >
                    {currentMovies.map((movie) => (
                        <LTTMovieCard
                            key={movie.id}
                            title={movie.title}
                            image={movie.image}
                            tags={movie.tags}
                            description={movie.description}
                            genre={movie.genre}
                            trailerYoutubeId={movie.trailerYoutubeId}
                            onViewDetail={() => router.push(`/movie/${movie.id}`)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MovieSelection;
