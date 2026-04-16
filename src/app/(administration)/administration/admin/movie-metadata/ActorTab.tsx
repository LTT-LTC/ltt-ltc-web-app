"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, User } from "lucide-react";
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
import { ActorOutputDto } from "@/src/services/administration-service/movie/models/output.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export default function ActorTab() {
    const [items, setItems] = useState<ActorOutputDto[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ActorOutputDto | null>(null);
    const [form, setForm] = useState({ name: "", biography: "" });

    const listMutation = useLTTMutation<PagedResultDto<ActorOutputDto> | undefined, void>({
        mutationFn: () => movieService.getActors(),
        onSuccess: (res) => { if (res && res.items) setItems(res.items); },
        onError: (err) => toast.error(err.message || "Lỗi tải danh sách diễn viên")
    });

    const createMutation = useLTTMutation<ActorOutputDto, any>({
        mutationFn: (body) => movieService.createActor(body),
        onSuccess: () => {
            toast.success("Thêm thành công");
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi thêm")
    });

    const updateMutation = useLTTMutation<ActorOutputDto, { id: string, body: any }>({
        mutationFn: (input) => movieService.updateActor(input.id, input.body),
        onSuccess: () => {
            toast.success("Cập nhật thành công");
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi cập nhật")
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => movieService.deleteActor(id),
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
        if (!form.name.trim()) return toast.error("Vui lòng nhập tên");
        if (editing) {
            updateMutation.mutation({ id: editing.id, body: form });
        } else {
            createMutation.mutation(form);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", biography: "" });
        setDialogOpen(true);
    };

    const openEdit = (item: ActorOutputDto) => {
        setEditing(item);
        setForm({ name: item.name, biography: "" });
        setDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Thêm diễn viên
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">Họ tên</th>
                            <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="py-12 text-center text-muted-foreground-shadcn">
                                    Không có dữ liệu diễn viên.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary-shadcn" />
                                        {item.name}
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

            <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <LTTDialogContent>
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editing ? "Sửa diễn viên" : "Thêm diễn viên mới"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <LTTLabel htmlFor="name">Họ tên *</LTTLabel>
                            <LTTInput id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel htmlFor="bio">Tiểu sử</LTTLabel>
                            <textarea 
                                id="bio"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={form.biography} 
                                onChange={e => setForm({...form, biography: e.target.value})} 
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
