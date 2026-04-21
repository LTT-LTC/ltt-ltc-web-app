import { NEWS_OFFERS_SOURCE } from "@/src/services/customer-service/content/content.mock";
import { CustomerNewsOfferOutputDto } from "@/src/services/customer-service/content/models/output.model";

export type NewsOfferItem = CustomerNewsOfferOutputDto;

export const NEWS_OFFERS: NewsOfferItem[] = NEWS_OFFERS_SOURCE;

export const NEWS_OFFERS_BY_SLUG: Record<string, NewsOfferItem> = NEWS_OFFERS_SOURCE.reduce(
    (acc, item) => ({
        ...acc,
        [item.slug]: item,
    }),
    {} as Record<string, NewsOfferItem>,
);

export const NEWS_OFFERS_BY_ID: Record<string, NewsOfferItem> = NEWS_OFFERS_SOURCE.reduce(
    (acc, item) => ({
        ...acc,
        [item.id]: item,
    }),
    {} as Record<string, NewsOfferItem>,
);
