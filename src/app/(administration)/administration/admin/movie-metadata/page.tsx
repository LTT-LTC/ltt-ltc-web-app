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

export default function MovieMetadataPage() {
    const [tab, setTab] = useState("genres");

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">Quản lý Metadata Phim</h1>
            </div>

            <LTTTabs value={tab} onValueChange={setTab}>
                <LTTTabsList className="bg-muted-shadcn/50 mb-4 inline-flex flex-wrap h-auto p-1">
                    <LTTTabsTrigger value="genres">Thể loại</LTTTabsTrigger>
                    <LTTTabsTrigger value="actors">Diễn viên</LTTTabsTrigger>
                    <LTTTabsTrigger value="roles">Vai trò</LTTTabsTrigger>
                    <LTTTabsTrigger value="studios">Hãng phim</LTTTabsTrigger>
                    <LTTTabsTrigger value="formats">Định dạng</LTTTabsTrigger>
                    <LTTTabsTrigger value="ratings">Phân loại tuổi</LTTTabsTrigger>
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
