"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import NewsAndOffersTable from "./Table";
import UpsertNewsAndOffersDialog from "./UpsertDialog";
import { NewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export default function NewsAndOffersPage() {
    const { t } = useLocalization();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsAndOffersOutputDto | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreate = () => {
        setEditingItem(null);
        setDialogOpen(true);
    };

    const handleEdit = (item: NewsAndOffersOutputDto) => {
        setEditingItem(item);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        setRefreshKey((current) => current + 1);
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">{t("admin.news_and_offers.title")}</h1>
                <LTTButton className="gap-2" onClick={handleCreate}>
                    <Plus className="h-4 w-4" /> {t("admin.news_and_offers.add")}
                </LTTButton>
            </div>
            <NewsAndOffersTable key={refreshKey} onEdit={handleEdit} />

            <UpsertNewsAndOffersDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingItem={editingItem}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
