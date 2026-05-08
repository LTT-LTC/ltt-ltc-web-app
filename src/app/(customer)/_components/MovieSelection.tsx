"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LTTMovieCard from "@/src/@core/component/LTTMovieCard";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import {
    buildMovieCardItem,
    MOVIE_PAGE_SIZE,
    MovieCardItem,
    MovieSectionStatus,
    useMovieCatalogSection,
} from "./movieCatalog";
import { extractYoutubeVideoId } from "./movieTrailer";
import PaginationControls from "./PaginationControls";

const emptyPageState: Record<MovieSectionStatus, number> = {
    now_showing: 0,
    coming_soon: 0,
};

const sectionKeyToLabel: Record<MovieSectionStatus, string> = {
    now_showing: "NOW SHOWING",
    coming_soon: "COMING SOON",
};

const MovieSelection: React.FC = () => {
    const { t, currentLanguage } = useLocalization();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<MovieSectionStatus>("now_showing");
    const [pageByTab, setPageByTab] = useState<Record<MovieSectionStatus, number>>(emptyPageState);
    const [trailerOpen, setTrailerOpen] = useState(false);
    const [trailerTitle, setTrailerTitle] = useState("");
    const [trailerUrl, setTrailerUrl] = useState("");

    const nowShowingPage = pageByTab.now_showing + 1;
    const comingSoonPage = pageByTab.coming_soon + 1;
    const {
        movies: nowShowingMovies,
        totalCount: nowShowingTotalCount,
        isLoading: isNowShowingLoading,
        error: nowShowingError,
        reloadMovies: reloadNowShowingMovies,
    } = useMovieCatalogSection("now_showing", nowShowingPage, MOVIE_PAGE_SIZE);
    const {
        movies: comingSoonMovies,
        totalCount: comingSoonTotalCount,
        isLoading: isComingSoonLoading,
        error: comingSoonError,
        reloadMovies: reloadComingSoonMovies,
    } = useMovieCatalogSection("coming_soon", comingSoonPage, MOVIE_PAGE_SIZE);

    const activeMovies = activeTab === "now_showing" ? nowShowingMovies : comingSoonMovies;
    const activeTotalCount = activeTab === "now_showing" ? nowShowingTotalCount : comingSoonTotalCount;
    const isLoading = activeTab === "now_showing" ? isNowShowingLoading : isComingSoonLoading;
    const error = activeTab === "now_showing" ? nowShowingError : comingSoonError;
    const reloadMovies = activeTab === "now_showing" ? reloadNowShowingMovies : reloadComingSoonMovies;

    const totalPages = Math.max(1, Math.ceil(activeTotalCount / MOVIE_PAGE_SIZE));
    const activePage = Math.min(pageByTab[activeTab], totalPages - 1);

    const currentMovies = useMemo<MovieCardItem[]>(() => {
        const start = activePage * MOVIE_PAGE_SIZE;
        return activeMovies.map((movie, index) =>
            buildMovieCardItem(movie, start + index, currentLanguage),
        );
    }, [activeMovies, activePage, currentLanguage]);
    const trailerYoutubeId = useMemo(() => extractYoutubeVideoId(trailerUrl), [trailerUrl]);

    const handlePrevious = () => {
        setPageByTab((current) => ({
            ...current,
            [activeTab]: Math.max(0, activePage - 1),
        }));
    };

    const handleNext = () => {
        setPageByTab((current) => ({
            ...current,
            [activeTab]: Math.min(totalPages - 1, activePage + 1),
        }));
    };

    const openTrailerModal = (title: string, url?: string) => {
        if (!url) {
            return;
        }

        setTrailerTitle(title);
        setTrailerUrl(url);
        setTrailerOpen(true);
    };

    return (
        <section className="w-[92%] lg:w-[70%] mx-auto py-8 sm:py-16">
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-10 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl">movie_filter</span>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight uppercase">
                        {t("customer.homepage.movie_selection") || "Movie Selection"}
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide w-full sm:w-auto">
                        {(Object.keys(sectionKeyToLabel) as MovieSectionStatus[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveTab(status)}
                                className={`px-4 sm:px-6 py-2 font-bold rounded-t-lg text-xs sm:text-sm whitespace-nowrap transition-colors ${activeTab === status
                                    ? "bg-primary text-white"
                                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                            >
                                {t(`customer.homepage.${status}`) || sectionKeyToLabel[status]}
                                <span className="ml-2 opacity-75">({status === "now_showing" ? nowShowingTotalCount : comingSoonTotalCount})</span>
                            </button>
                        ))}
                    </div>

                    <PaginationControls
                        currentPage={activePage + 1}
                        totalPages={totalPages}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                    />
                </div>
            </div>

            <div className="relative min-h-55">
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

                {!isLoading && error && (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        <p className="mb-4">{error}</p>
                        <button
                            type="button"
                            onClick={reloadMovies}
                            className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                            {t("customer.common.retry") || "Retry"}
                        </button>
                    </div>
                )}

                {!isLoading && !error && currentMovies.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        {activeTab === "now_showing"
                            ? (t("customer.homepage.now_showing") || "Now Showing")
                            : (t("customer.homepage.coming_soon") || "Coming Soon")}
                        {" "}
                        {t("customer.homepage.movies_not_available_yet") || "movies are not available yet."}
                    </div>
                )}

                {!isLoading && !error && currentMovies.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {currentMovies.map((movie) => (
                            <LTTMovieCard
                                key={movie.id}
                                title={movie.title}
                                image={movie.image}
                                tags={movie.tags}
                                description={movie.description}
                                genre={movie.genre}
                                runningTime={movie.runningTime}
                                releaseDate={movie.releaseDate}
                                onTrailer={movie.trailerUrl ? () => openTrailerModal(movie.title, movie.trailerUrl) : undefined}
                                onViewDetail={() => router.push(`/movies/${movie.id}`)}
                            />
                        ))}
                    </div>
                )}

            </div>

            <LTTModal
                open={trailerOpen}
                onCancel={() => setTrailerOpen(false)}
                footer={null}
                width={900}
                destroyOnHidden
                centered
                title={trailerTitle ? `${trailerTitle} — ${t("customer.common.trailer") || "Trailer"}` : (t("customer.common.trailer") || "Trailer")}
                className="trailer-modal"
                styles={{
                    body: { padding: 0 },
                    mask: { backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.75)" },
                }}
            >
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    {trailerYoutubeId ? (
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${trailerYoutubeId}`}
                            title={trailerTitle ? `${trailerTitle} ${t("customer.common.trailer") || "Trailer"}` : (t("customer.common.trailer") || "Trailer")}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-white/70">
                            {t("customer.common.trailer_not_available") || "Trailer is not available yet."}
                        </div>
                    )}
                </div>
            </LTTModal>
        </section>
    );
};

export default MovieSelection;
