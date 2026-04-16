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
import { 
    LTTSelect, 
    LTTSelectContent, 
    LTTSelectItem, 
    LTTSelectTrigger, 
    LTTSelectValue 
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { CinemaAmenityOutputDto } from "@/src/services/administration-service/cinema-amenity/models/output.model";
import { CreateCinemaAmenityInputDto, UpdateCinemaAmenityInputDto } from "@/src/services/administration-service/cinema-amenity/models/input.model";
import { AmenityTypeOutputDto } from "@/src/services/administration-service/amenity-type/models/output.model";
import { ProductOutputDto } from "@/src/services/administration-service/product/models/output.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { cinemaAmenityService } from "@/src/services/administration-service/cinema-amenity/cinema-amenity.service";
import { amenityTypeService } from "@/src/services/administration-service/amenity-type/amenity-type.service";
import { productService } from "@/src/services/administration-service/product/product.service";
import { toast } from "sonner";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: CinemaAmenityOutputDto | null;
    cinemaId: string;
    onSuccess: () => void;
}

export default function UpsertAmenityDialog({ open, onOpenChange, editingItem, cinemaId, onSuccess }: Props) {
    const [form, setForm] = useState<CreateCinemaAmenityInputDto>({
        name: "",
        description: "",
        amenityTypeId: "",
        productId: undefined,
        status: "active"
    });
    const [types, setTypes] = useState<AmenityTypeOutputDto[]>([]);
    const [products, setProducts] = useState<ProductOutputDto[]>([]);

    const typesMutation = useLTTMutation<PagedResultDto<AmenityTypeOutputDto> | null, any>({
        mutationFn: () => amenityTypeService.getList(),
        onSuccess: (res) => { if (res && res.items) setTypes(res.items); }
    });

    const productsMutation = useLTTMutation<PagedResultDto<ProductOutputDto> | null, any>({
        mutationFn: () => productService.getProductList({ page: 1, fetch: 100 }),
        onSuccess: (res) => { if (res && res.items) setProducts(res.items); }
    });

    useEffect(() => {
        if (open) {
            typesMutation.mutation({});
            productsMutation.mutation({});
        }
    }, [open]);

    useEffect(() => {
        if (editingItem) {
            setForm({
                name: editingItem.name,
                description: editingItem.description,
                amenityTypeId: editingItem.amenityTypeId,
                productId: editingItem.productId,
                status: editingItem.status
            });
        } else {
            setForm({
                name: "",
                description: "",
                amenityTypeId: "",
                productId: undefined,
                status: "active"
            });
        }
    }, [editingItem, open]);

    const createMutation = useLTTMutation<CinemaAmenityOutputDto | null, { cinemaId: string, body: CreateCinemaAmenityInputDto }>({
        mutationFn: (input) => cinemaAmenityService.create(input.cinemaId, input.body),
        onSuccess: () => {
            toast.success("Tạo mới thành công");
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Lỗi khi tạo mới")
    });

    const updateMutation = useLTTMutation<CinemaAmenityOutputDto | null, { cinemaId: string, id: string, body: UpdateCinemaAmenityInputDto }>({
        mutationFn: (input) => cinemaAmenityService.update(input.cinemaId, input.id, input.body),
        onSuccess: () => {
            toast.success("Cập nhật thành công");
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Lỗi khi cập nhật")
    });

    const handleSave = () => {
        if (!form.name || !form.amenityTypeId) {
            toast.error("Vui lòng điền đủ thông tin bắt buộc");
            return;
        }
        
        if (editingItem) {
            updateMutation.mutation({
                cinemaId,
                id: editingItem.id,
                body: form
            });
        } else {
            createMutation.mutation({
                cinemaId,
                body: form
            });
        }
    };

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    return (
        <LTTDialog open={open} onOpenChange={onOpenChange}>
            <LTTDialogContent className="sm:max-w-[500px]">
                <LTTDialogHeader>
                    <LTTDialogTitle>{editingItem ? "Cập nhật tiện ích" : "Thêm mới tiện ích"}</LTTDialogTitle>
                </LTTDialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <LTTLabel htmlFor="name">Tên tiện ích *</LTTLabel>
                        <LTTInput 
                            id="name" 
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <LTTLabel>Loại tiện ích *</LTTLabel>
                        <LTTSelect 
                            value={form.amenityTypeId} 
                            onValueChange={v => setForm({...form, amenityTypeId: v})}
                        >
                            <LTTSelectTrigger>
                                <LTTSelectValue placeholder="Chọn loại tiện ích" />
                            </LTTSelectTrigger>
                            <LTTSelectContent>
                                {types.map(t => (
                                    <LTTSelectItem key={t.id} value={t.id}>{t.name}</LTTSelectItem>
                                ))}
                            </LTTSelectContent>
                        </LTTSelect>
                    </div>

                    <div className="space-y-2">
                        <LTTLabel>Sản phẩm liên kết</LTTLabel>
                        <LTTSelect 
                            value={form.productId || "none"} 
                            onValueChange={v => setForm({...form, productId: v === "none" ? undefined : v})}
                        >
                            <LTTSelectTrigger>
                                <LTTSelectValue placeholder="Chọn sản phẩm (optional)" />
                            </LTTSelectTrigger>
                            <LTTSelectContent>
                                <LTTSelectItem value="none">Không liên kết</LTTSelectItem>
                                {products.map(p => (
                                    <LTTSelectItem key={p.id} value={p.id}>{p.name}</LTTSelectItem>
                                ))}
                            </LTTSelectContent>
                        </LTTSelect>
                        <p className="text-[10px] text-muted-foreground-shadcn">Tiện ích này sẽ được xử lý như sản phẩm đặc biệt khi bán vé.</p>
                    </div>

                    <div className="space-y-2">
                        <LTTLabel htmlFor="desc">Mô tả</LTTLabel>
                        <LTTInput 
                            id="desc" 
                            value={form.description || ""} 
                            onChange={e => setForm({...form, description: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <LTTLabel>Trạng thái</LTTLabel>
                        <LTTSelect 
                            value={form.status} 
                            onValueChange={v => setForm({...form, status: v})}
                        >
                            <LTTSelectTrigger>
                                <LTTSelectValue />
                            </LTTSelectTrigger>
                            <LTTSelectContent>
                                <LTTSelectItem value="active">Hoạt động</LTTSelectItem>
                                <LTTSelectItem value="inactive">Tạm ngưng</LTTSelectItem>
                            </LTTSelectContent>
                        </LTTSelect>
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
