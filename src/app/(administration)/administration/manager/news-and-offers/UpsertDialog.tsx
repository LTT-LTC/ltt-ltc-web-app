"use client";

import { useEffect, useState } from "react";
import { 
    LTTDialog, 
    LTTDialogContent, 
    LTTDialogHeader, 
    LTTDialogTitle, 
    LTTDialogFooter 
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import { NewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";
import { CreateNewsAndOffersInputDto, UpdateNewsAndOffersInputDto } from "@/src/services/administration-service/news-and-offers/models/input.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { newsAndOffersService } from "@/src/services/administration-service/news-and-offers/news-and-offers.service";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: NewsAndOffersOutputDto | null;
    onSuccess: () => void;
}

export default function UpsertNewsAndOffersDialog({ open, onOpenChange, editingItem, onSuccess }: Props) {
    const [form, setForm] = useState<CreateNewsAndOffersInputDto>({
        title: "",
        content: "",
        startDate: "",
        endDate: "",
        posterUrl: "",
        cinemaId: undefined
    });
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (editingItem) {
            setForm({
                title: editingItem.title,
                content: editingItem.content,
                startDate: editingItem.startDate ? editingItem.startDate.split("T")[0] : "",
                endDate: editingItem.endDate ? editingItem.endDate.split("T")[0] : "",
                posterUrl: editingItem.posterUrl,
                cinemaId: editingItem.cinemaId
            });
            setIsActive(editingItem.isActive ?? true);
        } else {
            setForm({
                title: "",
                content: "",
                startDate: "",
                endDate: "",
                posterUrl: "",
                cinemaId: undefined
            });
            setIsActive(true);
        }
    }, [editingItem, open]);

    const createMutation = useLTTMutation<any, CreateNewsAndOffersInputDto>({
        mutationFn: (input) => newsAndOffersService.createNewsAndOffersAsync(input),
        onSuccess: () => {
            toast.success("Tạo mới thành công");
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Lỗi khi tạo mới")
    });

    const updateMutation = useLTTMutation<any, { id: string, body: UpdateNewsAndOffersInputDto }>({
        mutationFn: (input) => newsAndOffersService.updateNewsAndOffersAsync(input.id, input.body),
        onSuccess: () => {
            toast.success("Cập nhật thành công");
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Lỗi khi cập nhật")
    });

    const handleSave = () => {
        if (!form.title) return toast.error("Vui lòng nhập tiêu đề");
        
        if (editingItem) {
            updateMutation.mutation({
                id: editingItem.id,
                body: { ...form, isActive }
            });
        } else {
            createMutation.mutation(form);
        }
    };

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    return (
        <LTTDialog open={open} onOpenChange={onOpenChange}>
            <LTTDialogContent className="sm:max-w-[600px]">
                <LTTDialogHeader>
                    <LTTDialogTitle>{editingItem ? "Cập nhật tin tức/ưu đãi" : "Thêm mới tin tức/ưu đãi"}</LTTDialogTitle>
                </LTTDialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <LTTLabel htmlFor="title">Tiêu đề *</LTTLabel>
                        <LTTInput 
                            id="title" 
                            value={form.title} 
                            onChange={e => setForm({...form, title: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <LTTLabel htmlFor="content">Nội dung</LTTLabel>
                        <textarea 
                            id="content"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={form.content} 
                            onChange={e => setForm({...form, content: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <LTTLabel htmlFor="startDate">Ngày bắt đầu</LTTLabel>
                            <LTTInput 
                                id="startDate" 
                                type="date" 
                                value={form.startDate} 
                                onChange={e => setForm({...form, startDate: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel htmlFor="endDate">Ngày kết thúc</LTTLabel>
                            <LTTInput 
                                id="endDate" 
                                type="date" 
                                value={form.endDate} 
                                onChange={e => setForm({...form, endDate: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <LTTLabel htmlFor="poster">Poster URL</LTTLabel>
                        <LTTInput 
                            id="poster" 
                            value={form.posterUrl} 
                            onChange={e => setForm({...form, posterUrl: e.target.value})} 
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <LTTCheckbox id="active" checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} />
                        <LTTLabel htmlFor="active" className="cursor-pointer">Kích hoạt hiển thị</LTTLabel>
                    </div>
                </div>

                <LTTDialogFooter>
                    <LTTButton variant="outline" onClick={() => onOpenChange(false)}>Hủy</LTTButton>
                    <LTTButton onClick={handleSave} loading={isLoading}>
                        {editingItem ? "Lưu thay đổi" : "Tạo mới"}
                    </LTTButton>
                </LTTDialogFooter>
            </LTTDialogContent>
        </LTTDialog>
    );
}
