"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import useDebouncedListQuery from "@/src/@core/hooks/useDebouncedListQuery";
import { customerService } from "@/src/services/customer-service/customer.service";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export default function CustomersPage() {
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmType, setConfirmType] = useState<"lock" | "unlock" | "delete">("lock");

    const fetchData = (keyword: string) => {
        listMutation.mutation({ skipCount: 0, maxResultCount: 100, filter: keyword.trim() });
    };

    const listMutation = useLTTMutation<PagedResultDto<any>, any>({
        mutationFn: (params) => customerService.getCustomerAsync(params),
        onSuccess: (res) => { if (res && res.items) setItems(res.items); },
        onError: (err) => toast.error(err.message || "Lỗi tải danh sách khách hàng")
    });

    const lockMutation = useLTTMutation<void, string>({
        mutationFn: (id) => customerService.lockCustomerAsync(id),
        onSuccess: () => {
            toast.success("Đã khóa tài khoản khách hàng");
            setConfirmOpen(false);
            fetchData(debouncedSearch);
        }
    });

    const unlockMutation = useLTTMutation<void, string>({
        mutationFn: (id) => customerService.unlockCustomerAsync(id),
        onSuccess: () => {
            toast.success("Đã mở khóa tài khoản khách hàng");
            setConfirmOpen(false);
            fetchData(debouncedSearch);
        }
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => customerService.deleteCustomerAsync(id),
        onSuccess: () => {
            toast.success("Đã xóa tài khoản khách hàng");
            setConfirmOpen(false);
            fetchData(debouncedSearch);
        }
    });

    const debouncedSearch = useDebouncedListQuery(
        search,
        (keyword) => {
            fetchData(keyword);
        }
    );

    const handleAction = (customer: any, type: "lock" | "unlock" | "delete") => {
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
                    <h1 className="font-heading text-2xl font-bold">Quản lý khách hàng</h1>
                    <p className="text-sm text-muted-foreground-shadcn">Quản lý danh sách thành viên và trạng thái tài khoản.</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder="Tìm theo tên, email, SĐT..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <LTTButton
                    variant="outline"
                    className="gap-2"
                    onClick={() => fetchData(debouncedSearch)}
                    loading={listMutation.isLoading}
                >
                    <RefreshCw className="h-4 w-4" /> Làm mới
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50 font-semibold">
                            <th className="px-4 py-3">Khách hàng</th>
                            <th className="px-4 py-3">Liên hệ</th>
                            <th className="px-4 py-3">Ngày sinh</th>
                            <th className="px-4 py-3">Giới tính</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-shadcn">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-muted-foreground-shadcn">
                                    {listMutation.isLoading ? "Đang tải dữ liệu..." : "Không tìm thấy khách hàng nào."}
                                </td>
                            </tr>
                        ) : (
                            items.map((c) => (
                                <tr key={c.id} className="hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{c.name}</div>
                                                <div className="text-[10px] text-muted-foreground-shadcn uppercase tracking-wider font-semibold">{c.memberCode || "Member"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1 text-xs text-muted-foreground-shadcn">
                                            <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {c.emailAddress}</div>
                                            <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {c.phoneNumber}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs">{c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString("vi-VN") : "---"}</td>
                                    <td className="px-4 py-3 text-xs">{c.gender || "---"}</td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={c.isLocked ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}>
                                            {c.isLocked ? "Đã khóa" : "Hoạt động"}
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

            <LTTDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <LTTDialogContent className="sm:max-w-sm">
                    <LTTDialogHeader>
                        <LTTDialogTitle>
                            {confirmType === "lock" ? "Xác nhận khóa" : confirmType === "unlock" ? "Xác nhận mở khóa" : "Xác nhận xóa"}
                        </LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground-shadcn">
                            Bạn có chắc chắn muốn {confirmType === "lock" ? "khóa" : confirmType === "unlock" ? "mở khóa" : "xóa vĩnh viễn"} khách hàng <strong>{selectedCustomer?.name}</strong>?
                        </p>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => setConfirmOpen(false)}>Hủy</LTTButton>
                        <LTTButton
                            variant={confirmType === "delete" ? "destructive" : "default"}
                            onClick={confirmAction}
                            loading={lockMutation.isLoading || unlockMutation.isLoading || deleteMutation.isLoading}
                        >
                            Xác nhận
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </div>
    );
}
