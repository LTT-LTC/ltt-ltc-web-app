"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../../_components/TopBar";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import LTTBadge from "@/src/@core/component/LTTBadge";
import LTTCastCard from "@/src/@core/component/LTTCastCard";
import LTTTrailerModal from "@/src/@core/component/LTTTrailerModal";
import { use } from "react";

// ── Rating config (international film classification) ────────────
const RATED_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    "G": { label: "General Audiences", icon: "child_care", color: "text-green-700", bg: "bg-green-100 border-green-300" },
    "PG": { label: "Parental Guidance", icon: "family_restroom", color: "text-blue-700", bg: "bg-blue-100 border-blue-300" },
    "PG-13": { label: "Parents Strongly Cautioned", icon: "escalator_warning", color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-300" },
    "R": { label: "Restricted (17+)", icon: "18_up_rating", color: "text-orange-700", bg: "bg-orange-100 border-orange-300" },
    "NC-17": { label: "Adults Only (18+)", icon: "no_adult_content", color: "text-red-700", bg: "bg-red-100 border-red-300" },
};

// ── Mock data (replace with API call) ────────────────────────────
const MOVIE = {
    id: "1",
    title: "Interstellar: Beyond the Horizon",
    rated: "PG-13",
    director: "Christopher Nolan",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    releaseDate: "March 15, 2025",
    runningTime: "2h 49min",
    language: "English, Vietnamese subtitle",
    poster: "/images/movie-current-banners/470x700-straykids.jpg",
    backdrop: "/images/movie-current-banners/470x700-us.jpg",
    trailerYoutubeId: "zSWdZVtXT7E",
    description:
        "In the wake of Earth's declining resources, a team of astronauts embarks on a groundbreaking mission through a newly discovered wormhole. Led by former NASA pilot Cooper, the crew ventures beyond our solar system in search of habitable worlds that could ensure humanity's survival. As they traverse the vast expanse of space, they encounter breathtaking phenomena and face impossible choices that challenge their understanding of time, love, and sacrifice.",
    cast: [
        { name: "Matthew McConaughey", role: "Cooper", image: "/images/main/default_avatar.png" },
        { name: "Anne Hathaway", role: "Dr. Brand", image: "/images/main/default_avatar.png" },
        { name: "Jessica Chastain", role: "Murph", image: "/images/main/default_avatar.png" },
        { name: "Michael Caine", role: "Professor Brand", image: "/images/main/default_avatar.png" },
        { name: "Matt Damon", role: "Dr. Mann", image: "/images/main/default_avatar.png" },
        { name: "Casey Affleck", role: "Tom Cooper", image: "/images/main/default_avatar.png" },
    ],
};

// ── Page component ───────────────────────────────────────────────
export default function MovieDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const movie = MOVIE;
    const ratedInfo = RATED_CONFIG[movie.rated] ?? RATED_CONFIG["PG-13"];
    const [trailerOpen, setTrailerOpen] = useState(false);

    return (
        <div className="w-full min-h-screen bg-background-light dark:bg-background-dark">
            <TopBar />
            <Header />

            {/* ── Hero banner ─────────────────────────────────────── */}
            <section className="w-[92%] lg:w-[70%] mx-auto relative overflow-hidden rounded-2xl mt-6">
                {/* Backdrop */}
                <div className="absolute inset-0">
                    <img src={movie.backdrop} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>

                <div className="relative py-10 lg:py-16 px-6 lg:px-12">
                    {/* Back arrow */}
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 bg-transparent border-none cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[22px]">arrow_back</span>
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
                        {/* Poster */}
                        <div className="shrink-0 w-52 lg:w-60 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            <img src={movie.poster} alt={movie.title} className="w-full h-auto object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-5 text-center md:text-left flex-1 min-w-0">
                            {/* Movie Name */}
                            <h1 className="text-3xl lg:text-5xl font-bold text-white m-0 leading-tight">
                                {movie.title}
                            </h1>

                            {/* Rated tag with icon */}
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${ratedInfo.bg} ${ratedInfo.color}`}>
                                    <span className="material-symbols-outlined text-[16px]">{ratedInfo.icon}</span>
                                    {movie.rated}
                                </span>
                                <span className="text-white/50 text-xs">{ratedInfo.label}</span>
                            </div>

                            {/* Quick meta row */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300 justify-center md:justify-start">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-white/50">schedule</span>
                                    {movie.runningTime}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-white/50">calendar_today</span>
                                    {movie.releaseDate}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] text-white/50">translate</span>
                                    {movie.language}
                                </span>
                            </div>

                            {/* Genre badges */}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {movie.genres.map((g) => (
                                    <LTTBadge key={g} color="light" variant="solid" size="sm">
                                        {g}
                                    </LTTBadge>
                                ))}
                            </div>

                            {/* Director */}
                            <p className="text-slate-400 text-sm m-0">
                                <span className="text-white/60 font-semibold">Director:</span>{" "}
                                <span className="text-white">{movie.director}</span>
                            </p>

                            {/* CTA buttons */}
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-1">
                                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-[var(--color-primary)] text-white hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer border-none">
                                    <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                                    Book Tickets
                                </button>
                                <button
                                    onClick={() => setTrailerOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-white/10 text-white border border-white/25 hover:bg-white/20 active:scale-[0.97] transition-all cursor-pointer backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                    Watch Trailer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Body ────────────────────────────────────────────── */}
            <div className="w-[92%] lg:w-[70%] mx-auto py-10 lg:py-14">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* ── Left: Description + Cast ────────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Movie Description */}
                        <div className="mb-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[var(--color-primary)] rounded-full inline-block" />
                                Movie Description
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed m-0 text-[15px]">
                                {movie.description}
                            </p>
                        </div>

                        {/* Cast */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white m-0 mb-5 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[var(--color-primary)] rounded-full inline-block" />
                                Cast
                            </h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {movie.cast.map((c) => (
                                    <LTTCastCard
                                        key={c.name}
                                        name={c.name}
                                        role={c.role}
                                        image={c.image}
                                        size={68}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Info summary card ─────────────────── */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 space-y-4">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 pb-3 border-b border-slate-100 dark:border-slate-700">
                                Movie Info
                            </h3>
                            <InfoRow icon="person" label="Director" value={movie.director} />
                            <InfoRow icon="theaters" label="Genre" value={movie.genres.join(", ")} />
                            <InfoRow icon="calendar_today" label="Release Date" value={movie.releaseDate} />
                            <InfoRow icon="schedule" label="Running Time" value={movie.runningTime} />
                            <InfoRow icon="translate" label="Language" value={movie.language} />
                            <InfoRow icon={ratedInfo.icon} label="Rated" value={`${movie.rated} — ${ratedInfo.label}`} />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* ── Trailer Modal ──────────────────────────────────── */}
            <LTTTrailerModal
                open={trailerOpen}
                onClose={() => setTrailerOpen(false)}
                trailerYoutubeId={movie.trailerYoutubeId}
                title={`${movie.title} - Trailer`}
            />
        </div>
    );
}

// ── Helper: info row with icon ──────────────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-[18px] mt-0.5">{icon}</span>
            <div className="min-w-0">
                <p className="text-xs text-slate-400 m-0">{label}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 m-0 break-words">{value}</p>
            </div>
        </div>
    );
}
