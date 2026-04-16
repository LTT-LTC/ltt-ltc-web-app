"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Settings2 } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTInput";
import { LTTCheckbox } from "@/src/@core/component/LTTCheckbox";
import { 
    LTTDialog, 
    LTTDialogContent, 
    LTTDialogHeader, 
    LTTDialogTitle, 
    LTTDialogFooter 
} from "@/src/@core/component/LTTDialog";
import { LTTBadge } from "@/src/@core/component/LTTBadge";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { pricingRuleService } from "@/src/services/administration-service/pricing-rule/pricing-rule.service";
import { PricingRuleOutputDto } from "@/src/services/administration-service/masterdata/models/commercial.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import UpsertPricingRuleDialog from "./UpsertPricingRuleDialog";

const TEMP_CINEMA_ID = "00000000-0000-0000-0000-000000000000";

const dayLabels: Record<number, string> = {
    0: "Chủ nhật",
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
};

export default function PricingRulesPage() {
    const [items, setItems] = useState<PricingRuleOutputDto[]>([]);
    const [search, setSearch] = useState("");
    const [upsertOpen, setUpsertOpen] = useState(false);
    const [editing, setEditing] = useState<PricingRuleOutputDto | null>(null);

    const listMutation = useLTTMutation<PagedResultDto<PricingRuleOutputDto>, void>({
        mutationFn: () => pricingRuleService.getList(TEMP_CINEMA_ID),
        onSuccess: (res) => { if (res && res.items) setItems(res.items); },
        onError: (err) => toast.error(err.message || "Lỗi tải danh sách quy tắc giá")
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => pricingRuleService.delete(TEMP_CINEMA_ID, id),
        onSuccess: () => {
            toast.success("Đã xóa quy tắc giá");
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi xóa")
    });

    useEffect(() => {
        listMutation.mutation();
    }, []);

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
                    <h1 className="font-heading text-2xl font-bold">Quy tắc Giá (Pricing Rules)</h1>
                    <p className="text-sm text-muted-foreground-shadcn">Quản lý hệ số giá theo loại ghế, thời gian và ngày trong tuần.</p>
                </div>
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Thêm quy tắc
                </LTTButton>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder="Tìm theo loại ghế hoặc loại quy tắc..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">Loại ghế</th>
                            <th className="px-4 py-3 text-left font-semibold">Loại quy tắc</th>
                            <th className="px-4 py-3 text-left font-semibold">Hệ số (Multiplier)</th>
                            <th className="px-4 py-3 text-left font-semibold">Thời gian/Thứ</th>
                            <th className="px-4 py-3 text-left font-semibold">Độ ưu tiên</th>
                            <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                            <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-muted-foreground-shadcn">
                                    {listMutation.isLoading ? "Đang tải..." : "Chưa có quy tắc giá nào."}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        {item.seatTypeName || "Áp dụng tất cả"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <LTTBadge variant="outline">{item.ruleType}</LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-brand-600">
                                        x{item.multiplier}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground-shadcn">
                                        {item.dayOfWeek !== undefined ? dayLabels[item.dayOfWeek] : "Hàng ngày"}
                                        {item.startTime && item.endTime && ` (${item.startTime} - ${item.endTime})`}
                                    </td>
                                    <td className="px-4 py-3">{item.priority}</td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={item.isActive ? "bg-green-100 text-green-700" : "bg-muted-shadcn text-muted-foreground-shadcn"}>
                                            {item.isActive ? "Hoạt động" : "Tạm dừng"}
                                        </LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutation(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </LTTButton>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <UpsertPricingRuleDialog 
                open={upsertOpen} 
                onOpenChange={setUpsertOpen} 
                editingItem={editing} 
                onSuccess={() => listMutation.mutation()}
                cinemaId={TEMP_CINEMA_ID}
            />
        </div>
    );
}
