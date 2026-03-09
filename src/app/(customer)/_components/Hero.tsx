"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const banners = [
    "/images/banners/980x448-kitkat_1.png",
    "/images/banners/980x448_132.png",
    "/images/banners/980x448_8__3.png",
    "/images/banners/980wx448h_16__3.jpg",
    "/images/banners/980_x_448_1__3.jpg",
    "/images/banners/b_n_sao_c_a_980x448_1__1.png",
    "/images/banners/lny_980_x_448_1.jpg",
    "/images/banners/pnj_980x448_1.jpg",
];

const Hero: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
    }, []);

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    }, []);

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [isHovered, next]);

    return (
        <section className="w-full flex justify-center py-6 bg-background-light dark:bg-background-dark">
            <div
                className="relative w-[70%] overflow-hidden rounded-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Slides */}
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {banners.map((src, index) => (
                        <div key={index} className="w-full flex-shrink-0 relative aspect-[980/448]">
                            <Image
                                src={src}
                                alt={`Banner ${index + 1}`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    ))}
                </div>

                {/* Prev / Next arrows */}
                <button
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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
