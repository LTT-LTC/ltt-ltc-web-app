"use client";

import { useMemo, useState } from "react";

interface NewsOfferImageProps {
    src?: string;
    alt: string;
    zoomOnHover?: boolean;
}

export default function NewsOfferImage({ src, alt, zoomOnHover = false }: NewsOfferImageProps) {
    const [hasError, setHasError] = useState(false);

    const normalizedSrc = useMemo(() => src?.trim() || "", [src]);
    const showPlaceholder = !normalizedSrc || hasError;

    if (showPlaceholder) {
        return (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-sm">
                    <span className="material-symbols-outlined text-[18px]">image</span>
                    <span>Image unavailable</span>
                </div>
            </div>
        );
    }

    return (
        <img
            src={normalizedSrc}
            alt={alt}
            loading="lazy"
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 ${zoomOnHover ? "group-hover:scale-105" : ""}`}
        />
    );
}
