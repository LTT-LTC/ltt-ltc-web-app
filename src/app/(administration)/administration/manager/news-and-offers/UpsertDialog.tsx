"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { 
    LTTDialog, 
    LTTDialogContent, 
    LTTDialogHeader, 
    LTTDialogTitle, 
    LTTDialogDescription,
    LTTDialogFooter 
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import {
    LTTSelect,
    LTTSelectContent,
    LTTSelectItem,
    LTTSelectTrigger,
    LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { NewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";
import { CreateNewsAndOffersInputDto, UpdateNewsAndOffersInputDto } from "@/src/services/administration-service/news-and-offers/models/input.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import {
    managerNewsAndOffersService as newsAndOffersService,
    CreateNewsAndOffersFormInput,
    UpdateNewsAndOffersFormInput,
} from "@/src/services/administration-service/manager/news-and-offers/news-and-offers.service";
import { toast } from "sonner";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import LTTUnsavedChangesDialog from "@/src/@core/component/LTTUnsavedChangesDialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: NewsAndOffersOutputDto | null;
    onSuccess: () => void;
}

type NewsStatus = "active" | "inactive" | "ended";
type ApplyScope = "all" | "current";

const todayDate = () => new Date().toISOString().split("T")[0];

const deriveStatus = (item: NewsAndOffersOutputDto | null): NewsStatus => {
    if (!item) return "active";
    if (item.isActive) return "active";
    const end = item.endDate ? new Date(item.endDate) : null;
    if (end && end.getTime() < Date.now()) return "ended";
    return "inactive";
};

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
    const [status, setStatus] = useState<NewsStatus>("active");
    const [applyScope, setApplyScope] = useState<ApplyScope>("all");
    const [isDirty, setIsDirty] = useState(false);
    const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
    const [posterImageFile, setPosterImageFile] = useState<File | null>(null);
    const [posterPreviewUrl, setPosterPreviewUrl] = useState("");

    useEffect(() => {
        if (editingItem) {
            setForm({
                title: editingItem.title,
                content: editingItem.content,
                startDate: editingItem.startDate ? editingItem.startDate.split("T")[0] : "",
                endDate: editingItem.endDate ? editingItem.endDate.split("T")[0] : "",
                posterUrl: editingItem.posterUrl || "",
                cinemaId: editingItem.cinemaId
            });
            setStatus(deriveStatus(editingItem));
            setApplyScope(editingItem.cinemaId ? "current" : "all");
            setPosterImageFile(null);
            setPosterPreviewUrl(editingItem.posterUrl || "");
        } else {
            setForm({
                title: "",
                content: "",
                startDate: "",
                endDate: "",
                posterUrl: "",
                cinemaId: undefined
            });
            setStatus("active");
            setApplyScope("all");
            setPosterImageFile(null);
            setPosterPreviewUrl("");
        }
        setIsDirty(false);
        setExitConfirmOpen(false);
    }, [editingItem, open]);

    const createMutation = useLTTMutation<any, CreateNewsAndOffersFormInput>({
        mutationFn: (input) => newsAndOffersService.createNewsAndOffersAsync(input),
        onSuccess: () => {
            toast.success(t("admin.news_and_offers.create_success"));
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || t("admin.news_and_offers.create_error"))
    });

    const updateMutation = useLTTMutation<any, { id: string, body: UpdateNewsAndOffersFormInput }>({
        mutationFn: (input) => newsAndOffersService.updateNewsAndOffersAsync(input.id, input.body),
        onSuccess: () => {
            toast.success(t("admin.news_and_offers.update_success"));
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || t("admin.news_and_offers.update_error"))
    });

    const handleSave = () => {
        if (!form.title?.trim()) return toast.error(t("admin.news_and_offers.validation.title_required"));
        if (!form.content?.trim()) return toast.error(t("admin.news_and_offers.validation.content_required"));
        if (!form.startDate || !form.endDate) return toast.error("Start date and end date are required.");
        if (new Date(form.startDate).getTime() > new Date(form.endDate).getTime()) {
            return toast.error("Start date cannot be after end date.");
        }
        if (!posterPreviewUrl && !posterImageFile) {
            return toast.error("Poster image is required.");
        }
        if (applyScope === "current" && !form.cinemaId && !editingItem?.cinemaId) {
            return toast.error("Cannot resolve current cinema for this post.");
        }

        const isActive = status === "active";
        const normalizedEndDate = status === "ended" ? todayDate() : form.endDate;

        const payload = {
            ...form,
            endDate: normalizedEndDate,
            cinemaId: applyScope === "all" ? undefined : (form.cinemaId || editingItem?.cinemaId),
            isActive,
            posterUrl: posterImageFile ? "" : form.posterUrl,
            imageFile: posterImageFile || undefined,
        };
        
        if (editingItem) {
            updateMutation.mutation({
                id: editingItem.id,
                body: payload
            });
        } else {
            createMutation.mutation(payload);
        }
    };

    const closeDialog = () => {
        setExitConfirmOpen(false);
        setIsDirty(false);
        onOpenChange(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            onOpenChange(true);
            return;
        }
        if (isDirty) {
            setExitConfirmOpen(true);
            return;
        }
        closeDialog();
    };

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    return (
        <LTTDialog open={open} onOpenChange={handleOpenChange}>
            <LTTDialogContent className="sm:max-w-[820px] p-0 gap-0 grid-rows-[auto_minmax(0,1fr)_auto] max-h-[88vh] sm:max-h-[88vh]">
                <LTTDialogHeader>
                    <div className="px-6 pt-6 pb-4 border-b border-border-shadcn">
                        <LTTDialogTitle>{editingItem ? t("admin.news_and_offers.form.edit_title") : t("admin.news_and_offers.form.create_title")}</LTTDialogTitle>
                        <LTTDialogDescription>Tạo tin tức hoặc khuyến mãi để hiển thị cho khách hàng.</LTTDialogDescription>
                    </div>
                </LTTDialogHeader>
                
                <div className="overflow-y-auto px-6 py-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <LTTLabel>Poster Image *</LTTLabel>
                            <div className="mx-auto w-[92%]">
                                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border-2 border-dashed border-border-shadcn bg-muted-shadcn/40">
                                    {posterPreviewUrl ? (
                                        <img src={posterPreviewUrl} alt="Poster preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground-shadcn">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-shadcn/10 text-primary-shadcn">
                                                <ImagePlus className="h-5 w-5" />
                                            </div>
                                            <span>Click or drag image here</span>
                                            <span className="text-[11px] opacity-80">PNG, JPG (max 5MB)</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setPosterImageFile(file);
                                            setPosterPreviewUrl(URL.createObjectURL(file));
                                            setForm((prev) => ({ ...prev, posterUrl: "" }));
                                            setIsDirty(true);
                                        }}
                                    />
                                </div>
                                {posterPreviewUrl && (
                                    <div className="mt-2 flex justify-end">
                                        <LTTButton
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() => {
                                                setPosterImageFile(null);
                                                setPosterPreviewUrl("");
                                                setForm((prev) => ({ ...prev, posterUrl: "" }));
                                                setIsDirty(true);
                                            }}
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />
                                            Remove image
                                        </LTTButton>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <LTTLabel htmlFor="title">{t("admin.news_and_offers.form.title")}</LTTLabel>
                                <LTTInput 
                                    id="title" 
                                    value={form.title} 
                                    onChange={e => {
                                        setForm({...form, title: e.target.value});
                                        setIsDirty(true);
                                    }} 
                                />
                            </div>

                            <div className="space-y-2">
                                <LTTLabel htmlFor="content">{t("admin.news_and_offers.form.content")} *</LTTLabel>
                                <textarea
                                    id="content"
                                    className="h-32 w-full resize-none overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={form.content}
                                    onChange={e => {
                                        setForm({...form, content: e.target.value});
                                        setIsDirty(true);
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <LTTLabel htmlFor="startDate">{t("admin.news_and_offers.form.start_date")} *</LTTLabel>
                                    <LTTInput 
                                        id="startDate" 
                                        type="date" 
                                        value={form.startDate} 
                                        onChange={e => {
                                            setForm({...form, startDate: e.target.value});
                                            setIsDirty(true);
                                        }} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <LTTLabel htmlFor="endDate">{t("admin.news_and_offers.form.end_date")} *</LTTLabel>
                                    <LTTInput 
                                        id="endDate" 
                                        type="date" 
                                        value={form.endDate} 
                                        onChange={e => {
                                            setForm({...form, endDate: e.target.value});
                                            setIsDirty(true);
                                        }} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <LTTLabel>{t("admin.news_and_offers.form.active")}</LTTLabel>
                                    <LTTSelect
                                        value={status}
                                        onValueChange={(value) => {
                                            setStatus(value as NewsStatus);
                                            setIsDirty(true);
                                        }}
                                    >
                                        <LTTSelectTrigger>
                                            <LTTSelectValue />
                                        </LTTSelectTrigger>
                                        <LTTSelectContent>
                                            <LTTSelectItem value="active">Active</LTTSelectItem>
                                            <LTTSelectItem value="inactive">Inactive</LTTSelectItem>
                                            <LTTSelectItem value="ended">Ended</LTTSelectItem>
                                        </LTTSelectContent>
                                    </LTTSelect>
                                </div>

                                <div className="space-y-2">
                                    <LTTLabel>Apply to</LTTLabel>
                                    <LTTSelect
                                        value={applyScope}
                                        onValueChange={(value) => {
                                            setApplyScope(value as ApplyScope);
                                            setIsDirty(true);
                                        }}
                                    >
                                        <LTTSelectTrigger>
                                            <LTTSelectValue />
                                        </LTTSelectTrigger>
                                        <LTTSelectContent>
                                            <LTTSelectItem value="all">All cinemas in system</LTTSelectItem>
                                            <LTTSelectItem value="current">Current cinema only</LTTSelectItem>
                                        </LTTSelectContent>
                                    </LTTSelect>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
                    <LTTButton variant="outline" onClick={() => handleOpenChange(false)}>{t("admin.common.delete_confirm.cancel")}</LTTButton>
                    <LTTButton onClick={handleSave} loading={isLoading}>
                        {editingItem ? t("admin.news_and_offers.form.save") : t("admin.news_and_offers.form.create")}
                    </LTTButton>
                </LTTDialogFooter>
            </LTTDialogContent>
            <LTTUnsavedChangesDialog
                open={exitConfirmOpen}
                onOpenChange={setExitConfirmOpen}
                title={t("admin.common.unsaved_changes_dialog.title")}
                messageBefore={t("admin.common.unsaved_changes_dialog.message_before")}
                messageHighlight={t("admin.common.unsaved_changes_dialog.message_highlight")}
                messageAfter={t("admin.common.unsaved_changes_dialog.message_after")}
                stayText={t("admin.common.unsaved_changes_dialog.stay")}
                exitText={t("admin.common.unsaved_changes_dialog.exit")}
                onExit={closeDialog}
            />
        </LTTDialog>
    );
}
