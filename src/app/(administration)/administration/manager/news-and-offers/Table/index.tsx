"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Newspaper, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import { managerNewsAndOffersService as newsAndOffersService } from "@/src/services/administration-service/manager/news-and-offers/news-and-offers.service";
import { NewsAndOffersOutputDto, PagedResultNewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";
import { GetListNewsAndOffersInputDto } from "@/src/services/administration-service/news-and-offers/models/input.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { cn } from "@/src/@core/utils/cn";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

interface Props {
    search: string;
    onEdit: (item: NewsAndOffersOutputDto) => void;
}

export default function NewsAndOffersTable({ search, onEdit }: Props) {
    const { t } = useLocalization();
    const [items, setItems] = useState<NewsAndOffersOutputDto[]>([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [fetch, setFetch] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const listMutation = useLTTMutation<PagedResultNewsAndOffersOutputDto | null, GetListNewsAndOffersInputDto>({
        mutationFn: (input) => newsAndOffersService.getNewsAndOffersListAsync(input),
        onSuccess: (res) => {
            if (res && res.items) {
                setItems(res.items);
                setTotalCount(res.totalCount);
            }
        },
        onError: (err) => toast.error(err.message || t("admin.news_and_offers.fetch_error"))
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => newsAndOffersService.deleteNewsAndOffersAsync(id),
        onSuccess: () => {
            toast.success(t("admin.news_and_offers.delete_success"));
            fetchData();
        },
        onError: (err) => toast.error(err.message || t("admin.news_and_offers.delete_error"))
    });

    const fetchData = () => {
        listMutation.mutation({
            keyword: debouncedSearch,
            page,
            fetch
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearch, page]);

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <LTTButton variant="outline" size="sm" className="gap-2" onClick={fetchData} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> Làm mới
                </LTTButton>
            </div>
            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.news_and_offers.table.title")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.news_and_offers.table.start_date")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.news_and_offers.table.end_date")}</th>
                            <th className="px-4 py-3 text-left font-semibold">{t("admin.news_and_offers.table.status")}</th>
                            <th className="px-4 py-3 text-right font-semibold">{t("admin.news_and_offers.table.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listMutation.isLoading || deleteMutation.isLoading ? (
                            <DomainTableStateRow colSpan={5} state="loading" />
                        ) : items.length === 0 ? (
                            <DomainTableStateRow colSpan={5} state="empty" emptyText={t("admin.news_and_offers.empty")} />
                        ) : (
                            items.map((record) => (
                                <tr key={record.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Newspaper className="h-4 w-4 text-primary-shadcn" />
                                            {record.title}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{record.startDate ? new Date(record.startDate).toLocaleDateString("vi-VN") : "-"}</td>
                                    <td className="px-4 py-3">{record.endDate ? new Date(record.endDate).toLocaleDateString("vi-VN") : "-"}</td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={cn(record.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
                                            {record.isActive ? t("admin.news_and_offers.status.active") : t("admin.news_and_offers.status.inactive")}
                                        </LTTBadge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(record)}
                                                className="h-8 w-8"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTConfirmDialog
                                                title={t("admin.common.delete_confirm.title")}
                                                description={t("admin.news_and_offers.delete_confirm_message")}
                                                confirmText={t("admin.common.delete_confirm.ok")}
                                                cancelText={t("admin.common.delete_confirm.cancel")}
                                                onConfirm={() => deleteMutation.mutation(record.id)}
                                                loading={deleteMutation.isLoading}
                                                trigger={
                                                    <LTTButton
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                    >
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
        </div>
    );
}
