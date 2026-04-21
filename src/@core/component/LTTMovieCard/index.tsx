"use client";
import React from "react";
import Image from "next/image";
import LTTTrailerModal from "@/src/@core/component/LTTTrailerModal";

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
    runningTime?: number; // in minutes
    releaseDate?: string;
    rank?: number;
    loading?: boolean;
    trailerYoutubeId?: string;
    onQuickBook?: () => void;
    onViewDetail?: () => void;
}

const LTTMovieCard: React.FC<LTTMovieCardProps> = ({
    title,
    image,
    tags = [],
    description,
    genre,
    runningTime,
    releaseDate,
    rank,
    loading,
    trailerYoutubeId,
    onQuickBook,
    onViewDetail,
}) => {
    const [trailerOpen, setTrailerOpen] = React.useState(false);

    // Determine rank color
    const getRankColor = (r: number) => {
        if (r === 1) return "bg-red-600";
        if (r === 2) return "bg-orange-500";
        if (r === 3) return "bg-blue-500";
        return "bg-slate-500";
    };

    return (
        <div className="group cursor-pointer h-full flex flex-col">
            <div className="relative overflow-hidden aspect-[2/3] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <Image
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={image}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Tags (Top-left) */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className={`${tag.className} text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm`}>
                            {tag.text}
                        </span>
                    ))}
                </div>

                {/* Rank Ribbon (Top-right) */}
                {rank && (
                    <div className="absolute top-0 right-4 z-10 w-8 h-10 flex flex-col items-center">
                        <div className={`${getRankColor(rank)} w-full flex-grow flex items-center justify-center text-white font-black text-lg shadow-md rounded-t-sm z-20 relative`}>
                            {rank}
                            {/* Circle border effect */}
                            <div className="absolute -top-[1px] -right-[1px] -left-[1px] -bottom-[1px] border-2 border-white/20 rounded-t-sm pointer-events-none"></div>
                            <div className="absolute -bottom-1 w-[80%] h-1 bg-black/10 blur-[1px]"></div>
                        </div>
                        {/* Ribbon tail */}
                        <div className={`w-full h-3 relative overflow-hidden`}>
                            <div className={`absolute top-0 left-0 w-1/2 h-full ${getRankColor(rank)} skew-y-12 origin-top-right brightness-90`}></div>
                            <div className={`absolute top-0 right-0 w-1/2 h-full ${getRankColor(rank)} -skew-y-12 origin-top-left brightness-90`}></div>
                        </div>
                        {/* Badge decoration */}
                        {rank <= 3 && (
                            <div className="absolute -top-1 -right-2 transform rotate-12">
                                <div className="bg-yellow-400 text-[8px] font-bold px-1 rounded-sm shadow border border-white text-yellow-900 uppercase tracking-tighter">
                                    Top
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center gap-3">
                    {description && (
                        <p className="text-white text-xs font-medium leading-tight line-clamp-4 mb-2">{description}</p>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!trailerYoutubeId) return;
                            setTrailerOpen(true);
                        }}
                        disabled={!trailerYoutubeId}
                        className="bg-white text-primary px-4 py-2 rounded-full text-xs font-bold w-full uppercase hover:scale-105 transition-transform"
                    >
                        Trailer
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onQuickBook?.(); }}
                        className="bg-white text-primary border border-white px-4 py-2 rounded-full text-xs font-bold w-full uppercase hover:scale-105 transition-transform"
                    >
                        Quick Booking
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetail?.(); }}
                        className="bg-transparent border border-white text-white px-4 py-2 rounded-full text-xs font-bold w-full uppercase hover:bg-white/10 transition-colors"
                    >
                        Detail
                    </button>
                </div>
            </div>
            <div className="pt-3 px-1 flex-grow flex flex-col gap-1">
                <h3 className="font-bold text-base uppercase leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">{title}</h3>

                <div className="mt-auto text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    {genre && (
                        <p className="line-clamp-1"><span className="font-semibold text-slate-700 dark:text-slate-300">Genre:</span> {genre}</p>
                    )}
                    {runningTime && (
                        <p><span className="font-semibold text-slate-700 dark:text-slate-300">Running Time:</span> {runningTime} minutes</p>
                    )}
                    {releaseDate && (
                        <p><span className="font-semibold text-slate-700 dark:text-slate-300">Release date:</span> {releaseDate}</p>
                    )}
                </div>
            </div>

            {trailerYoutubeId ? (
                <LTTTrailerModal
                    open={trailerOpen}
                    onClose={() => setTrailerOpen(false)}
                    trailerYoutubeId={trailerYoutubeId}
                    title={`${title} - Trailer`}
                />
            ) : null}
        </div>
    );
};

export default LTTMovieCard;