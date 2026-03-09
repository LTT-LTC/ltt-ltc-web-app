"use client";
import React from "react";
import Image from "next/image";

export interface MovieTag {
    text: string;
    className: string;
}

export interface LTTMovieCardProps {
    title: string;
    image: string;
    tags?: MovieTag[];
    description?: string;
    genre?: string;
    loading?: boolean;
    onQuickBook?: () => void;
    onViewDetail?: () => void;
}

const LTTMovieCard: React.FC<LTTMovieCardProps> = ({
    title,
    image,
    tags = [],
    description,
    genre,
    loading,
    onQuickBook,
    onViewDetail,
}) => (
    <div className="group cursor-pointer">
        <div className="relative overflow-hidden aspect-[2/3] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow duration-300">
            <Image
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={image}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className={`${tag.className} text-[10px] font-bold px-2.5 py-1 rounded`}>
                        {tag.text}
                    </span>
                ))}
            </div>
            <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center gap-3 rounded-2xl">
                {description && (
                    <p className="text-white text-xs font-medium leading-tight">{description}</p>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onQuickBook?.(); }}
                    className="bg-white text-primary px-4 py-2 rounded-full text-xs font-bold w-full uppercase"
                >
                    Trailer
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onQuickBook?.(); }}
                    className="bg-white text-primary px-4 py-2 rounded-full text-xs font-bold w-full uppercase"
                >
                    Quick Booking
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onViewDetail?.(); }}
                    className="border border-white text-white px-4 py-2 rounded-full text-xs font-bold w-full uppercase"
                >
                    Detail
                </button>
            </div>
        </div>
        <div className="pt-3 px-1">
            <h3 className="font-bold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
            {genre && <p className="text-slate-400 text-xs">{genre}</p>}
        </div>
    </div>
);

export default LTTMovieCard;
