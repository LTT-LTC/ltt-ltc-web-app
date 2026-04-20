"use client";

import { useState } from "react";
import {
    LTTTabs,
    LTTTabsContent,
    LTTTabsList,
    LTTTabsTrigger
} from "@/src/@core/component/LTTShadcnUI/LTTTabs";
import GenreTab from "./GenreTab";
import ActorTab from "./ActorTab";
import StudioTab from "./StudioTab";
import FormatTab from "./FormatTab";
import RoleTab from "./RoleTab";
import RatingTab from "./RatingTab";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export default function MovieMetadataPage() {
    const [tab, setTab] = useState("genres");
    const { t } = useLocalization();

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">{t("admin.movie_metadata.title")}</h1>
            </div>

            <LTTTabs value={tab} onValueChange={setTab}>
                <LTTTabsList className="bg-muted-shadcn/50 mb-4 inline-flex flex-wrap h-auto p-1">
                    <LTTTabsTrigger value="genres">{t("admin.movie_metadata.tabs.genres")}</LTTTabsTrigger>
                    <LTTTabsTrigger value="actors">{t("admin.movie_metadata.tabs.actors")}</LTTTabsTrigger>
                    <LTTTabsTrigger value="roles">{t("admin.movie_metadata.tabs.roles")}</LTTTabsTrigger>
                    <LTTTabsTrigger value="studios">{t("admin.movie_metadata.tabs.studios")}</LTTTabsTrigger>
                    <LTTTabsTrigger value="formats">{t("admin.movie_metadata.tabs.formats")}</LTTTabsTrigger>
                    <LTTTabsTrigger value="ratings">{t("admin.movie_metadata.tabs.ratings")}</LTTTabsTrigger>
                </LTTTabsList>

                <LTTTabsContent value="genres">
                    <GenreTab />
                </LTTTabsContent>
                <LTTTabsContent value="actors">
                    <ActorTab />
                </LTTTabsContent>
                <LTTTabsContent value="roles">
                    <RoleTab />
                </LTTTabsContent>
                <LTTTabsContent value="studios">
                    <StudioTab />
                </LTTTabsContent>
                <LTTTabsContent value="formats">
                    <FormatTab />
                </LTTTabsContent>
                <LTTTabsContent value="ratings">
                    <RatingTab />
                </LTTTabsContent>
            </LTTTabs>
        </div>
    );
}
