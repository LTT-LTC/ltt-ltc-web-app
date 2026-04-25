"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsAndOffersService } from "@/src/services/administration-service/news-and-offers/news-and-offers.service";

interface HeroBannerItem {
    image: string;
    newsOfferId?: string;
}

const defaultBanners: HeroBannerItem[] = [
    { image: "/images/banners/980x448-kitkat_1.png" },
    { image: "/images/banners/980x448_132.png" },
    { image: "/images/banners/980x448_8__3.png" },
    { image: "/images/banners/980wx448h_16__3.jpg" },
    { image: "/images/banners/980_x_448_1__3.jpg" },
    { image: "/images/banners/b_n_sao_c_a_980x448_1__1.png" },
    { image: "/images/banners/lny_980_x_448_1.jpg" },
    { image: "/images/banners/pnj_980x448_1.jpg" },
];
const bannerPlaceholder = defaultBanners[0].image;

const Hero: React.FC = () => {
    const [banners, setBanners] = useState<HeroBannerItem[]>(defaultBanners);
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const next = useCallback(() => {
        setCurrent((prev) => {
            if (banners.length === 0) return 0;
            return (prev + 1) % banners.length;
        });
    }, [banners.length]);

    const prev = useCallback(() => {
        setCurrent((prev) => {
            if (banners.length === 0) return 0;
            return (prev - 1 + banners.length) % banners.length;
        });
    }, [banners.length]);

    useEffect(() => {
        if (isHovered || banners.length <= 1) return;
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [isHovered, next, banners.length]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setIsLoading(true);
                const res = await newsAndOffersService.getCustomerActiveNewsAndOffersListAsync({
                    page: 1,
                    fetch: 100,
                    keyword: "",
                });
                const items = res?.items || [];
                const posterBanners: HeroBannerItem[] = items.map((item) => ({
                    image: item.posterUrl && item.posterUrl.trim().length > 0 ? item.posterUrl : bannerPlaceholder,
                    newsOfferId: item.id,
                }));
                setBanners(posterBanners.length > 0 ? posterBanners : defaultBanners);
            } catch {
                setBanners(defaultBanners);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (current >= banners.length) {
            setCurrent(0);
        }
    }, [banners.length, current]);

    return (
        <section className="w-full flex justify-center px-4 lg:px-0 py-4 sm:py-6 bg-background-light dark:bg-background-dark">
            <div
                className="relative w-full lg:w-[70%] overflow-hidden rounded-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {isLoading && (
                    <div className="absolute inset-0 z-20 animate-pulse bg-white/70 dark:bg-black/40 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
                            progress_activity
                        </span>
                    </div>
                )}
                {/* Slides */}
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${banners.length > 0 ? current * 100 : 0}%)` }}
                >
                    {banners.map((banner, index) => (
                        <div key={index} className="w-full flex-shrink-0 relative aspect-[980/448]">
                            {banner.newsOfferId ? (
                                <Link href={`/news-offers/${banner.newsOfferId}`} className="block w-full h-full">
                                    <Image
                                        src={banner.image}
                                        alt={`Banner ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                </Link>
                            ) : (
                                <Image
                                    src={banner.image}
                                    alt={`Banner ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Prev / Next arrows */}
                <button
                    onClick={prev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 size-8 sm:size-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined text-lg sm:text-2xl">chevron_left</span>
                </button>
                <button
                    onClick={next}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 size-8 sm:size-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === current
                                ? "w-8 bg-primary"
                                : "w-2 bg-white/50 hover:bg-white/80"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
