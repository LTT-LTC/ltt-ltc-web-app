"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTInput";
import { 
    LTTDialog, 
    LTTDialogContent, 
    LTTDialogHeader, 
    LTTDialogTitle, 
    LTTDialogFooter 
} from "@/src/@core/component/LTTDialog";
import { LTTLabel } from "@/src/@core/component/LTTLabel";
import { movieService } from "@/src/services/administration-service/movie/movie.service";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { LTTBadge } from "@/src/@core/component/LTTBadge";

export default function RatingTab() {
    const [items, setItems] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ code: "", name: "", description: "" });

    const listMutation = useLTTMutation<PagedResultDto<any> | undefined, void>({
        mutationFn: () => movieService.getRatings(),
        onSuccess: (res) => { if (res && res.items) setItems(res.items); },
        onError: (err) => toast.error(err.message || "Lỗi tải danh sách phân loại tuổi")
    });

    const createMutation = useLTTMutation<any, any>({
        mutationFn: (body) => movieService.createRating(body),
        onSuccess: () => {
            toast.success("Thêm thành công");
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi thêm")
    });

    const updateMutation = useLTTMutation<any, { id: string, body: any }>({
        mutationFn: (input) => movieService.updateRating(input.id, input.body),
        onSuccess: () => {
            toast.success("Cập nhật thành công");
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi cập nhật")
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => movieService.deleteRating(id),
        onSuccess: () => {
            toast.success("Đã xóa");
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi xóa")
    });

    useEffect(() => {
        listMutation.mutation();
    }, []);

    const handleSave = () => {
        if (!form.code.trim() || !form.name.trim()) return toast.error("Vui lòng nhập mã và tên");
        if (editing) {
            updateMutation.mutation({ id: editing.id, body: form });
        } else {
            createMutation.mutation(form);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ code: "", name: "", description: "" });
        setDialogOpen(true);
    };

    const openEdit = (item: any) => {
        setEditing(item);
        setForm({ code: item.code, name: item.name, description: item.description || "" });
        setDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Thêm phân loại
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold w-24">Mã</th>
                            <th className="px-4 py-3 text-left font-semibold">Tên phân loại (P, T13, T16, T18...)</th>
                            <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                            <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-muted-foreground-shadcn">
                                    Không có dữ liệu phân loại.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-bold text-primary-shadcn">
                                        <LTTBadge className="bg-brand-600 text-white border-brand-700">{item.code}</LTTBadge>
                                    </td>
                                    <td className="px-4 py-3 font-medium flex items-center gap-2 pt-4">
                                        <ShieldCheck className="h-4 w-4 text-brand-500" />
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">{item.description}</td>
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

            <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <LTTDialogContent>
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editing ? "Sửa phân loại" : "Thêm phân loại mới"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <LTTLabel htmlFor="code">Mã (VD: T18) *</LTTLabel>
                                <LTTInput id="code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel htmlFor="name">Tên hiển thị *</LTTLabel>
                                <LTTInput id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel htmlFor="desc">Mô tả (Dành cho khán giả từ...)</LTTLabel>
                            <textarea 
                                id="desc"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={form.description} 
                                onChange={e => setForm({...form, description: e.target.value})} 
                            />
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>Hủy</LTTButton>
                        <LTTButton onClick={handleSave} loading={createMutation.isLoading || updateMutation.isLoading}>
                            {editing ? "Lưu" : "Tạo mới"}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </div>
    );
}
