"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Newspaper } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { managerNewsAndOffersService as newsAndOffersService } from "@/src/services/administration-service/manager/news-and-offers/news-and-offers.service";
import { NewsAndOffersOutputDto, PagedResultNewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";
import { GetListNewsAndOffersInputDto } from "@/src/services/administration-service/news-and-offers/models/input.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { cn } from "@/src/@core/utils/cn";
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface Props {
    search: string;
    onEdit: (item: NewsAndOffersOutputDto) => void;
}

export default function NewsAndOffersTable({ search, onEdit }: Props) {
    const { t } = useLocalization();
    const [items, setItems] = useState<NewsAndOffersOutputDto[]>([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const listMutation = useLTTMutation<PagedResultNewsAndOffersOutputDto | null, GetListNewsAndOffersInputDto>({
        mutationFn: (input) => newsAndOffersService.getNewsAndOffersListAsync(input),
        onSuccess: (res) => {
            if (res && res.items) setItems(res.items);
        },
        onError: (err) => toast.error(err.message || t("admin.news_and_offers.fetch_error"))
    });

    const deleteMutation = useLTTMutation<boolean | null, string>({
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
            page: 1,
            fetch: 100
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearch]);

    return (
        <LTTTable
            rowKey="id"
            loading={listMutation.isLoading || deleteMutation.isLoading}
            dataSource={items}
            columns={[
                {
                    title: t("admin.news_and_offers.table.title"),
                    dataIndex: "title",
                    key: "title",
                    render: (text: string, record: NewsAndOffersOutputDto) => (
                        <div className="flex items-center gap-2 font-medium">
                            <Newspaper className="h-4 w-4 text-primary-shadcn" />
                            {text}
                        </div>
                    )
                },
                {
                    title: t("admin.news_and_offers.table.start_date"),
                    dataIndex: "startDate",
                    key: "startDate",
                    render: (v: string) => v ? new Date(v).toLocaleDateString("vi-VN") : "-"
                },
                {
                    title: t("admin.news_and_offers.table.end_date"),
                    dataIndex: "endDate",
                    key: "endDate",
                    render: (v: string) => v ? new Date(v).toLocaleDateString("vi-VN") : "-"
                },
                {
                    title: t("admin.news_and_offers.table.status"),
                    dataIndex: "isActive",
                    key: "isActive",
                    render: (active: boolean) => (
                        <LTTBadge className={cn(active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
                            {active ? t("admin.news_and_offers.status.active") : t("admin.news_and_offers.status.inactive")}
                        </LTTBadge>
                    )
                },
                {
                    title: t("admin.news_and_offers.table.actions"),
                    key: "action",
                    align: "right",
                    render: (_: any, record: NewsAndOffersOutputDto) => (
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
                    )
                }
            ]}
        />
    );
}
