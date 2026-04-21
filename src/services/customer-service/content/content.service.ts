import {
    COMING_SOON_MOVIES,
    NEWS_OFFERS_SOURCE,
    NOW_SHOWING_MOVIES,
} from "./content.mock";
import { CustomerMovieOutputDto, CustomerNewsOfferOutputDto } from "./models/output.model";

const getNowShowingMoviesAsync = async (): Promise<CustomerMovieOutputDto[]> => {
    return Promise.resolve(NOW_SHOWING_MOVIES);
};

const getComingSoonMoviesAsync = async (): Promise<CustomerMovieOutputDto[]> => {
    return Promise.resolve(COMING_SOON_MOVIES);
};

const getNewsOffersAsync = async (): Promise<CustomerNewsOfferOutputDto[]> => {
    return Promise.resolve(NEWS_OFFERS_SOURCE);
};

const getLatestNewsOfferBannersAsync = async (
    limit: number,
): Promise<CustomerNewsOfferOutputDto[]> => {
    const items = [...NEWS_OFFERS_SOURCE].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    return Promise.resolve(items.slice(0, limit));
};

export const customerContentService = {
    getNowShowingMoviesAsync,
    getComingSoonMoviesAsync,
    getNewsOffersAsync,
    getLatestNewsOfferBannersAsync,
};
