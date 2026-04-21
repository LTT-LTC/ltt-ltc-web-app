"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { getHeroNewsBannersMutation } from "@/src/mutations/customer-content/getHeroNewsBanners.mutation";
import { CustomerNewsOfferOutputDto } from "@/src/services/customer-service/content/models/output.model";

const Hero: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const { mutation, data } = useLTTMutation<CustomerNewsOfferOutputDto[], { limit: number }>({
        mutationFn: getHeroNewsBannersMutation,
    });

    const banners = data ?? [];

    const next = useCallback(() => {
        if (banners.length === 0) return;
        setCurrent((prev) => (prev + 1) % banners.length);
    }, [banners.length]);

    const prev = useCallback(() => {
        if (banners.length === 0) return;
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    }, [banners.length]);

    useEffect(() => {
        mutation({ limit: 6 });
    }, []);

    useEffect(() => {
        if (current >= banners.length && banners.length > 0) {
            setCurrent(0);
        }
    }, [banners.length, current]);

    useEffect(() => {
        if (isHovered || banners.length <= 1) return;
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [isHovered, next, banners.length]);

    if (banners.length === 0) {
        return null;
    }

    return (
        <section className="w-full flex justify-center px-4 lg:px-0 py-4 sm:py-6 bg-background-light dark:bg-background-dark">
            <div
                className="relative w-full lg:w-[70%] overflow-hidden rounded-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Slides */}
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {banners.map((item, index) => (
                        <Link
                            key={item.id}
                            href={`/news-offers/${item.id}`}
                            className="w-full flex-shrink-0 relative aspect-[980/448] block"
                        >
                            <Image
                                src={item.banner}
                                alt={item.title}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        </Link>
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
                    {banners.map((item, index) => (
                        <button
                            key={item.id}
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
