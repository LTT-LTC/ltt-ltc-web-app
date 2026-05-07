"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "../_components/TopBar";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import PaginationControls from "../_components/PaginationControls";
import LTTMovieCard from "@/src/@core/component/LTTMovieCard";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { buildMovieCardItem, MOVIE_PAGE_SIZE, useMovieCatalog } from "../_components/movieCatalog";
import { extractYoutubeVideoId } from "../_components/movieTrailer";

export default function ComingSoonPage() {
    const { t, currentLanguage } = useLocalization();
    const router = useRouter();
    const { comingSoonMovies, isLoading, error, reloadMovies } = useMovieCatalog();
    const [page, setPage] = useState(0);
    const [trailerOpen, setTrailerOpen] = useState(false);
    const [trailerTitle, setTrailerTitle] = useState("");
    const [trailerUrl, setTrailerUrl] = useState("");

    const totalPages = Math.max(1, Math.ceil(comingSoonMovies.length / MOVIE_PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);

    const currentMovies = useMemo(
        () => comingSoonMovies.slice(currentPage * MOVIE_PAGE_SIZE, (currentPage + 1) * MOVIE_PAGE_SIZE).map((movie, index) =>
            buildMovieCardItem(movie, currentPage * MOVIE_PAGE_SIZE + index, currentLanguage),
        ),
        [comingSoonMovies, currentLanguage, currentPage],
    );
    const trailerYoutubeId = useMemo(() => extractYoutubeVideoId(trailerUrl), [trailerUrl]);

    const openTrailerModal = (title: string, url?: string) => {
        if (!url) {
            return;
        }

        setTrailerTitle(title);
        setTrailerUrl(url);
        setTrailerOpen(true);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <TopBar />
            <Header />

            <main className="grow py-6">
                <div className="w-[92%] lg:w-[70%] mx-auto flex items-center gap-2 mb-8 text-sm">
                    <Link href="/homepage" className="hover:text-primary transition-colors flex items-center">
                        <span className="material-symbols-outlined text-[18px]">home</span>
                    </Link>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-500">{t("customer.common.movies") || "Movies"}</span>
                    <span className="text-slate-400">›</span>
                    <span className="font-bold border-b border-primary text-primary">{t("customer.homepage.coming_soon") || "Coming Soon"}</span>
                </div>

                <div className="w-[92%] lg:w-[70%] mx-auto flex items-end justify-between border-b-2 border-slate-900 dark:border-white pb-2 mb-8 gap-4">
                    <h1 className="text-3xl sm:text-4xl font-normal uppercase tracking-wide m-0 p-0 leading-none">{t("customer.homepage.coming_soon") || "Coming Soon"}</h1>
                    <div className="flex gap-6">
                        <Link href="/now-showing" className="text-xl sm:text-3xl font-light text-slate-400 dark:text-slate-600 uppercase cursor-pointer hover:text-slate-500 transition-colors">
                            {t("customer.homepage.now_showing") || "Now Showing"}
                        </Link>
                    </div>
                </div>

                <div className="w-[92%] lg:w-[70%] mx-auto">
                    {isLoading && (
                        <div className="flex min-h-55 items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40">
                            <Image src="/images/main/LTTAppLoading.gif" alt="Loading..." width={80} height={80} priority />
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
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
                        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                            {t("customer.coming_soon.empty") || "No coming soon movies are available yet."}
                        </div>
                    )}

                    {!isLoading && !error && currentMovies.length > 0 && (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
                        </>
                    )}

                    {!isLoading && !error && (
                        <div className="mt-8 flex items-center justify-center">
                            <PaginationControls
                                currentPage={currentPage + 1}
                                totalPages={totalPages}
                                onPrevious={() => setPage((current) => Math.max(0, current - 1))}
                                onNext={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                            />
                        </div>
                    )}
                </div>
            </main>

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

            <Footer />
        </div>
    );
}
