"use client";

import { useRef, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
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
    const genresRef = useRef<{ openCreate: () => void; refresh: () => void }>(null);
    const actorsRef = useRef<{ openCreate: () => void; refresh: () => void }>(null);
    const rolesRef = useRef<{ openCreate: () => void; refresh: () => void }>(null);
    const studiosRef = useRef<{ openCreate: () => void; refresh: () => void }>(null);
    const formatsRef = useRef<{ openCreate: () => void; refresh: () => void }>(null);
    const ratingsRef = useRef<{ openCreate: () => void; refresh: () => void }>(null);

    const getActiveActions = () => {
        switch (tab) {
            case "actors":
                return actorsRef.current;
            case "roles":
                return rolesRef.current;
            case "studios":
                return studiosRef.current;
            case "formats":
                return formatsRef.current;
            case "ratings":
                return ratingsRef.current;
            default:
                return genresRef.current;
        }
    };

    const getCreateLabel = () => {
        switch (tab) {
            case "actors":
                return t("admin.movie_metadata.actors.add");
            case "roles":
                return t("admin.movie_metadata.roles.add");
            case "studios":
                return t("admin.movie_metadata.studios.add");
            case "formats":
                return t("admin.movie_metadata.formats.add");
            case "ratings":
                return t("admin.movie_metadata.ratings.add");
            default:
                return t("admin.movie_metadata.genres.add");
        }
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">{t("admin.movie_metadata.title")}</h1>
                <LTTButton className="gap-2" onClick={() => getActiveActions()?.openCreate()}>
                    <Plus className="h-4 w-4" /> {getCreateLabel()}
                </LTTButton>
            </div>

            <LTTTabs value={tab} onValueChange={setTab}>
                <div className="mb-4 flex items-center gap-2 mt-2">
                    <LTTTabsList className="bg-muted-shadcn/50 inline-flex flex-wrap h-auto p-1">
                        <LTTTabsTrigger value="genres">{t("admin.movie_metadata.tabs.genres")}</LTTTabsTrigger>
                        <LTTTabsTrigger value="actors">{t("admin.movie_metadata.tabs.actors")}</LTTTabsTrigger>
                        <LTTTabsTrigger value="roles">{t("admin.movie_metadata.tabs.roles")}</LTTTabsTrigger>
                        <LTTTabsTrigger value="studios">{t("admin.movie_metadata.tabs.studios")}</LTTTabsTrigger>
                        <LTTTabsTrigger value="formats">{t("admin.movie_metadata.tabs.formats")}</LTTTabsTrigger>
                        <LTTTabsTrigger value="ratings">{t("admin.movie_metadata.tabs.ratings")}</LTTTabsTrigger>
                    </LTTTabsList>
                    <LTTButton variant="outline" className="gap-2" onClick={() => getActiveActions()?.refresh()}>
                        <RefreshCw className="h-4 w-4" /> {t("admin.movie_metadata.common.refresh")}
                    </LTTButton>
                </div>

                <LTTTabsContent value="genres">
                    <GenreTab ref={genresRef} />
                </LTTTabsContent>
                <LTTTabsContent value="actors">
                    <ActorTab ref={actorsRef} />
                </LTTTabsContent>
                <LTTTabsContent value="roles">
                    <RoleTab ref={rolesRef} />
                </LTTTabsContent>
                <LTTTabsContent value="studios">
                    <StudioTab ref={studiosRef} />
                </LTTTabsContent>
                <LTTTabsContent value="formats">
                    <FormatTab ref={formatsRef} />
                </LTTTabsContent>
                <LTTTabsContent value="ratings">
                    <RatingTab ref={ratingsRef} />
                </LTTTabsContent>
            </LTTTabs>
        </div>
    );
}
