"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Coffee } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { cinemaAmenityService } from "@/src/services/administration-service/cinema-amenity/cinema-amenity.service";
import { CinemaAmenityOutputDto } from "@/src/services/administration-service/cinema-amenity/models/output.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { cn } from "@/src/@core/utils/cn";
import UpsertAmenityDialog from "./UpsertDialog";

// For now, we assume a fixed cinema context or a way to select it.
// In a manager context, the cinemaId might come from the user's profile/claims.
const TEMP_CINEMA_ID = "00000000-0000-0000-0000-000000000000"; // Placeholder

export default function CinemaAmenitiesPage() {
    const [items, setItems] = useState<CinemaAmenityOutputDto[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CinemaAmenityOutputDto | null>(null);

    const listMutation = useLTTMutation<PagedResultDto<CinemaAmenityOutputDto> | null, { cinemaId: string, params?: any }>({
        mutationFn: (input) => cinemaAmenityService.getCinemaAmenityListAsync(input.cinemaId, input.params),
        onSuccess: (res) => {
            if (res && res.items) setItems(res.items);
        },
        onError: (err) => toast.error(err.message || "Lỗi tải danh sách tiện ích")
    });

    const deleteMutation = useLTTMutation<any, { cinemaId: string, id: string }>({
        mutationFn: (input) => cinemaAmenityService.deleteCinemaAmenityAsync(input.cinemaId, input.id),
        onSuccess: () => {
            toast.success("Đã xóa tiện ích");
            fetchData();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi xóa")
    });

    const loading = listMutation.isLoading || deleteMutation.isLoading;

    const fetchData = () => {
        listMutation.mutation({
            cinemaId: TEMP_CINEMA_ID,
            params: { page: 1, fetch: 100, keyword: debouncedSearch }
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearch]);

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
                <h1 className="font-heading text-2xl font-bold">Tiện ích rạp (Amenities)</h1>
                <LTTButton className="gap-2" onClick={handleCreate}>
                    <Plus className="h-4 w-4" /> Thêm tiện ích
                </LTTButton>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
                    <LTTInput
                        placeholder="Tìm kiếm tiện ích..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">Tên tiện ích</th>
                            <th className="px-4 py-3 text-left font-semibold">Loại</th>
                            <th className="px-4 py-3 text-left font-semibold">Sản phẩm liên kết</th>
                            <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                            <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                                    Đang tải dữ liệu tiện ích...
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                                    Chưa có tiện ích nào được tạo.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <Coffee className="h-4 w-4 text-primary-shadcn" />
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-xs">{item.amenityTypeId}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground-shadcn">
                                        {item.productId || "Không có"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <LTTBadge className={cn(item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
                                            {item.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                                        </LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </LTTButton>
                                            <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutation({ cinemaId: TEMP_CINEMA_ID, id: item.id })}>
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
