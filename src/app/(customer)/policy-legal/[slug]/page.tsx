"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import StaticInfoPage from "../../_components/StaticInfoPage";
import { POLICY_LEGAL_NAV_ITEMS, POLICY_LEGAL_PAGES } from "../../_components/footerInfoData";

export default function PolicyLegalInfoPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const pageContent = POLICY_LEGAL_PAGES[slug];

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
            sideNavTitle="POLICY & LEGAL"
            sideNavItems={POLICY_LEGAL_NAV_ITEMS}
            activeNavHref={`/policy-legal/${slug}`}
        />
    );
}
