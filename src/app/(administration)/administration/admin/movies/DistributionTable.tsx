"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, ShieldCheck } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { 
    LTTDialog, 
    LTTDialogContent, 
    LTTDialogHeader, 
    LTTDialogTitle, 
    LTTDialogFooter 
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import LTTSwitch from "@/src/@core/component/AntD/LTTSwitch";
import { 
    LTTSelect, 
    LTTSelectContent, 
    LTTSelectItem, 
    LTTSelectTrigger, 
    LTTSelectValue 
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { movieService } from "@/src/services/administration-service/movie/movie.service";
import { MovieDistributionOutputDto, MovieOutputDto } from "@/src/services/administration-service/movie/models/output.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";

export default function DistributionTable() {
    const [items, setItems] = useState<MovieDistributionOutputDto[]>([]);
    const [movies, setMovies] = useState<MovieOutputDto[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<MovieDistributionOutputDto | null>(null);
    const [form, setForm] = useState({
        movieId: "",
        licenseStartDate: "",
        licenseEndDate: "",
        isExclusive: false
    });

    const listMutation = useLTTMutation<PagedResultDto<MovieDistributionOutputDto> | undefined, void>({
        mutationFn: () => movieService.getDistributions(),
        onSuccess: (res) => { if (res && res.items) setItems(res.items); },
        onError: (err) => toast.error(err.message || "Lỗi tải danh sách phân phối")
    });

    const moviesMutation = useLTTMutation<PagedResultDto<MovieOutputDto> | undefined, void>({
        mutationFn: () => movieService.getMovieList({ page: 1, fetch: 100 }),
        onSuccess: (res) => { if (res && res.items) setMovies(res.items); }
    });

    const createMutation = useLTTMutation<MovieDistributionOutputDto, any>({
        mutationFn: (body) => movieService.createDistribution(body),
        onSuccess: () => {
            toast.success("Đã thêm bản ghi phân phối");
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi thêm")
    });

    const updateMutation = useLTTMutation<MovieDistributionOutputDto, { id: string, body: any }>({
        mutationFn: (input) => movieService.updateDistribution(input.id, input.body),
        onSuccess: () => {
            toast.success("Cập nhật thành công");
            setDialogOpen(false);
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi cập nhật")
    });

    const deleteMutation = useLTTMutation<void, string>({
        mutationFn: (id) => movieService.deleteDistribution(id),
        onSuccess: () => {
            toast.success("Đã xóa");
            listMutation.mutation();
        },
        onError: (err) => toast.error(err.message || "Lỗi khi xóa")
    });

    useEffect(() => {
        listMutation.mutation();
        moviesMutation.mutation();
    }, []);

    const handleSave = () => {
        if (!form.movieId) return toast.error("Vui lòng chọn phim");
        if (editing) {
            const { movieId, ...body } = form; // Don't update movieId
            updateMutation.mutation({ id: editing.id, body });
        } else {
            createMutation.mutation(form);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ movieId: "", licenseStartDate: "", licenseEndDate: "", isExclusive: false });
        setDialogOpen(true);
    };

    const openEdit = (item: MovieDistributionOutputDto) => {
        setEditing(item);
        setForm({
            movieId: item.movieId,
            startDate: item.startDate ? item.startDate.split('T')[0] : "",
            endDate: item.endDate ? item.endDate.split('T')[0] : "",
            status: item.status
        });
        setDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <LTTButton className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Thêm giấy phép phân phối
                </LTTButton>
            </div>

            <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                            <th className="px-4 py-3 text-left font-semibold">Tên Phim</th>
                            <th className="px-4 py-3 text-left font-semibold">Ngày bắt đầu</th>
                            <th className="px-4 py-3 text-left font-semibold">Ngày kết thúc</th>
                            <th className="px-4 py-3 text-left font-semibold">Độc quyền</th>
                            <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                                    {listMutation.isLoading ? "Đang tải dữ liệu..." : "Chưa có bản ghi phân phối nào."}
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{item.movieTitle}</td>
                                    <td className="px-4 py-3 text-xs">
                                        {item.licenseStartDate ? new Date(item.licenseStartDate).toLocaleDateString("vi-VN") : "---"}
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        {item.licenseEndDate ? new Date(item.licenseEndDate).toLocaleDateString("vi-VN") : "---"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.isExclusive ? (
                                            <LTTBadge className="bg-yellow-100 text-yellow-800 border-yellow-200">Độc quyền</LTTBadge>
                                        ) : (
                                            <LTTBadge variant="outline">Phổ thông</LTTBadge>
                                        )}
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
                <LTTDialogContent className="sm:max-w-md">
                    <LTTDialogHeader>
                        <LTTDialogTitle>{editing ? "Sửa giấy phép" : "Thêm giấy phép mới"}</LTTDialogTitle>
                    </LTTDialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <LTTLabel>Chọn phim *</LTTLabel>
                            <LTTSelect 
                                value={form.movieId} 
                                onValueChange={(v) => setForm({...form, movieId: v})}
                                disabled={!!editing}
                            >
                                <LTTSelectTrigger>
                                    <LTTSelectValue placeholder="Chọn phim từ danh sách" />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    {movies.map(m => (
                                        <LTTSelectItem key={m.id} value={m.id}>{m.title}</LTTSelectItem>
                                    ))}
                                </LTTSelectContent>
                            </LTTSelect>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <LTTLabel>Ngày bắt đầu</LTTLabel>
                                <LTTInput type="date" value={form.licenseStartDate} onChange={e => setForm({...form, licenseStartDate: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <LTTLabel>Ngày kết thúc</LTTLabel>
                                <LTTInput type="date" value={form.licenseEndDate} onChange={e => setForm({...form, licenseEndDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <LTTSwitch 
                                checked={form.isExclusive} 
                                onCheckedChange={(v) => setForm({...form, isExclusive: v})} 
                            />
                            <LTTLabel>Phân phối độc quyền</LTTLabel>
                        </div>
                    </div>
                    <LTTDialogFooter>
                        <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>Hủy</LTTButton>
                        <LTTButton onClick={handleSave} loading={createMutation.isLoading || updateMutation.isLoading}>
                            {editing ? "Lưu thay đổi" : "Cấp phép"}
                        </LTTButton>
                    </LTTDialogFooter>
                </LTTDialogContent>
            </LTTDialog>
        </div>
    );
}
