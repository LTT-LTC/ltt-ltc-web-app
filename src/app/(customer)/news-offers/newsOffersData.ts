export interface NewsOfferItem {
    id: string;
    slug: string;
    title: string;
    dateLabel: string;
    publishedAt: string;
    banner?: string;
    excerpt: string;
    details: string[];
}

export const NEWS_OFFERS: NewsOfferItem[] = [
    {
        id: "901",
        slug: "summer-combo-week",
        title: "Summer Combo Week",
        dateLabel: "15 Apr 2026",
        publishedAt: "2026-04-15T08:00:00.000Z",
        banner: "/images/banners/980x448_132.png",
        excerpt: "Enjoy discounted popcorn and drinks with selected movie tickets this week.",
        details: [
            "Get up to 30% off selected combo packages during Summer Combo Week.",
            "The promotion applies to eligible theaters and showtimes listed in the app.",
            "Limited quantity offers are available daily until stock runs out.",
        ],
    },
    {
        id: "902",
        slug: "family-day-special",
        title: "Family Day Special",
        dateLabel: "20 Apr 2026",
        publishedAt: "2026-04-20T08:00:00.000Z",
        banner: "/images/banners/980x448-kitkat_1.png",
        excerpt: "Special family bundles and kid-friendly screenings every weekend.",
        details: [
            "Family Day offers include discounted group tickets for selected sessions.",
            "Customers can combine ticket bundles with concession promotions where available.",
            "See theater-specific terms in the booking flow before checkout.",
        ],
    },
    {
        id: "903",
        slug: "member-point-boost",
        title: "Member Point Boost",
        dateLabel: "24 Apr 2026",
        publishedAt: "2026-04-24T08:00:00.000Z",
        banner: "/images/banners/980_x_448_1__3.jpg",
        excerpt: "Earn extra loyalty points when booking through your LTC account.",
        details: [
            "LTC members receive point multipliers on qualifying transactions.",
            "Bonus points are credited automatically after successful ticket confirmation.",
            "Promotion validity and cap limits are shown in your account dashboard.",
        ],
    },
    {
        id: "904",
        slug: "holiday-voucher-drop",
        title: "Holiday Voucher Drop",
        dateLabel: "30 Apr 2026",
        publishedAt: "2026-04-30T08:00:00.000Z",
        banner: "/images/banners/pnj_980x448_1.jpg",
        excerpt: "Claim limited vouchers and apply them to upcoming blockbuster releases.",
        details: [
            "Voucher availability is limited and distributed on a first-come, first-served basis.",
            "Each voucher can only be applied under its assigned campaign terms.",
            "Check expiration dates carefully before confirming your booking.",
        ],
    },
];

export const NEWS_OFFERS_BY_SLUG: Record<string, NewsOfferItem> = NEWS_OFFERS.reduce(
    (acc, item) => ({
        ...acc,
        [item.slug]: item,
    }),
    {} as Record<string, NewsOfferItem>,
);
