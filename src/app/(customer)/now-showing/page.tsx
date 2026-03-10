"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "../_components/TopBar";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTMovieCard from "@/src/@core/component/LTTMovieCard";

// Mock Data matching the image
const MOVIES = [
    {
        title: "TÀI",
        image: "/images/movie-current-banners/470x700-straykids.jpg", // Placeholder
        tags: [{ text: "T16", className: "bg-yellow-500 text-black" }],
        rank: 1,
        genre: "Action, Drama, Family",
        runningTime: 101,
        releaseDate: "Mar 6, 2026",
        description: "A gripping tale of family and redemption."
    },
    {
        title: "THỎ ƠI!!",
        image: "/images/movie-current-banners/470x700-us.jpg", // Placeholder
        tags: [{ text: "T18", className: "bg-red-600 text-white" }],
        rank: 2,
        genre: "Drama",
        runningTime: 127,
        releaseDate: "Feb 17, 2026",
        description: "An emotional journey through love and loss."
    },
    {
        title: "A LITTLE DREAM OF ME",
        image: "/images/movie-current-banners/nh_ba_t_i_m_t_ph_ng_poster_-_kc_m_ng_1_t_t_2026.jpg", // Placeholder
        tags: [{ text: "K", className: "bg-blue-400 text-white" }],
        rank: 3,
        genre: "Family, Romance",
        runningTime: 137,
        releaseDate: "Feb 27, 2026",
        description: "Dreams come true in the most unexpected ways."
    },
    {
        title: "A GIFT FROM HEAVEN",
        image: "/images/movie-current-banners/nh_m_nh_i_th_i_poster_cgv.jpg", // Placeholder
        tags: [{ text: "K", className: "bg-blue-400 text-white" }],
        rank: 4,
        genre: "Comedy, Family, Romance",
        runningTime: 124,
        releaseDate: "Feb 17, 2026",
        description: "Laughter and joy for the whole family."
    },
];

export default function NowShowingPage() {
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
                    <span className="font-bold border-b border-primary text-primary">Now Showing</span>
                </div>

                {/* Title Section */}
                <div className="w-[92%] lg:w-[70%] mx-auto flex items-end justify-between border-b-2 border-slate-900 dark:border-white pb-2 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-normal uppercase tracking-wide m-0 p-0 leading-none">Now Showing</h1>
                    <div className="flex gap-6">
                        <Link href="/coming-soon" className="text-xl sm:text-3xl font-light text-slate-400 dark:text-slate-600 uppercase cursor-pointer hover:text-slate-500 transition-colors">Coming Soon</Link>
                    </div>
                </div>

                {/* Movie Grid */}
                <div className="w-[92%] lg:w-[70%] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {MOVIES.map((movie, idx) => (
                        <LTTMovieCard
                            key={idx}
                            {...movie}
                            rank={movie.rank <= 3 ? movie.rank : undefined}
                            onViewDetail={() => router.push(`/movie/${idx + 1}`)}
                        />
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}