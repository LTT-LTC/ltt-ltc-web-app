"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { managerPricingRulesService as pricingRuleService } from "@/src/services/administration-service/manager/pricing-rules/pricing-rules.service";
import { PricingRuleOutputDto } from "@/src/services/administration-service/pricing-rule/models/output.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import UpsertPricingRuleDialog from "./UpsertPricingRuleDialog";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { cinemaService } from "@/src/services/administration-service/cinema/cinema.service";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
const MANAGER_CINEMA_STORAGE_KEY = "managerCinemaId";

const dayLabels: Record<string, string> = {
    MON: "Thứ 2",
    TUE: "Thứ 3",
    WED: "Thứ 4",
    THU: "Thứ 5",
    FRI: "Thứ 6",
    SAT: "Thứ 7",
    SUN: "Chủ nhật",
    ALL: "Tất cả ngày",
};

export default function PricingRulesPage() {
    const { t } = useLocalization();
    const [items, setItems] = useState<PricingRuleOutputDto[]>([]);
    const [search, setSearch] = useState("");
    const [upsertOpen, setUpsertOpen] = useState(false);
    const [editing, setEditing] = useState<PricingRuleOutputDto | null>(null);
    const [cinemaId, setCinemaId] = useState("");
    const [page, setPage] = useState(1);
    const [fetch, setFetch] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const listMutation = useLTTMutation<PagedResultDto<PricingRuleOutputDto>, void>({
        mutationFn: () => pricingRuleService.getPricingRuleListAsync(cinemaId, page, fetch),
        onSuccess: (res) => {
            if (res && res.items) {
                setItems(res.items);
                setTotalCount(res.totalCount);
            }
        },
        onError: (err) => toast.error(err.message || t("admin.pricing_rules.fetch_error"))
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => pricingRuleService.deletePricingRuleAsync(cinemaId, id),
        onSuccess: () => {
            toast.success(t("admin.pricing_rules.delete_success"));
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || t("admin.pricing_rules.delete_error"))
    });

    useEffect(() => {
        const bootstrapCinema = async () => {
            const fromStorage = typeof window !== "undefined" ? localStorage.getItem(MANAGER_CINEMA_STORAGE_KEY) : "";
            if (fromStorage) {
                setCinemaId(fromStorage);
                return;
            }

            const cinemas = await cinemaService.getCinemaListAsync({ page: 1, fetch: 1 });
            const firstCinemaId = cinemas?.items?.[0]?.id || "";
            if (firstCinemaId) {
                setCinemaId(firstCinemaId);
                if (typeof window !== "undefined") {
                    localStorage.setItem(MANAGER_CINEMA_STORAGE_KEY, firstCinemaId);
                }
            }
        };

        bootstrapCinema().catch(() => {
            toast.error(t("admin.pricing_rules.fetch_error"));
        });
    }, [t]);

    useEffect(() => {
        if (cinemaId) {
            listMutation.mutation();
        }
    }, [cinemaId, page, fetch]);

    const filtered = useMemo(() => {
        if (!search) return items;
        const q = search.toLowerCase();
        return items.filter(i =>
            i.seatTypeName?.toLowerCase().includes(q) ||
            i.ruleType.toLowerCase().includes(q)
        );
    }, [items, search]);

    const openCreate = () => {
        setEditing(null);
        setUpsertOpen(true);
    };

    const openEdit = (item: PricingRuleOutputDto) => {
        setEditing(item);
        setUpsertOpen(true);
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">{t("admin.pricing_rules.title")}</h1>
                    <p className="text-sm text-muted-foreground-shadcn">{t("admin.pricing_rules.subtitle")}</p>
                </div>
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> {t("admin.pricing_rules.add")}
                </LTTButton>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder={t("admin.pricing_rules.search_placeholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <LTTButton
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                        if (page !== 1) {
                            setPage(1);
                            return;
                        }
                        listMutation.mutation();
                    }}
                    loading={listMutation.isLoading}
                >
                    <RefreshCw className="h-4 w-4" /> Làm mới
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.pricing_rules.table.seat_type")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.pricing_rules.table.rule_type")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.pricing_rules.table.multiplier")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.pricing_rules.table.time_day")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.pricing_rules.table.priority")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.pricing_rules.table.status")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.pricing_rules.table.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listMutation.isLoading ? (
                            <DomainTableStateRow colSpan={7} state="loading" loadingText={t("admin.common.loading")} />
                        ) : filtered.length === 0 ? (
                            <DomainTableStateRow colSpan={7} state="empty" emptyText={t("admin.pricing_rules.empty")} />
                        ) : (
                            filtered.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        {item.seatTypeName || t("admin.pricing_rules.all_seat_types")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <LTTBadge variant="outline">{item.ruleType}</LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-brand-600">
                                        x{item.multiplier}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground-shadcn">
                                        {(item.daysOfWeek ?? []).length > 0
                                            ? item.daysOfWeek.map((token) => dayLabels[token] ?? token).join(", ")
                                            : t("admin.pricing_rules.every_day")}
                                        {item.startTime && item.endTime && ` (${item.startTime} - ${item.endTime})`}
                                        {(item.validFrom || item.validUntil) &&
                                            ` | ${item.validFrom ? new Date(item.validFrom).toLocaleDateString("vi-VN") : "-"} - ${
                                                item.validUntil ? new Date(item.validUntil).toLocaleDateString("vi-VN") : "-"
                                            }`}
                                    </td>
                                    <td className="px-4 py-3">{item.priority}</td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={item.isActive ? "bg-green-100 text-green-700" : "bg-muted-shadcn text-muted-foreground-shadcn"}>
                                            {item.isActive ? t("admin.common.active") : t("admin.common.inactive")}
                                        </LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTConfirmDialog
                                                title={t("admin.common.delete_confirm.title")}
                                                description={t("admin.pricing_rules.delete_confirm_message")}
                                                confirmText={t("admin.common.delete_confirm.ok")}
                                                cancelText={t("admin.common.delete_confirm.cancel")}
                                                onConfirm={() => deleteMutation.mutation(item.id)}
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

            <UpsertPricingRuleDialog
                open={upsertOpen}
                onOpenChange={setUpsertOpen}
                editingItem={editing}
                onSuccess={() => listMutation.mutation()}
                cinemaId={cinemaId}
            />
        </div>
    );
}
