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
    const [items, setItems] = useState<GiftCodeOutputDto[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
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
            }
        },
        onError: (err) => toast.error(err.message || "Lỗi tải danh sách"),
    });

    const createMutation = useLTTMutation<GiftCodeOutputDto, CreateGiftCodeInputDto>({
        mutationFn: (body) => giftCodeService.createGiftCodeAsync(body),
        onSuccess: () => {
            toast.success("Tạo mới thành công");
            closeDialog();
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Không thể tạo mã"),
    });

    const updateMutation = useLTTMutation<GiftCodeOutputDto, { id: string; body: UpdateGiftCodeInputDto }>({
        mutationFn: (input) => giftCodeService.updateGiftCodeAsync(input.id, input.body),
        onSuccess: () => {
            toast.success("Cập nhật thành công");
            closeDialog();
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Không thể cập nhật mã"),
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => giftCodeService.deleteGiftCodeAsync(id),
        onSuccess: () => {
            toast.success("Đã xóa mã thành công");
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Không thể xóa mã"),
    });

    const fetchData = () => {
        listMutation.mutation({ page: 1, fetch: 100, keyword: debouncedSearch });
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearch]);

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

    const handleSave = () => {
        if (!form.code.trim()) {
            toast.error("Mã không được để trống");
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
                <h1 className="font-heading text-2xl font-bold">Khuyến mãi & Gift Card</h1>
                <div className="flex gap-2">
                    <LTTButton variant="outline" className="gap-2" onClick={() => openCreate("Fixed")}>
                        <Tag className="h-4 w-4" /> Tạo mã giảm giá
                    </LTTButton>
                    <LTTButton className="gap-2" onClick={() => openCreate("GiftCard")}>
                        <Plus className="h-4 w-4" /> Tạo Gift Card
                    </LTTButton>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder="Tìm kiếm mã..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <LTTButton variant="outline" className="gap-2" onClick={fetchData} loading={listMutation.isLoading}>
                    <RefreshCw className="h-4 w-4" /> Làm mới
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <div className="flex border-b border-border-shadcn bg-muted-shadcn/50 px-4 pt-3">
                    <button
                        type="button"
                        className={cn(
                            "mr-4 border-b-2 px-1 pb-3 text-sm font-semibold",
                            activeTab === "promotions" ? "border-primary-shadcn text-primary-shadcn" : "border-transparent text-muted-foreground-shadcn",
                        )}
                        onClick={() => setActiveTab("promotions")}
                    >
                        Mã khuyến mãi
                    </button>
                    <button
                        type="button"
                        className={cn(
                            "border-b-2 px-1 pb-3 text-sm font-semibold",
                            activeTab === "giftcards" ? "border-primary-shadcn text-primary-shadcn" : "border-transparent text-muted-foreground-shadcn",
                        )}
                        onClick={() => setActiveTab("giftcards")}
                    >
                        Gift Cards
                    </button>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">Mã</th>
                            <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                            <th className="px-4 py-3 text-right font-semibold">Giảm giá</th>
                            <th className="px-4 py-3 text-left font-semibold">Hiệu lực</th>
                            <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                            <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-muted-foreground-shadcn">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-muted-foreground-shadcn">
                                    Chưa có dữ liệu.
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold text-primary-shadcn">{item.code}</td>
                                    <td className="px-4 py-3 text-xs">{item.description || "—"}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600">{getDiscountLabel(item)}</td>
                                    <td className="px-4 py-3 text-[10px]">
                                        {item.startDate?.split("T")[0]} → {item.endDate?.split("T")[0]}
                                    </td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={cn("text-[10px]", (item.status || "").toLowerCase() === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                            {item.status || "—"}
                                        </LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTConfirmDialog
                                                title="Xác nhận xóa"
                                                description="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                                                confirmText="Xóa"
                                                cancelText="Hủy"
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

            <LTTDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <LTTDialogContent className="sm:max-w-2xl p-0 gap-0 grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] sm:max-h-[90vh]">
                    <LTTDialogHeader className="px-6 pt-6 pb-4 border-b border-border-shadcn">
                        <LTTDialogTitle>{editing ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}</LTTDialogTitle>
                        <LTTDialogDescription>
                            {editing ? "Cập nhật thông tin gift code hoặc mã khuyến mãi." : "Tạo mới mã giảm giá hoặc gift card."}
                        </LTTDialogDescription>
                    </LTTDialogHeader>
                    <div className="overflow-y-auto px-6 py-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <LTTLabel>Mã *</LTTLabel>
                                <LTTInput value={form.code} onChange={(e) => { setIsDirty(true); setForm({ ...form, code: e.target.value }); }} />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <LTTLabel>Mô tả</LTTLabel>
                                <LTTInput value={form.description} onChange={(e) => { setIsDirty(true); setForm({ ...form, description: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Loại</LTTLabel>
                                <LTTSelect value={form.discountType} onValueChange={(value) => { setIsDirty(true); setForm({ ...form, discountType: value }); }}>
                                    <LTTSelectTrigger>
                                        <LTTSelectValue placeholder="Chọn loại" />
                                    </LTTSelectTrigger>
                                    <LTTSelectContent>
                                        <LTTSelectItem value="Percentage">Giảm %</LTTSelectItem>
                                        <LTTSelectItem value="Fixed">Giảm cố định</LTTSelectItem>
                                        <LTTSelectItem value="GiftCard">Gift Card</LTTSelectItem>
                                    </LTTSelectContent>
                                </LTTSelect>
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Giá trị</LTTLabel>
                                <LTTInput type="number" value={form.discountValue} onChange={(e) => { setIsDirty(true); setForm({ ...form, discountValue: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Đơn tối thiểu</LTTLabel>
                                <LTTInput type="number" value={form.minOrderAmount} onChange={(e) => { setIsDirty(true); setForm({ ...form, minOrderAmount: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Giới hạn sử dụng</LTTLabel>
                                <LTTInput type="number" value={form.usageLimit} onChange={(e) => { setIsDirty(true); setForm({ ...form, usageLimit: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Giới hạn mỗi khách</LTTLabel>
                                <LTTInput type="number" value={form.perUserLimit} onChange={(e) => { setIsDirty(true); setForm({ ...form, perUserLimit: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Ngày bắt đầu</LTTLabel>
                                <LTTInput type="date" value={form.startDate} onChange={(e) => { setIsDirty(true); setForm({ ...form, startDate: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Ngày kết thúc</LTTLabel>
                                <LTTInput type="date" value={form.endDate} onChange={(e) => { setIsDirty(true); setForm({ ...form, endDate: e.target.value }); }} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Trạng thái</LTTLabel>
                                <LTTSelect value={form.status} onValueChange={(value) => { setIsDirty(true); setForm({ ...form, status: value }); }}>
                                    <LTTSelectTrigger>
                                        <LTTSelectValue placeholder="Chọn trạng thái" />
                                    </LTTSelectTrigger>
                                    <LTTSelectContent>
                                        <LTTSelectItem value="Draft">Bản nháp</LTTSelectItem>
                                        <LTTSelectItem value="Active">Đang chạy</LTTSelectItem>
                                        <LTTSelectItem value="Expired">Hết hạn</LTTSelectItem>
                                    </LTTSelectContent>
                                </LTTSelect>
                            </div>
                        </div>
                    </div>
                    <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
                        <LTTButton variant="outline" onClick={() => handleDialogOpenChange(false)}>Hủy</LTTButton>
                        <LTTButton onClick={handleSave} loading={createMutation.isLoading || updateMutation.isLoading}>
                            {editing ? "Lưu" : "Tạo mới"}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>

            <LTTUnsavedChangesDialog
                open={exitConfirmOpen}
                onOpenChange={setExitConfirmOpen}
                title="Bạn có thay đổi chưa lưu"
                messageBefore="Bạn có thay đổi chưa hoàn tất. Thoát sẽ"
                messageHighlight="xóa toàn bộ nội dung đang nhập"
                messageAfter="Bạn có chắc chắn muốn thoát?"
                stayText="Ở lại chỉnh sửa"
                exitText="Thoát"
                onExit={closeDialog}
            />
        </div>
    );
}