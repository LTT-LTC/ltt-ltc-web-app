"use client";

import { useEffect, useState } from "react";
import { 
    LTTDialog, 
    LTTDialogContent, 
    LTTDialogHeader, 
    LTTDialogTitle, 
    LTTDialogFooter 
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import { NewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";
import { CreateNewsAndOffersInputDto, UpdateNewsAndOffersInputDto } from "@/src/services/administration-service/news-and-offers/models/input.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { managerNewsAndOffersService as newsAndOffersService } from "@/src/services/administration-service/manager/news-and-offers/news-and-offers.service";
import { toast } from "sonner";
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: NewsAndOffersOutputDto | null;
    onSuccess: () => void;
}

export default function UpsertNewsAndOffersDialog({ open, onOpenChange, editingItem, onSuccess }: Props) {
    const { t } = useLocalization();
    const [form, setForm] = useState<CreateNewsAndOffersInputDto>({
        title: "",
        content: "",
        startDate: "",
        endDate: "",
        posterUrl: "",
        cinemaId: undefined
    });
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (editingItem) {
            setForm({
                title: editingItem.title,
                content: editingItem.content,
                startDate: editingItem.startDate ? editingItem.startDate.split("T")[0] : "",
                endDate: editingItem.endDate ? editingItem.endDate.split("T")[0] : "",
                posterUrl: editingItem.posterUrl,
                cinemaId: editingItem.cinemaId
            });
            setIsActive(editingItem.isActive ?? true);
        } else {
            setForm({
                title: "",
                content: "",
                startDate: "",
                endDate: "",
                posterUrl: "",
                cinemaId: undefined
            });
            setIsActive(true);
        }
    }, [editingItem, open]);

    const createMutation = useLTTMutation<any, CreateNewsAndOffersInputDto>({
        mutationFn: (input) => newsAndOffersService.createNewsAndOffersAsync(input),
        onSuccess: () => {
            toast.success(t("admin.news_and_offers.create_success"));
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || t("admin.news_and_offers.create_error"))
    });

    const updateMutation = useLTTMutation<any, { id: string, body: UpdateNewsAndOffersInputDto }>({
        mutationFn: (input) => newsAndOffersService.updateNewsAndOffersAsync(input.id, input.body),
        onSuccess: () => {
            toast.success(t("admin.news_and_offers.update_success"));
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || t("admin.news_and_offers.update_error"))
    });

    const handleSave = () => {
        if (!form.title) return toast.error(t("admin.news_and_offers.validation.title_required"));
        
        if (editingItem) {
            updateMutation.mutation({
                id: editingItem.id,
                body: { ...form, isActive }
            });
        } else {
            createMutation.mutation(form);
        }
    };

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    return (
        <LTTDialog open={open} onOpenChange={onOpenChange}>
            <LTTDialogContent className="sm:max-w-[600px]">
                <LTTDialogHeader>
                    <LTTDialogTitle>{editingItem ? t("admin.news_and_offers.form.edit_title") : t("admin.news_and_offers.form.create_title")}</LTTDialogTitle>
                </LTTDialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <LTTLabel htmlFor="title">{t("admin.news_and_offers.form.title")}</LTTLabel>
                        <LTTInput 
                            id="title" 
                            value={form.title} 
                            onChange={e => setForm({...form, title: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <LTTLabel htmlFor="content">{t("admin.news_and_offers.form.content")}</LTTLabel>
                        <textarea 
                            id="content"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={form.content} 
                            onChange={e => setForm({...form, content: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <LTTLabel htmlFor="startDate">{t("admin.news_and_offers.form.start_date")}</LTTLabel>
                            <LTTInput 
                                id="startDate" 
                                type="date" 
                                value={form.startDate} 
                                onChange={e => setForm({...form, startDate: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel htmlFor="endDate">{t("admin.news_and_offers.form.end_date")}</LTTLabel>
                            <LTTInput 
                                id="endDate" 
                                type="date" 
                                value={form.endDate} 
                                onChange={e => setForm({...form, endDate: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <LTTLabel htmlFor="poster">{t("admin.news_and_offers.form.poster_url")}</LTTLabel>
                        <LTTInput 
                            id="poster" 
                            value={form.posterUrl} 
                            onChange={e => setForm({...form, posterUrl: e.target.value})} 
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <LTTCheckbox id="active" checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} />
                        <LTTLabel htmlFor="active" className="cursor-pointer">{t("admin.news_and_offers.form.active")}</LTTLabel>
                    </div>
                </div>

                <LTTDialogFooter>
                    <LTTButton variant="outline" onClick={() => onOpenChange(false)}>{t("admin.common.delete_confirm.cancel")}</LTTButton>
                    <LTTButton onClick={handleSave} loading={isLoading}>
                        {editingItem ? t("admin.news_and_offers.form.save") : t("admin.news_and_offers.form.create")}
                    </LTTButton>
                </LTTDialogFooter>
            </LTTDialogContent>
        </LTTDialog>
    );
}
