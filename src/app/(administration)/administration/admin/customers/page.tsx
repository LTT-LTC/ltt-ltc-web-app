"use client";

import { useEffect, useState } from "react";
import { Search, User, Lock, Unlock, Trash2, Mail, Phone, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogHeader,
    LTTDialogTitle,
    LTTDialogFooter
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import {
    LTTSelect,
    LTTSelectContent,
    LTTSelectItem,
    LTTSelectTrigger,
    LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { customerService } from "@/src/services/administration-service/customer/customer.service";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { GetCustomerListInputDto } from "@/src/services/administration-service/customer/models/input.model";
import { CustomerOutputDto } from "@/src/services/administration-service/customer/models/output.model";

export default function CustomersPage() {
    const { t, currentLanguage } = useLocalization();
    const [items, setItems] = useState<CustomerOutputDto[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerOutputDto | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmType, setConfirmType] = useState<"lock" | "unlock" | "delete">("lock");

    const fetchData = () => {
        listMutation.mutation({
            skipCount: (page - 1) * pageSize,
            maxResultCount: pageSize,
            filter: debouncedSearch.trim()
        });
    };

    const listMutation = useLTTMutation<PagedResultDto<CustomerOutputDto>, GetCustomerListInputDto>({
        mutationFn: (params) => customerService.getCustomerListAsync(params),
        onSuccess: (res) => {
            if (res && res.items) {
                setItems(res.items);
                setTotalCount(res.totalCount || res.items.length);
            }
        },
        onError: (err) => toast.error(err.message || t("admin.customer_management.fetch_error"))
    });

    const lockMutation = useLTTMutation<void, string>({
        mutationFn: (id) => customerService.lockCustomerAsync(id),
        onSuccess: () => {
            toast.success(t("admin.customer_management.action_success.lock"));
            setConfirmOpen(false);
            fetchData();
        }
    });

    const unlockMutation = useLTTMutation<void, string>({
        mutationFn: (id) => customerService.unlockCustomerAsync(id),
        onSuccess: () => {
            toast.success(t("admin.customer_management.action_success.unlock"));
            setConfirmOpen(false);
            fetchData();
        }
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => customerService.deleteCustomerAsync(id),
        onSuccess: () => {
            toast.success(t("admin.customer_management.action_success.delete"));
            setConfirmOpen(false);
            fetchData();
        }
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, debouncedSearch]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const handleAction = (customer: CustomerOutputDto, type: "lock" | "unlock" | "delete") => {
        setSelectedCustomer(customer);
        setConfirmType(type);
        setConfirmOpen(true);
    };

    const confirmAction = () => {
        if (!selectedCustomer) return;
        if (confirmType === "lock") lockMutation.mutation(selectedCustomer.id);
        else if (confirmType === "unlock") unlockMutation.mutation(selectedCustomer.id);
        else if (confirmType === "delete") deleteMutation.mutation(selectedCustomer.id);
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">{t("admin.customer_management.title")}</h1>
                    <p className="text-sm text-muted-foreground-shadcn">{t("admin.customer_management.subtitle")}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder={t("admin.customer_management.search_placeholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <LTTButton
                    variant="outline"
                    className="gap-2"
                    onClick={fetchData}
                    loading={listMutation.isLoading}
                >
                    <RefreshCw className="h-4 w-4" /> {t("admin.customer_management.refresh")}
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50 font-semibold">
                            <th className="px-4 py-3">{t("admin.customer_management.table.index")}</th>
                            <th className="px-4 py-3">{t("admin.customer_management.table.customer")}</th>
                            <th className="px-4 py-3">{t("admin.customer_management.table.contact")}</th>
                            <th className="px-4 py-3">{t("admin.customer_management.table.birthday")}</th>
                            <th className="px-4 py-3">{t("admin.customer_management.table.gender")}</th>
                            <th className="px-4 py-3">{t("admin.customer_management.table.status")}</th>
                            <th className="px-4 py-3 text-right">{t("admin.customer_management.table.actions")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-shadcn">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-muted-foreground-shadcn">
                                    {listMutation.isLoading ? t("admin.customer_management.loading") : t("admin.customer_management.empty")}
                                </td>
                            </tr>
                        ) : (
                            items.map((c, idx) => (
                                <tr key={c.id} className="hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 text-muted-foreground-shadcn">
                                        {(page - 1) * pageSize + idx + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{c.name}</div>
                                                <div className="text-[10px] text-muted-foreground-shadcn uppercase tracking-wider font-semibold">{c.memberCode || t("admin.customer_management.member_fallback")}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1 text-xs text-muted-foreground-shadcn">
                                            <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {c.emailAddress}</div>
                                            <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {c.phoneNumber}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs">{c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString(currentLanguage === "en" ? "en-US" : "vi-VN") : "---"}</td>
                                    <td className="px-4 py-3 text-xs">{c.gender || "---"}</td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={c.isLocked ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}>
                                            {c.isLocked ? t("admin.customer_management.status.locked") : t("admin.customer_management.status.active")}
                                        </LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            {c.isLocked ? (
                                                <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleAction(c, "unlock")}>
                                                    <Unlock className="w-4 h-4" />
                                                </LTTButton>
                                            ) : (
                                                <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-orange-600" onClick={() => handleAction(c, "lock")}>
                                                    <Lock className="w-4 h-4" />
                                                </LTTButton>
                                            )}
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleAction(c, "delete")}>
                                                <Trash2 className="w-4 h-4" />
                                            </LTTButton>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border-shadcn bg-card px-4 py-3 my-3">
                <div className="text-sm text-muted-foreground-shadcn">
                    {t("admin.customer_management.total_customers", { count: totalCount })}
                </div>
                <div className="flex items-center gap-2">
                    <LTTSelect value={String(pageSize)} onValueChange={(value) => {
                        setPage(1);
                        setPageSize(Number(value));
                    }}>
                        <LTTSelectTrigger className="w-24">
                            <LTTSelectValue />
                        </LTTSelectTrigger>
                        <LTTSelectContent>
                            <LTTSelectItem value="10">10</LTTSelectItem>
                            <LTTSelectItem value="20">20</LTTSelectItem>
                            <LTTSelectItem value="50">50</LTTSelectItem>
                        </LTTSelectContent>
                    </LTTSelect>
                    <LTTButton
                        variant="outline"
                        onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                        disabled={page === 1 || listMutation.isLoading}
                    >
                        {t("admin.customer_management.previous")}
                    </LTTButton>
                    <span className="text-sm">{t("admin.customer_management.page", { page, totalPages })}</span>
                    <LTTButton
                        variant="outline"
                        onClick={() => setPage((currentPage) => currentPage + 1)}
                        disabled={page >= totalPages || listMutation.isLoading}
                    >
                        {t("admin.customer_management.next")}
                    </LTTButton>
                </div>
            </div>

            <LTTDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader>
                        <LTTDialogTitle>
                            {confirmType === "lock" ? t("admin.customer_management.confirm.title_lock") : confirmType === "unlock" ? t("admin.customer_management.confirm.title_unlock") : t("admin.customer_management.confirm.title_delete")}
                        </LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground-shadcn">
                            {confirmType === "lock"
                                ? t("admin.customer_management.confirm.message_lock", { name: selectedCustomer?.name })
                                : confirmType === "unlock"
                                    ? t("admin.customer_management.confirm.message_unlock", { name: selectedCustomer?.name })
                                    : t("admin.customer_management.confirm.message_delete", { name: selectedCustomer?.name })}
                        </p>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => setConfirmOpen(false)}>{t("admin.customer_management.confirm.cancel")}</LTTButton>
                        <LTTButton
                            variant={confirmType === "delete" ? "destructive" : "default"}
                            onClick={confirmAction}
                            loading={lockMutation.isLoading || unlockMutation.isLoading || deleteMutation.isLoading}
                        >
                            {t("admin.customer_management.confirm.confirm")}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </div>
    );
}
