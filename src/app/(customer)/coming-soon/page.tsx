"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "../_components/TopBar";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import LTTMovieCard from "@/src/@core/component/LTTMovieCard";

// Mock Data — Coming Soon movies
const MOVIES = [
    {
        title: "JUNGLE EXPEDITION",
        image: "/images/movie-current-banners/470wx700h-jungle.jpg",
        tags: [{ text: "T16", className: "bg-yellow-500 text-black" }],
        genre: "Adventure, Action",
        runningTime: 118,
        releaseDate: "Apr 18, 2026",
        description: "Deep in uncharted territory, a rescue team must survive the deadliest jungle on Earth.",
    },
    {
        title: "BẢO VỆ THÀNH CHỦ 3",
        image: "/images/movie-current-banners/470wx700h-bvtc_3.jpg",
        tags: [{ text: "T13", className: "bg-orange-400 text-black" }],
        genre: "Action, Comedy",
        runningTime: 105,
        releaseDate: "Apr 25, 2026",
        description: "The beloved guardians return for one last stand against a new threat.",
    },
    {
        title: "KOKUHO",
        image: "/images/movie-current-banners/kokuho_470x700.jpg",
        tags: [{ text: "T18", className: "bg-red-600 text-white" }],
        genre: "Thriller, Mystery",
        runningTime: 134,
        releaseDate: "May 2, 2026",
        description: "A detective unravels a century-old conspiracy hidden in the rice fields of Japan.",
    },
    {
        title: "PETS ON A TRAIN",
        image: "/images/movie-current-banners/pets_on_a_train_tet_themed_poster.jpg",
        tags: [{ text: "K", className: "bg-blue-400 text-white" }],
        genre: "Animation, Family, Comedy",
        runningTime: 92,
        releaseDate: "May 9, 2026",
        description: "When their owners leave for vacation, the pets embark on their own cross-country adventure.",
    },
    {
        title: "ĐỔI GIÓ HƯ",
        image: "/images/movie-current-banners/poster_payoff_doi_gio_hu_6.jpg",
        tags: [{ text: "T16", className: "bg-yellow-500 text-black" }],
        genre: "Drama, Romance",
        runningTime: 121,
        releaseDate: "May 16, 2026",
        description: "Two strangers find comfort in each other during a summer that changes everything.",
    },
    {
        title: "TIỆC TẾT",
        image: "/images/movie-current-banners/to_poster_official_tiectet_3x4_fa.jpg",
        tags: [{ text: "T13", className: "bg-orange-400 text-black" }],
        genre: "Comedy, Family",
        runningTime: 109,
        releaseDate: "May 23, 2026",
        description: "A chaotic family reunion spirals into the most unforgettable Tet holiday ever.",
    },
    {
        title: "JANUR",
        image: "/images/movie-current-banners/350x495-janur.jpg",
        tags: [{ text: "T18", className: "bg-red-600 text-white" }],
        genre: "Horror, Thriller",
        runningTime: 97,
        releaseDate: "Jun 6, 2026",
        description: "An ancient curse awakens when a family moves into a house surrounded by palm leaves.",
    },
    {
        title: "MIKURA",
        image: "/images/movie-current-banners/350x495-mikura.jpg",
        tags: [{ text: "T16", className: "bg-yellow-500 text-black" }],
        genre: "Action, Sci-Fi",
        runningTime: 142,
        releaseDate: "Jun 20, 2026",
        description: "In a fractured future, one warrior holds the key to reuniting a broken world.",
    },
];

export default function ComingSoonPage() {
    const router = useRouter();
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <TopBar />
            <Header />

            <main className="flex-grow py-6">
                {/* Breadcrumb */}
                <div className="w-[92%] lg:w-[70%] mx-auto flex items-center gap-2 mb-8 text-sm">
                    <Link href="/homepage" className="hover:text-primary transition-colors flex items-center">
                        <span className="material-symbols-outlined text-[18px]">home</span>
                    </Link>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-500">Movies</span>
                    <span className="text-slate-400">›</span>
                    <span className="font-bold border-b border-primary text-primary">Coming Soon</span>
                </div>

                {/* Title Section */}
                <div className="w-[92%] lg:w-[70%] mx-auto flex items-end justify-between border-b-2 border-slate-900 dark:border-white pb-2 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-normal uppercase tracking-wide m-0 p-0 leading-none">Coming Soon</h1>
                    <div className="flex gap-6">
                        <Link href="/now-showing" className="text-xl sm:text-3xl font-light text-slate-400 dark:text-slate-600 uppercase cursor-pointer hover:text-slate-500 transition-colors">Now Showing</Link>
                    </div>
                </div>

                {/* Movie Grid */}
                <div className="w-[92%] lg:w-[70%] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {MOVIES.map((movie, idx) => (
                        <LTTMovieCard
                            key={idx}
                            {...movie}
                            onViewDetail={() => router.push(`/movie/${100 + idx + 1}`)}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
