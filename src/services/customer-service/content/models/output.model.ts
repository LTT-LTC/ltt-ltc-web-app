import { MovieTag } from "@/src/@core/component/LTTMovieCard";

export type CustomerMovieOutputDto = {
    id: string;
    title: string;
    image: string;
    tags: MovieTag[];
    description: string;
    genre: string;
    trailerYoutubeId: string;
};

export type CustomerNewsOfferOutputDto = {
    id: string;
    slug: string;
    title: string;
    dateLabel: string;
    publishedAt: string;
    banner: string;
    excerpt: string;
    details: string[];
};
