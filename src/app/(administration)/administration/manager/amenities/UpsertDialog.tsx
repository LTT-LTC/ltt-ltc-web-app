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
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: CinemaAmenityOutputDto | null;
    cinemaId: string;
    onSuccess: () => void;
}

export default function UpsertAmenityDialog({ open, onOpenChange, editingItem, cinemaId, onSuccess }: Props) {
    const { t } = useLocalization();
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
        mutationFn: () => amenityTypeService.getAmenityTypeAsync(),
        onSuccess: (res) => { if (res && res.items) setTypes(res.items); }
    });

    const productsMutation = useLTTMutation<PagedResultDto<ProductOutputDto> | null, any>({
        mutationFn: () => productService.getProductListAsync({ page: 1, fetch: 100 }),
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
        mutationFn: (input) => cinemaAmenityService.createCinemaAmenityAsync(input.cinemaId, input.body),
        onSuccess: () => {
            toast.success(t("admin.amenities.create_success"));
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || t("admin.amenities.create_error"))
    });

    const updateMutation = useLTTMutation<CinemaAmenityOutputDto | null, { cinemaId: string, id: string, body: UpdateCinemaAmenityInputDto }>({
        mutationFn: (input) => cinemaAmenityService.updateCinemaAmenityAsync(input.cinemaId, input.id, input.body),
        onSuccess: () => {
            toast.success(t("admin.amenities.update_success"));
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || t("admin.amenities.update_error"))
    });

    const handleSave = () => {
        if (!form.name || !form.amenityTypeId) {
            toast.error(t("admin.amenities.validation.required"));
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
                    <LTTDialogTitle>{editingItem ? t("admin.amenities.form.edit_title") : t("admin.amenities.form.create_title")}</LTTDialogTitle>
                </LTTDialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <LTTLabel htmlFor="name">{t("admin.amenities.form.name")}</LTTLabel>
                        <LTTInput 
                            id="name" 
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <LTTLabel>{t("admin.amenities.form.type")}</LTTLabel>
                        <LTTSelect 
                            value={form.amenityTypeId} 
                            onValueChange={v => setForm({...form, amenityTypeId: v})}
                        >
                            <LTTSelectTrigger>
                                <LTTSelectValue placeholder={t("admin.amenities.form.type_placeholder")} />
                            </LTTSelectTrigger>
                            <LTTSelectContent>
                                {types.map(t => (
                                    <LTTSelectItem key={t.id} value={t.id}>{t.name}</LTTSelectItem>
                                ))}
                            </LTTSelectContent>
                        </LTTSelect>
                    </div>

                    <div className="space-y-2">
                        <LTTLabel>{t("admin.amenities.form.linked_product")}</LTTLabel>
                        <LTTSelect 
                            value={form.productId || "none"} 
                            onValueChange={v => setForm({...form, productId: v === "none" ? undefined : v})}
                        >
                            <LTTSelectTrigger>
                                <LTTSelectValue placeholder={t("admin.amenities.form.linked_product_placeholder")} />
                            </LTTSelectTrigger>
                            <LTTSelectContent>
                                <LTTSelectItem value="none">{t("admin.amenities.form.none")}</LTTSelectItem>
                                {products.map(p => (
                                    <LTTSelectItem key={p.id} value={p.id}>{p.name}</LTTSelectItem>
                                ))}
                            </LTTSelectContent>
                        </LTTSelect>
                        <p className="text-[10px] text-muted-foreground-shadcn">{t("admin.amenities.form.linked_product_hint")}</p>
                    </div>

                    <div className="space-y-2">
                        <LTTLabel htmlFor="desc">{t("admin.amenities.form.description")}</LTTLabel>
                        <LTTInput 
                            id="desc" 
                            value={form.description || ""} 
                            onChange={e => setForm({...form, description: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <LTTLabel>{t("admin.amenities.form.status")}</LTTLabel>
                        <LTTSelect 
                            value={form.status} 
                            onValueChange={v => setForm({...form, status: v})}
                        >
                            <LTTSelectTrigger>
                                <LTTSelectValue />
                            </LTTSelectTrigger>
                            <LTTSelectContent>
                                <LTTSelectItem value="active">{t("admin.common.active")}</LTTSelectItem>
                                <LTTSelectItem value="inactive">{t("admin.common.inactive")}</LTTSelectItem>
                            </LTTSelectContent>
                        </LTTSelect>
                    </div>
                </div>

                <LTTDialogFooter>
                    <LTTButton variant="outline" onClick={() => onOpenChange(false)}>{t("admin.common.delete_confirm.cancel")}</LTTButton>
                    <LTTButton onClick={handleSave} loading={isLoading}>
                        {editingItem ? t("admin.amenities.form.save") : t("admin.amenities.form.create")}
                    </LTTButton>
                </LTTDialogFooter>
            </LTTDialogContent>
        </LTTDialog>
    );
}
