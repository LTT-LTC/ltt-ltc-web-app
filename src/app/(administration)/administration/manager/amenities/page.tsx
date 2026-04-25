"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Coffee, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { cinemaAmenityService } from "@/src/services/administration-service/cinema-amenity/cinema-amenity.service";
import { CinemaAmenityOutputDto } from "@/src/services/administration-service/cinema-amenity/models/output.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { cn } from "@/src/@core/utils/cn";
import UpsertAmenityDialog from "./UpsertDialog";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";

// For now, we assume a fixed cinema context or a way to select it.
// In a manager context, the cinemaId might come from the user's profile/claims.
const TEMP_CINEMA_ID = "00000000-0000-0000-0000-000000000000"; // Placeholder

export default function CinemaAmenitiesPage() {
    const { t } = useLocalization();
    const [items, setItems] = useState<CinemaAmenityOutputDto[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CinemaAmenityOutputDto | null>(null);
    const [page, setPage] = useState(1);
    const [fetch, setFetch] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const listMutation = useLTTMutation<PagedResultDto<CinemaAmenityOutputDto> | null, { cinemaId: string, params?: any }>({
        mutationFn: (input) => cinemaAmenityService.getCinemaAmenityListAsync(input.cinemaId, input.params),
        onSuccess: (res) => {
            if (res && res.items) {
                setItems(res.items);
                setTotalCount(res.totalCount);
            }
        },
        onError: (err) => toast.error(err.message || t("admin.amenities.fetch_error"))
    });

    const deleteMutation = useLTTMutation<any, { cinemaId: string, id: string }>({
        mutationFn: (input) => cinemaAmenityService.deleteCinemaAmenityAsync(input.cinemaId, input.id),
        onSuccess: () => {
            toast.success(t("admin.amenities.delete_success"));
            fetchData();
        },
        onError: (err) => toast.error(err.message || t("admin.amenities.delete_error"))
    });

    const loading = listMutation.isLoading || deleteMutation.isLoading;

    const fetchData = () => {
        listMutation.mutation({
            cinemaId: TEMP_CINEMA_ID,
            params: { page, fetch, keyword: debouncedSearch || undefined }
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearch, page, fetch]);

    const handleEdit = (item: CinemaAmenityOutputDto) => {
        setEditingItem(item);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold">{t("admin.amenities.title")}</h1>
                <LTTButton className="gap-2" onClick={handleCreate}>
                    <Plus className="h-4 w-4" /> {t("admin.amenities.add")}
                </LTTButton>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder={t("admin.amenities.search_placeholder")}
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9"
                    />
                </div>
                <LTTButton
                    variant="outline"
                    className="gap-2"
                    onClick={fetchData}
                    loading={listMutation.isLoading}
                >
                    <RefreshCw className="h-4 w-4" /> {t("admin.amenities.refresh")}
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.amenities.table.name")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.amenities.table.type")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.amenities.table.linked_product")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.amenities.table.status")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.amenities.table.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <DomainTableStateRow colSpan={5} state="loading" loadingText={t("admin.amenities.loading")} />
                        ) : items.length === 0 ? (
                            <DomainTableStateRow colSpan={5} state="empty" emptyText={t("admin.amenities.empty")} />
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <Coffee className="h-4 w-4 text-primary-shadcn" />
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-xs">{item.amenityTypeId}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground-shadcn">
                                        {item.productId || t("admin.amenities.no_linked_product")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={cn(item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
                                            {item.status === "active" ? t("admin.common.active") : t("admin.common.inactive")}
                                        </LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTConfirmDialog
                                                title={t("admin.common.delete_confirm.title")}
                                                description={t("admin.amenities.delete_confirm_message")}
                                                confirmText={t("admin.common.delete_confirm.ok")}
                                                cancelText={t("admin.common.delete_confirm.cancel")}
                                                onConfirm={() => deleteMutation.mutation({ cinemaId: TEMP_CINEMA_ID, id: item.id })}
                                                loading={deleteMutation.isLoading}
                                                trigger={
                                                    <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
                pageSize={fetch}
                onPageChange={(nextPage) => setPage(nextPage)}
                onPageSizeChange={(nextSize) => {
                    setFetch(nextSize);
                    setPage(1);
                }}
                loading={listMutation.isLoading}
            />

            <UpsertAmenityDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingItem={editingItem}
                cinemaId={TEMP_CINEMA_ID}
                onSuccess={fetchData}
            />
        </div>
    );
}
