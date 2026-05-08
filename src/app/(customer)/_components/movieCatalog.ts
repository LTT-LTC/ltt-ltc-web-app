"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { customerMovieService } from "@/src/services/customer-service/movie/movie.service";
import { MovieOutputDto } from "@/src/services/customer-service/movie/models/output.model";

export type MovieSectionStatus = "now_showing" | "coming_soon";

export const MOVIE_PAGE_SIZE = 10;

const FALLBACK_POSTERS = [
    "/images/movie-current-banners/470x700-straykids.jpg",
    "/images/movie-current-banners/470x700-us.jpg",
    "/images/movie-current-banners/470wx700h-jungle.jpg",
    "/images/movie-current-banners/kokuho_470x700.jpg",
    "/images/movie-current-banners/dsic_theatricalposters_kv_us_ca_vie_1080x1600.jpg",
    "/images/movie-current-banners/nh_ba_t_i_m_t_ph_ng_poster_-_kc_m_ng_1_t_t_2026.jpg",
    "/images/movie-current-banners/main_condtct_cinema_low.jpg",
    "/images/movie-current-banners/nh_m_nh_i_th_i_poster_cgv.jpg",
    "/images/movie-current-banners/pets_on_a_train_tet_themed_poster.jpg",
    "/images/movie-current-banners/poster_payoff_doi_gio_hu_6.jpg",
];

export interface MovieCardItem {
    id: string;
    title: string;
    image: string;
    tags: Array<{ text: string; className: string }>;
    description?: string;
    genre?: string;
    runningTime?: number;
    releaseDate?: string;
    trailerUrl?: string;
}

export const normalizeMovieStatus = (status?: string): MovieSectionStatus | "ended" => {
    const normalized = (status || "coming_soon").trim().toLowerCase().replace(/[-\s]+/g, "_");

    if (normalized === "now_showing") return "now_showing";
    if (normalized === "coming_soon") return "coming_soon";
    if (normalized === "ended") return "ended";
    return "coming_soon";
};

export const formatMovieDate = (value?: string, language = "vi") => {
    if (!value) return "";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const locale = language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN";

    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(parsed);
};

export const getMoviePoster = (posterUrl: string | undefined, fallbackIndex: number) => {
    if (posterUrl) {
        return posterUrl;
    }

    return FALLBACK_POSTERS[fallbackIndex % FALLBACK_POSTERS.length];
};

export const getRatingTagClass = (ratingCode?: string) => {
    const normalized = ratingCode?.trim().toUpperCase();

    switch (normalized) {
        case "P":
        case "G":
            return "bg-green-600 text-white";
        case "T13":
        case "PG-13":
            return "bg-yellow-500 text-slate-900";
        case "T16":
        case "PG":
            return "bg-orange-500 text-white";
        case "T18":
        case "R":
        case "NC-17":
            return "bg-red-600 text-white";
        default:
            return "bg-primary text-white";
    }
};

export const buildMovieCardItem = (movie: MovieOutputDto, fallbackIndex: number, language = "vi"): MovieCardItem => {
    const genres = movie.genreNames ?? movie.genres?.map((genre) => genre.name) ?? [];
    const ratingCode = movie.ratingCode?.trim();
    const releaseDate = formatMovieDate(movie.releaseDate || movie.premiereDate, language);

    return {
        id: movie.id,
        title: getLocalizedMovieTitle(movie, language),
        image: getMoviePoster(movie.posterUrl, fallbackIndex),
        tags: ratingCode
            ? [{ text: ratingCode, className: getRatingTagClass(ratingCode) }]
            : [],
        description: movie.description || undefined,
        genre: genres.join(", ") || undefined,
        runningTime: movie.durationMins,
        releaseDate,
        trailerUrl: movie.trailerUrl || undefined,
    };
};

export function getLocalizedMovieTitle(
    movie: Pick<MovieOutputDto, "title" | "originalTitle">,
    language = "vi",
) {
    const normalizedLanguage = language.toLowerCase();
    const vietnameseTitle = movie.title?.trim();
    const englishTitle = movie.originalTitle?.trim();

    if (normalizedLanguage.startsWith("en")) {
        return englishTitle || vietnameseTitle || "";
    }

    return vietnameseTitle || englishTitle || "";
}

export const useMovieCatalog = () => {
    const [movies, setMovies] = useState<MovieOutputDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMovies = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await customerMovieService.getMovieListAsync({ page: 1, fetch: 1000 });
            setMovies(response.items ?? []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load movies";
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadMovies();
    }, [loadMovies]);

    const nowShowingMovies = useMemo(
        () => movies.filter((movie) => normalizeMovieStatus(movie.status) === "now_showing"),
        [movies],
    );

    const comingSoonMovies = useMemo(
        () => movies.filter((movie) => normalizeMovieStatus(movie.status) === "coming_soon"),
        [movies],
    );

    return {
        movies,
        nowShowingMovies,
        comingSoonMovies,
        isLoading,
        error,
        reloadMovies: loadMovies,
    };
};

export const useMovieCatalogSection = (
    status: MovieSectionStatus,
    page: number,
    fetch: number = MOVIE_PAGE_SIZE,
) => {
    const [movies, setMovies] = useState<MovieOutputDto[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMovies = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await customerMovieService.getMovieListAsync({
                page,
                fetch,
                status,
            });
            setMovies(response.items ?? []);
            setTotalCount(response.totalCount ?? 0);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load movies";
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [fetch, page, status]);

    useEffect(() => {
        void loadMovies();
    }, [loadMovies]);

    return {
        movies,
        totalCount,
        isLoading,
        error,
        reloadMovies: loadMovies,
    };
};
