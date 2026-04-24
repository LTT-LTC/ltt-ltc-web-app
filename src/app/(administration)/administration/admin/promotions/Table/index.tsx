"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Tag, Search, Trash2, RefreshCw, Pencil } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogHeader,
    LTTDialogTitle,
    LTTDialogFooter,
    LTTDialogDescription,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import {
    LTTSelect,
    LTTSelectContent,
    LTTSelectItem,
    LTTSelectTrigger,
    LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import LTTUnsavedChangesDialog from "@/src/@core/component/LTTUnsavedChangesDialog";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { cn } from "@/src/@core/utils/cn";
import { giftCodeService } from "@/src/services/administration-service/gift-code/gift-code.service";
import { GiftCodeOutputDto } from "@/src/services/administration-service/gift-code/models/output.model";
import { CreateGiftCodeInputDto, UpdateGiftCodeInputDto } from "@/src/services/administration-service/gift-code/models/input.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import AdminTablePagination from "../../_components/AdminTablePagination";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

type GiftCodeFormState = {
    code: string;
    description: string;
    discountType: string;
    discountValue: string;
    minOrderAmount: string;
    usageLimit: string;
    perUserLimit: string;
    startDate: string;
    endDate: string;
    status: string;
};

const createEmptyForm = (discountType = "Fixed"): GiftCodeFormState => ({
    code: "",
    description: "",
    discountType,
    discountValue: "0",
    minOrderAmount: "0",
    usageLimit: "100",
    perUserLimit: "1",
    startDate: "",
    endDate: "",
    status: "Draft",
});

export default function PromotionsListPage() {
    const { t } = useLocalization();
    const [items, setItems] = useState<GiftCodeOutputDto[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [activeTab, setActiveTab] = useState("promotions");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [editing, setEditing] = useState<GiftCodeOutputDto | null>(null);
    const [form, setForm] = useState<GiftCodeFormState>(createEmptyForm());

    const listMutation = useLTTMutation<PagedResultDto<GiftCodeOutputDto> | undefined, any>({
        mutationFn: (params) => giftCodeService.getGiftCodeListAsync(params),
        onSuccess: (res) => {
            if (res && res.items) {
                setItems(res.items);
                setTotalCount(res.totalCount || res.items.length);
            }
        },
        onError: (err) => toast.error(err.message || t("admin.promotions_giftcard.fetch_error")),
    });

    const createMutation = useLTTMutation<GiftCodeOutputDto, CreateGiftCodeInputDto>({
        mutationFn: (body) => giftCodeService.createGiftCodeAsync(body),
        onSuccess: () => {
            toast.success(t("admin.promotions_giftcard.toast.create_success"));
            closeDialog();
            fetchData();
        },
        onError: (err) => toast.error(err.message || t("admin.promotions_giftcard.toast.create_error")),
    });

    const updateMutation = useLTTMutation<GiftCodeOutputDto, { id: string; body: UpdateGiftCodeInputDto }>({
        mutationFn: (input) => giftCodeService.updateGiftCodeAsync(input.id, input.body),
        onSuccess: () => {
            toast.success(t("admin.promotions_giftcard.toast.update_success"));
            closeDialog();
            fetchData();
        },
        onError: (err) => toast.error(err.message || t("admin.promotions_giftcard.toast.update_error")),
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => giftCodeService.deleteGiftCodeAsync(id),
        onSuccess: () => {
            toast.success(t("admin.promotions_giftcard.toast.delete_success"));
            fetchData();
        },
        onError: (err) => toast.error(err.message || t("admin.promotions_giftcard.toast.delete_error")),
    });

    const fetchData = () => {
        listMutation.mutation({ page, fetch: pageSize, keyword: debouncedSearch });
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, activeTab]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearch, page, pageSize, activeTab]);

    const visibleItems = useMemo(() => {
        if (activeTab === "giftcards") {
            return items.filter((item) => (item.discountType || "").toLowerCase() === "giftcard");
        }

        return items.filter((item) => (item.discountType || "").toLowerCase() !== "giftcard");
    }, [items, activeTab]);

    const filteredItems = useMemo(() => {
        if (!search) return visibleItems;

        const keyword = search.toLowerCase();
        return visibleItems.filter((item) => item.code.toLowerCase().includes(keyword) || (item.description || "").toLowerCase().includes(keyword));
    }, [search, visibleItems]);

    const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading;

    const closeDialog = () => {
        setDialogOpen(false);
        setExitConfirmOpen(false);
        setIsDirty(false);
        setEditing(null);
        setForm(createEmptyForm());
    };

    const handleDialogOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setDialogOpen(true);
            return;
        }

        if (isDirty) {
            setExitConfirmOpen(true);
            return;
        }

        closeDialog();
    };

    const openCreate = (discountType = "Fixed") => {
        setEditing(null);
        setForm(createEmptyForm(discountType));
        setIsDirty(false);
        setExitConfirmOpen(false);
        setDialogOpen(true);
    };

    const openEdit = (item: GiftCodeOutputDto) => {
        setEditing(item);
        setForm({
            code: item.code || "",
            description: item.description || "",
            discountType: item.discountType || "Fixed",
            discountValue: String(item.discountValue ?? 0),
            minOrderAmount: String(item.minOrderAmount ?? 0),
            usageLimit: String(item.usageLimit ?? 0),
            perUserLimit: String(item.perUserLimit ?? 0),
            startDate: item.startDate ? item.startDate.split("T")[0] : "",
            endDate: item.endDate ? item.endDate.split("T")[0] : "",
            status: item.status || "Draft",
        });
        setIsDirty(false);
        setExitConfirmOpen(false);
        setDialogOpen(true);
    };

    const formatGiftCodeStatus = (status?: string) => {
        const s = (status || "").toLowerCase();
        if (s === "draft") return t("admin.promotions_giftcard.form.status_draft");
        if (s === "active") return t("admin.promotions_giftcard.form.status_active");
        if (s === "expired") return t("admin.promotions_giftcard.form.status_expired");
        return status || t("admin.promotions_giftcard.table.dash");
    };

    const handleSave = () => {
        if (!form.code.trim()) {
            toast.error(t("admin.promotions_giftcard.toast.code_required"));
            return;
        }

        const payload: CreateGiftCodeInputDto = {
            code: form.code.trim(),
            description: form.description.trim() || undefined,
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            minOrderAmount: Number(form.minOrderAmount),
            usageLimit: Number(form.usageLimit),
            perUserLimit: Number(form.perUserLimit),
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            status: form.status,
        };

        if (editing) {
            updateMutation.mutation({ id: editing.id, body: payload as UpdateGiftCodeInputDto });
        } else {
            createMutation.mutation(payload);
        }
    };

    const getDiscountLabel = (item: GiftCodeOutputDto) => {
        const discountType = (item.discountType || "").toLowerCase();
        if (discountType === "fixed" || discountType === "giftcard") {
            return `${item.discountValue.toLocaleString()}đ`;
        }

        return `${item.discountValue}%`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">{t("admin.promotions_giftcard.title")}</h1>
                <div className="flex gap-2">
                    <LTTButton variant="outline" className="gap-2" onClick={() => openCreate("Fixed")}>
                        <Tag className="h-4 w-4" /> {t("admin.promotions_giftcard.create_discount")}
                    </LTTButton>
                    <LTTButton className="gap-2" onClick={() => openCreate("GiftCard")}>
                        <Plus className="h-4 w-4" /> {t("admin.promotions_giftcard.create_giftcard")}
                    </LTTButton>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder={t("admin.promotions_giftcard.search_placeholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <LTTButton variant="outline" className="gap-2" onClick={fetchData} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> {t("admin.promotions_giftcard.refresh")}
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                <div className="flex border-b border-border-shadcn bg-muted-shadcn/50 px-4 pt-3">
                    <button
                        type="button"
                        className={cn(
                            "mr-4 border-b-2 px-1 pb-3 text-sm font-semibold",
                            activeTab === "promotions" ? "border-primary-shadcn text-primary-shadcn" : "border-transparent text-muted-foreground-shadcn",
                        )}
                        onClick={() => setActiveTab("promotions")}
                    >
                        {t("admin.promotions_giftcard.tab_promotions")}
                    </button>
                    <button
                        type="button"
                        className={cn(
                            "border-b-2 px-1 pb-3 text-sm font-semibold",
                            activeTab === "giftcards" ? "border-primary-shadcn text-primary-shadcn" : "border-transparent text-muted-foreground-shadcn",
                        )}
                        onClick={() => setActiveTab("giftcards")}
                    >
                        {t("admin.promotions_giftcard.tab_giftcards")}
                    </button>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions_giftcard.table.code")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions_giftcard.table.description")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.promotions_giftcard.table.discount")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions_giftcard.table.validity")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions_giftcard.table.status")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.promotions_giftcard.table.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && filteredItems.length === 0 ? (
                            <DomainTableStateRow colSpan={6} state="loading" loadingText={t("admin.promotions_giftcard.loading")} />
                        ) : filteredItems.length === 0 ? (
                            <DomainTableStateRow colSpan={6} state="empty" emptyText={t("admin.promotions_giftcard.empty")} />
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold text-primary-shadcn">{item.code}</td>
                                    <td className="px-4 py-3 text-xs">{item.description || t("admin.promotions_giftcard.table.dash")}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600">{getDiscountLabel(item)}</td>
                                    <td className="px-4 py-3 text-[10px]">
                                        {item.startDate?.split("T")[0]} {t("admin.promotions_giftcard.table.date_range_separator")} {item.endDate?.split("T")[0]}
                                    </td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={cn("text-[10px]", (item.status || "").toLowerCase() === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                            {formatGiftCodeStatus(item.status)}
                                        </LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTConfirmDialog
                                                title={t("admin.promotions_giftcard.confirm_delete.title")}
                                                description={t("admin.promotions_giftcard.confirm_delete.description")}
                                                confirmText={t("admin.common.delete_confirm.ok")}
                                                cancelText={t("admin.common.delete_confirm.cancel")}
                                                onConfirm={() => deleteMutation.mutation(item.id)}
                                                loading={deleteMutation.isLoading}
                                                trigger={
                                                    <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </LTTButton>
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AdminTablePagination
                totalCount={totalCount}
                page={page}
                pageSize={pageSize}
                loading={listMutation.isLoading}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPage(1);
                    setPageSize(size);
                }}
            />

            <LTTDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-2xl p-0 gap-0 grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] sm:max-h-[90vh]">
                    <LTTDialogHeader className="px-6 pt-6 pb-4 border-b border-border-shadcn">
                        <LTTDialogTitle>{editing ? t("admin.promotions_giftcard.dialog.edit_title") : t("admin.promotions_giftcard.dialog.create_title")}</LTTDialogTitle>
                        <LTTDialogDescription>
                            {editing ? t("admin.promotions_giftcard.dialog.edit_description") : t("admin.promotions_giftcard.dialog.create_description")}
                        </LTTDialogDescription>
                    </LTTDialogHeader>
                    <div className="overflow-y-auto px-6 py-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.code")}</LTTLabel>
                                <LTTInput value={form.code} onChange={(e) => { setIsDirty(true); setForm({ ...form, code: e.target.value }); }} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.description")}</LTTLabel>
                                <LTTInput value={form.description} onChange={(e) => { setIsDirty(true); setForm({ ...form, description: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.type")}</LTTLabel>
                                <LTTSelect value={form.discountType} onValueChange={(value) => { setIsDirty(true); setForm({ ...form, discountType: value }); }}>
                                    <LTTSelectTrigger>
                                        <LTTSelectValue placeholder={t("admin.promotions_giftcard.form.type_placeholder")} />
                                    </LTTSelectTrigger>
                                    <LTTSelectContent>
                                        <LTTSelectItem value="Percentage">{t("admin.promotions_giftcard.form.discount_percent")}</LTTSelectItem>
                                        <LTTSelectItem value="Fixed">{t("admin.promotions_giftcard.form.discount_fixed")}</LTTSelectItem>
                                        <LTTSelectItem value="GiftCard">{t("admin.promotions_giftcard.form.giftcard")}</LTTSelectItem>
                                    </LTTSelectContent>
                                </LTTSelect>
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.value")}</LTTLabel>
                                <LTTInput type="number" value={form.discountValue} onChange={(e) => { setIsDirty(true); setForm({ ...form, discountValue: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.min_order")}</LTTLabel>
                                <LTTInput type="number" value={form.minOrderAmount} onChange={(e) => { setIsDirty(true); setForm({ ...form, minOrderAmount: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Giới hạn sử dụng</LTTLabel>
                                <LTTInput type="number" value={form.usageLimit} onChange={(e) => { setIsDirty(true); setForm({ ...form, usageLimit: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.per_user_limit")}</LTTLabel>
                                <LTTInput type="number" value={form.perUserLimit} onChange={(e) => { setIsDirty(true); setForm({ ...form, perUserLimit: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.start_date")}</LTTLabel>
                                <LTTInput type="date" value={form.startDate} onChange={(e) => { setIsDirty(true); setForm({ ...form, startDate: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.end_date")}</LTTLabel>
                                <LTTInput type="date" value={form.endDate} onChange={(e) => { setIsDirty(true); setForm({ ...form, endDate: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>{t("admin.promotions_giftcard.form.status")}</LTTLabel>
                                <LTTSelect value={form.status} onValueChange={(value) => { setIsDirty(true); setForm({ ...form, status: value }); }}>
                                    <LTTSelectTrigger>
                                        <LTTSelectValue placeholder={t("admin.promotions_giftcard.form.status_placeholder")} />
                                    </LTTSelectTrigger>
                                    <LTTSelectContent>
                                        <LTTSelectItem value="Draft">{t("admin.promotions_giftcard.form.status_draft")}</LTTSelectItem>
                                        <LTTSelectItem value="Active">{t("admin.promotions_giftcard.form.status_active")}</LTTSelectItem>
                                        <LTTSelectItem value="Expired">{t("admin.promotions_giftcard.form.status_expired")}</LTTSelectItem>
                                    </LTTSelectContent>
                                </LTTSelect>
                            </div>
                        </div>
                    </div>
                    <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
                        <LTTButton variant="outline" onClick={() => handleDialogOpenChange(false)}>{t("admin.promotions_giftcard.form.cancel")}</LTTButton>
                        <LTTButton onClick={handleSave} loading={createMutation.isLoading || updateMutation.isLoading}>
                            {editing ? t("admin.promotions_giftcard.form.save") : t("admin.promotions_giftcard.form.create")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

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
        </div>
    );
}