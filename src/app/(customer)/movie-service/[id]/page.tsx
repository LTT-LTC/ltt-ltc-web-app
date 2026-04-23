"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import TopBar from "../../_components/TopBar";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import LTTBadge from "@/src/@core/component/LTTBadge";
import LTTCastCard from "@/src/@core/component/LTTCastCard";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import { customerMovieService } from "@/src/services/customer-service/movie/movie.service";
import { MovieDetailOutputDto } from "@/src/services/customer-service/movie/models/output.model";
import { extractYoutubeVideoId } from "../../_components/movieTrailer";
import { getMoviePoster, normalizeMovieStatus } from "../../_components/movieCatalog";

const RATED_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    "G": { label: "General Audiences", icon: "child_care", color: "text-green-700", bg: "bg-green-100 border-green-300" },
    "PG": { label: "Parental Guidance", icon: "family_restroom", color: "text-blue-700", bg: "bg-blue-100 border-blue-300" },
    "PG-13": { label: "Parents Strongly Cautioned", icon: "escalator_warning", color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-300" },
    "R": { label: "Restricted (17+)", icon: "18_up_rating", color: "text-orange-700", bg: "bg-orange-100 border-orange-300" },
    "NC-17": { label: "Adults Only (18+)", icon: "no_adult_content", color: "text-red-700", bg: "bg-red-100 border-red-300" },
};

const FALLBACK_BACKDROP = "/images/movie-current-banners/470x700-us.jpg";

const formatDate = (value?: string) => {
    if (!value) return "-";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(parsed);
};

const formatDuration = (value?: number) => {
    if (!value || Number.isNaN(value)) {
        return "-";
    }

    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    if (hours === 0) {
        return `${minutes}m`;
    }

    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
};

type CastItem = NonNullable<MovieDetailOutputDto["cast"]>[number];
type CastCardItem = { name: string; role: string; image?: string };

const getCastName = (item: CastItem) => {
    return item.actorName || item.actor?.name || "Unknown";
};

const getCastRole = (item: CastItem) => {
    return item.roleName || item.role?.name || item.characterName || "";
};

const getCastList = (movie: MovieDetailOutputDto): CastCardItem[] => {
    if (movie.cast && movie.cast.length > 0) {
        return movie.cast.map((item) => ({
            name: getCastName(item),
            role: getCastRole(item),
            image: undefined,
        }));
    }

    if (movie.actorRoles && movie.actorRoles.length > 0) {
        return movie.actorRoles.map((item) => ({
            name: item.actorName,
            role: item.roleName,
            image: undefined,
        }));
    }

    return [];
};

const getDirectorNames = (movie: MovieDetailOutputDto) => {
    const fromCast = movie.cast
        ?.filter((item) => (item.roleName || item.role?.name || "").toLowerCase().includes("director"))
        .map((item) => getCastName(item)) ?? [];

    if (fromCast.length > 0) {
        return fromCast;
    }

    return movie.actorRoles
        ?.filter((item) => item.roleName.toLowerCase().includes("director"))
        .map((item) => item.actorName) ?? [];
};

export default function MovieDetailPage() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();
    const movieId = params.id;
    const [movie, setMovie] = useState<MovieDetailOutputDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trailerOpen, setTrailerOpen] = useState(false);

    useEffect(() => {
        let active = true;

        const loadMovie = async () => {
            if (!movieId) {
                setError("Movie ID is missing");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await customerMovieService.getMovieByIdAsync(movieId);
                if (active) {
                    setMovie(response);
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Failed to load movie details");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadMovie();

        return () => {
            active = false;
        };
    }, [movieId]);

    const trailerYoutubeId = useMemo(() => extractYoutubeVideoId(movie?.trailerUrl), [movie?.trailerUrl]);
    const ratedInfo = RATED_CONFIG[(movie?.ratingCode || "PG-13").toUpperCase()] ?? RATED_CONFIG["PG-13"];
    const statusLabel = normalizeMovieStatus(movie?.status) === "now_showing"
        ? "Now Showing"
        : normalizeMovieStatus(movie?.status) === "coming_soon"
            ? "Coming Soon"
            : "Ended";
    const poster = getMoviePoster(movie?.posterUrl, 0);
    const backdrop = movie?.posterUrl || FALLBACK_BACKDROP;
    const castList = movie ? getCastList(movie) : [];
    const directorNames = movie ? getDirectorNames(movie) : [];
    const genreNames = movie ? (movie.genreNames || movie.genres?.map((genre) => genre.name) || []) : [];

    useEffect(() => {
        if (searchParams.get("trailer") === "1" && trailerYoutubeId) {
            setTrailerOpen(true);
        }
    }, [searchParams, trailerYoutubeId]);

    return (
        <div className="w-full min-h-screen bg-background-light dark:bg-background-dark">
            <TopBar />
            <Header />

            <section className="w-[92%] lg:w-[70%] mx-auto relative overflow-hidden rounded-2xl mt-6 mb-6">
                <div className="absolute inset-0">
                    <img src={backdrop} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />
                </div>

                <div className="relative py-10 lg:py-16 px-6 lg:px-12">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 bg-transparent border-none cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    {loading ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-12 text-center text-white/80">
                            Loading movie details...
                        </div>
                    ) : error || !movie ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-12 text-center text-white/80">
                            <p className="mb-4">{error || "Movie not found."}</p>
                            <Link href="/homepage" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white hover:text-slate-900 transition-colors">
                                Go Home
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
                            <div className="shrink-0 w-52 lg:w-60 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                <img src={poster} alt={movie.title} className="w-full h-auto object-cover" />
                            </div>

                            <div className="flex flex-col gap-5 text-center md:text-left flex-1 min-w-0">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold bg-green-100 border-green-300 text-green-700">
                                        {statusLabel}
                                    </span>
                                    {movie.ratingCode && (
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${ratedInfo.bg} ${ratedInfo.color}`}>
                                            <span className="material-symbols-outlined text-[16px]">{ratedInfo.icon}</span>
                                            {movie.ratingCode}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl lg:text-5xl font-bold text-white m-0 leading-tight">
                                    {movie.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300 justify-center md:justify-start">
                                    <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-white/50">schedule</span>
                                        {formatDuration(movie.durationMins)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-white/50">calendar_today</span>
                                        {formatDate(movie.releaseDate || movie.premiereDate)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-white/50">video_library</span>
                                        {movie.studioName || movie.studio?.name || "-"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {genreNames.map((genre) => (
                                        <LTTBadge key={genre} color="light" variant="solid" size="sm">
                                            {genre}
                                        </LTTBadge>
                                    ))}
                                </div>

                                <p className="text-slate-400 text-sm m-0">
                                    <span className="text-white/60 font-semibold">Rating:</span>{" "}
                                    <span className="text-white">{movie.ratingName || movie.ratingCode || "-"}</span>
                                </p>

                                <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-1">
                                    <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-primary text-white hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer border-none">
                                        <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                                        Book Tickets
                                    </button>
                                    <button
                                        onClick={() => trailerYoutubeId && setTrailerOpen(true)}
                                        disabled={!trailerYoutubeId}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-white/10 text-white border border-white/25 hover:bg-white/20 active:scale-[0.97] transition-all cursor-pointer backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                        Watch Trailer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {!loading && movie && (
                <div className="w-[92%] lg:w-[70%] mx-auto py-10 lg:py-14">
                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="flex-1 min-w-0">
                            <div className="mb-10">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full inline-block" />
                                    Movie Description
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed m-0 text-[15px]">
                                    {movie.description || "No description available."}
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0 mb-5 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full inline-block" />
                                    Cast
                                </h2>
                                {castList.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                        {castList.map((cast) => (
                                            <LTTCastCard
                                                key={`${cast.name}-${cast.role}`}
                                                name={cast.name}
                                                role={cast.role}
                                                image={cast.image}
                                                size={68}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Cast information is not available yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-72 shrink-0">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 space-y-4">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 pb-3 border-b border-slate-100 dark:border-slate-700">
                                    Movie Info
                                </h3>
                                <InfoRow icon="person" label="Director" value={directorNames.length > 0 ? directorNames.join(", ") : "-"} />
                                <InfoRow icon="local_movies" label="Genre" value={genreNames.length > 0 ? genreNames.join(", ") : "-"} />
                                <InfoRow icon="theaters" label="Studio" value={movie.studioName || movie.studio?.name || "-"} />
                                <InfoRow icon="calendar_today" label="Release Date" value={formatDate(movie.releaseDate || movie.premiereDate)} />
                                <InfoRow icon="schedule" label="Running Time" value={formatDuration(movie.durationMins)} />
                                <InfoRow icon="translate" label="Status" value={statusLabel} />
                                <InfoRow icon={ratedInfo.icon} label="Rated" value={`${movie.ratingCode || "-"} — ${movie.ratingName || ratedInfo.label}`} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            <LTTModal
                open={trailerOpen}
                onCancel={() => setTrailerOpen(false)}
                footer={null}
                width={900}
                destroyOnHidden
                centered
                title={movie ? `${movie.title} — Trailer` : "Trailer"}
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
                            title={movie?.title ? `${movie.title} Trailer` : "Trailer"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-white/70">
                            Trailer is not available yet.
                        </div>
                    )}
                </div>
            </LTTModal>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs text-slate-400 m-0">{label}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 m-0 wrap-break-word">{value}</p>
            </div>
        </div>
    );
}
