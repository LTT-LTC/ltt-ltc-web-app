"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import NewsAndOffersTable from "./Table";

export default function NewsAndOffersPage() {
    const [search, setSearch] = useState("");
    // TODO: Add dialog state for create/edit

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">Tin tức & Ưu đãi</h1>
                <LTTButton className="gap-2">
                    <Plus className="h-4 w-4" /> Thêm mới
                </LTTButton>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder="Tìm kiếm tin tức hoặc ưu đãi..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {/* Future: bulk actions here */}
            </div>

            <NewsAndOffersTable search={search} />
        </div>
    );
}
