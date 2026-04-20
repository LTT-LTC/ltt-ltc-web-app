"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LTTMovieCard from "@/src/@core/component/LTTMovieCard";
import { useLocalization } from "@/src/@core/hooks/use-localization";

// Placeholder data — will be replaced by BE service fetch (input.models / output.models)
const movies = [
    {
        title: "Stray Kids: dominATE",
        image: "/images/movie-current-banners/470x700-straykids.jpg",
        tags: [
            { text: "T13", className: "bg-primary text-white" },
        ],
        description: "Stray Kids mang đến trải nghiệm âm nhạc đỉnh cao trên màn ảnh rộng.",
        genre: "Âm nhạc • 06.03.2026"
    },
    {
        title: "Không Còn Chúng Ta",
        image: "/images/movie-current-banners/470x700-us.jpg",
        tags: [
            { text: "T18", className: "bg-primary text-white" },
        ],
        description: "Sau này chúng ta sẽ có tất cả, nhưng không còn chúng ta.",
        genre: "Tình cảm, Tâm lý • 06.03.2026"
    },
    {
        title: "Khủng Long Đón Tết",
        image: "/images/movie-current-banners/470wx700h-jungle.jpg",
        tags: [
            { text: "P", className: "bg-green-600 text-white" },
        ],
        description: "Chuyến du lịch rừng xanh ly kỳ nhất dành cho cả nhà ta.",
        genre: "Hoạt hình • 26.02.2026"
    },
    {
        title: "Quốc Bảo",
        image: "/images/movie-current-banners/kokuho_470x700.jpg",
        tags: [
            { text: "T13", className: "bg-primary text-white" },
        ],
        description: "Câu chuyện về di sản văn hóa và niềm tự hào dân tộc.",
        genre: "Tâm lý, Lịch sử • 06.03.2026"
    },
    {
        title: "Thành Guốc Diệt Quỷ: Vô Hạn Thành",
        image: "/images/movie-current-banners/dsic_theatricalposters_kv_us_ca_vie_1080x1600.jpg",
        tags: [
            { text: "T13", className: "bg-primary text-white" },
            { text: "IMAX", className: "bg-yellow-500 text-slate-900" },
        ],
        description: "Khai hỏa trận chiến cuối cùng.",
        genre: "Hoạt hình, Hành động • 20.02.2026"
    },
    {
        title: "Nhà Ba Tôi Một Phòng",
        image: "/images/movie-current-banners/nh_ba_t_i_m_t_ph_ng_poster_-_kc_m_ng_1_t_t_2026.jpg",
        tags: [
            { text: "T13", className: "bg-primary text-white" },
        ],
        description: "Câu chuyện gia đình ấm áp ngày Tết.",
        genre: "Gia đình, Hài • Mùng 1 Tết 2026"
    },
    {
        title: "Cảm Ơn Người Đã Thức Cùng Tôi",
        image: "/images/movie-current-banners/main_condtct_cinema_low.jpg",
        tags: [
            { text: "T18", className: "bg-primary text-white" },
        ],
        description: "Dành tặng tình thân, tình yêu và tình bạn.",
        genre: "Tâm lý, Tình cảm • 27.02.2026"
    },
    {
        title: "Nhà Mình Đi Thôi",
        image: "/images/movie-current-banners/nh_m_nh_i_th_i_poster_cgv.jpg",
        tags: [
            { text: "P", className: "bg-green-600 text-white" },
        ],
        description: "Hành trình vui nhộn của cả gia đình.",
        genre: "Gia đình, Hài • 26.02.2026"
    },
    {
        title: "Biệt Đội Thú Cưng: Cuộc Chiến Trên Đường Ray",
        image: "/images/movie-current-banners/pets_on_a_train_tet_themed_poster.jpg",
        tags: [
            { text: "P", className: "bg-green-600 text-white" },
        ],
        description: "Du xuân cùng cậu mèo — náo nhiệt Tết đỉnh ngo.",
        genre: "Hoạt hình, Phiêu lưu • Mùng 4 Tết 2026"
    },
    {
        title: "Đồi Gió Hú",
        image: "/images/movie-current-banners/poster_payoff_doi_gio_hu_6.jpg",
        tags: [
            { text: "T18", className: "bg-primary text-white" },
        ],
        description: "Chuyện tình bất hủ từ tiểu thuyết kinh điển.",
        genre: "Tình cảm, Cổ điển • 27.02.2026"
    },
];

const PAGE_SIZE = 8;

const MovieSelection: React.FC = () => {
    const { t } = useLocalization();
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
    const totalPages = Math.ceil(movies.length / PAGE_SIZE);

    const currentMovies = useMemo(
        () => movies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
        [page]
    );

    const changePage = useCallback((newPage: number, direction: "left" | "right") => {
        setSlideDirection(direction);
        setAnimating(true);
        setLoading(true);
        setTimeout(() => {
            setPage(newPage);
            setLoading(false);
            setTimeout(() => setAnimating(false), 50);
        }, 300);
    }, []);

    const goNext = () => changePage(Math.min(page + 1, totalPages - 1), "left");
    const goPrev = () => changePage(Math.max(page - 1, 0), "right");

    return (
        <section className="w-[92%] lg:w-[70%] mx-auto py-8 sm:py-16">
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-10 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl">movie_filter</span>
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight uppercase">{t("customer.homepage.movie_selection") || "Movie Selection"}</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide w-full sm:w-auto">
                        <button className="px-4 sm:px-6 py-2 bg-primary text-white font-bold rounded-t-lg text-xs sm:text-sm whitespace-nowrap">{t("customer.homepage.now_showing") || "NOW SHOWING"}</button>
                        <button className="px-4 sm:px-6 py-2 text-slate-500 hover:bg-slate-100 font-bold rounded-t-lg text-xs sm:text-sm whitespace-nowrap">{t("customer.homepage.coming_soon") || "COMING SOON"}</button>
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
                {loading && (
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
                    className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 transition-all duration-300 ease-in-out ${animating
                        ? `opacity-0 ${slideDirection === "left" ? "-translate-x-8" : "translate-x-8"}`
                        : "opacity-100 translate-x-0"
                        }`}
                >
                    {currentMovies.map((movie, index) => (
                        <LTTMovieCard
                            key={page * PAGE_SIZE + index}
                            title={movie.title}
                            image={movie.image}
                            tags={movie.tags}
                            description={movie.description}
                            genre={movie.genre}
                            onViewDetail={() => router.push(`/movie/${page * PAGE_SIZE + index + 1}`)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MovieSelection;
