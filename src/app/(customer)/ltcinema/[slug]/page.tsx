"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import StaticInfoPage from "../../_components/StaticInfoPage";
import { LTCINEMA_NAV_ITEMS, LTCINEMA_PAGES } from "../../_components/footerInfoData";

export default function LTCinemaInfoPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const pageContent = LTCINEMA_PAGES[slug];

    if (!pageContent) {
        notFound();
    }

    return (
        <StaticInfoPage
            title={pageContent.title}
            description={pageContent.description}
            sections={pageContent.sections}
            backHref="/homepage"
            backLabel="Back to homepage"
            sideNavTitle="LTCINEMA"
            sideNavItems={LTCINEMA_NAV_ITEMS}
            activeNavHref={`/ltcinema/${slug}`}
        />
    );
}
