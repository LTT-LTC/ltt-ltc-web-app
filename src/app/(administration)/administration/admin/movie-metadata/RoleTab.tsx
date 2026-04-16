"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
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
import { RoleOutputDto } from "@/src/services/administration-service/movie/models/output.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export default function RoleTab() {
    const [items, setItems] = useState<RoleOutputDto[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<RoleOutputDto | null>(null);
    const [name, setName] = useState("");

    const listMutation = useLTTMutation<PagedResultDto<RoleOutputDto> | undefined, void>({
        mutationFn: () => movieService.getRoles(),
        onSuccess: (res) => { if (res && res.items) setItems(res.items); },
        onError: (err) => toast.error(err.message || "Lỗi tải danh sách vai trò")
    });

    const createMutation = useLTTMutation<RoleOutputDto, { name: string }>({
        mutationFn: (body) => movieService.createRole(body),
        onSuccess: () => {
            toast.success("Thêm thành công");
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi thêm")
    });

    const updateMutation = useLTTMutation<RoleOutputDto, { id: string, name: string }>({
        mutationFn: (input) => movieService.updateRole(input.id, { name: input.name }),
        onSuccess: () => {
            toast.success("Cập nhật thành công");
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi cập nhật")
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => movieService.deleteRole(id),
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
        if (!name.trim()) return toast.error("Vui lòng nhập tên");
        if (editing) {
            updateMutation.mutation({ id: editing.id, name });
        } else {
            createMutation.mutation({ name });
        }
    };

    const openCreate = () => {
        setEditing(null);
        setName("");
        setDialogOpen(true);
    };

    const openEdit = (item: RoleOutputDto) => {
        setEditing(item);
        setName(item.name);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Thêm vai trò
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">Tên vai trò (Đạo diễn, Diễn viên chính...)</th>
                            <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="py-12 text-center text-muted-foreground-shadcn">
                                    Không có dữ liệu vai trò.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-primary-shadcn" />
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
                        <LTTDialogTitle>{editing ? "Sửa vai trò" : "Thêm vai trò mới"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4 space-y-2">
                        <LTTLabel htmlFor="name">Tên vai trò *</LTTLabel>
                        <LTTInput id="name" value={name} onChange={e => setName(e.target.value)} />
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
