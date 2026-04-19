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
import LTTSwitch from "@/src/@core/component/AntD/LTTSwitch";
import { useForm } from "react-hook-form";
import { pricingRuleService } from "@/src/services/administration-service/pricing-rule/pricing-rule.service";
import { seatTypeService } from "@/src/services/administration-service/seat-type/seat-type.service";
import { SeatTypeOutputDto } from "@/src/services/administration-service/seat-type/models/output.model";
import { PricingRuleOutputDto, CreatePricingRuleInputDto } from "@/src/services/administration-service/masterdata/models/commercial.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: PricingRuleOutputDto | null;
    onSuccess: () => void;
    cinemaId: string;
}

export default function UpsertPricingRuleDialog({ open, onOpenChange, editingItem, onSuccess, cinemaId }: Props) {
    const [seatTypes, setSeatTypes] = useState<SeatTypeOutputDto[]>([]);

    const { register, handleSubmit, reset, setValue, watch } = useForm<CreatePricingRuleInputDto>({
        defaultValues: {
            ruleType: "FIXED",
            multiplier: 1.0,
            priority: 0,
            isActive: true,
            dayOfWeek: undefined
        }
    });

    const seatTypesMutation = useLTTMutation<any, void>({
        mutationFn: () => seatTypeService.getSeatTypeListAsync({ page: 1, fetch: 100 }),
        onSuccess: (res) => { if (res && res.items) setSeatTypes(res.items); }
    });

    const upsertMutation = useLTTMutation<any, CreatePricingRuleInputDto>({
        mutationFn: (body) => pricingRuleService.createPricingRuleAsync(cinemaId, body),
        onSuccess: () => {
            toast.success(editingItem ? "Cập nhật thành công" : "Tạo mới thành công");
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Lỗi thao tác")
    });

    useEffect(() => {
        if (open) {
            if (seatTypes.length === 0) {
                seatTypesMutation.mutation();
            }
            if (editingItem) {
                reset({
                    seatTypeId: editingItem.seatTypeId || undefined,
                    ruleType: editingItem.ruleType,
                    multiplier: editingItem.multiplier,
                    startTime: editingItem.startTime || undefined,
                    endTime: editingItem.endTime || undefined,
                    dayOfWeek: editingItem.dayOfWeek,
                    priority: editingItem.priority,
                    isActive: editingItem.isActive
                });
            } else {
                reset({
                    ruleType: "FIXED",
                    multiplier: 1.0,
                    priority: 0,
                    isActive: true,
                    dayOfWeek: undefined
                });
            }
        }
    }, [open, editingItem, reset, seatTypes.length]);

    const onSubmit = (data: CreatePricingRuleInputDto) => {
        upsertMutation.mutation(data);
    };

    return (
        <LTTDialog open={open} onOpenChange={onOpenChange}>
            <LTTDialogContent className="sm:max-w-lg">
                <LTTDialogHeader>
                    <LTTDialogTitle>{editingItem ? "Chỉnh sửa quy tắc giá" : "Thêm quy tắc giá mới"}</LTTDialogTitle>
                </LTTDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <LTTLabel>Loại ghế áp dụng</LTTLabel>
                            <LTTSelect
                                value={watch("seatTypeId") || "all"}
                                onValueChange={(v) => setValue("seatTypeId", v === "all" ? undefined : v)}
                            >
                                <LTTSelectTrigger>
                                    <LTTSelectValue placeholder="Tất cả" />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    <LTTSelectItem value="all">Tất cả loại ghế</LTTSelectItem>
                                    {seatTypes.map(st => (
                                        <LTTSelectItem key={st.id} value={st.id}>{st.name}</LTTSelectItem>
                                    ))}
                                </LTTSelectContent>
                            </LTTSelect>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Loại quy tắc</LTTLabel>
                            <LTTSelect
                                value={watch("ruleType")}
                                onValueChange={(v) => setValue("ruleType", v)}
                            >
                                <LTTSelectTrigger>
                                    <LTTSelectValue />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    <LTTSelectItem value="FIXED">Cố định (Fixed)</LTTSelectItem>
                                    <LTTSelectItem value="SURCHARGE">Phụ thu (Surcharge)</LTTSelectItem>
                                    <LTTSelectItem value="DISCOUNT">Giảm giá (Discount)</LTTSelectItem>
                                </LTTSelectContent>
                            </LTTSelect>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Hệ số (Multiplier)</LTTLabel>
                            <LTTInput
                                type="number"
                                step="0.1"
                                {...register("multiplier", { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Độ ưu tiên</LTTLabel>
                            <LTTInput
                                type="number"
                                {...register("priority", { valueAsNumber: true })}
                            />
                        </div>

                        <div className="space-y-2">
                            <LTTLabel>Ngày trong tuần</LTTLabel>
                            <LTTSelect
                                value={watch("dayOfWeek")?.toString() || "any"}
                                onValueChange={(v) => setValue("dayOfWeek", v === "any" ? undefined : parseInt(v))}
                            >
                                <LTTSelectTrigger>
                                    <LTTSelectValue placeholder="Hàng ngày" />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    <LTTSelectItem value="any">Hàng ngày</LTTSelectItem>
                                    <LTTSelectItem value="1">Thứ 2</LTTSelectItem>
                                    <LTTSelectItem value="2">Thứ 3</LTTSelectItem>
                                    <LTTSelectItem value="3">Thứ 4</LTTSelectItem>
                                    <LTTSelectItem value="4">Thứ 5</LTTSelectItem>
                                    <LTTSelectItem value="5">Thứ 6</LTTSelectItem>
                                    <LTTSelectItem value="6">Thứ 7</LTTSelectItem>
                                    <LTTSelectItem value="0">Chủ nhật</LTTSelectItem>
                                </LTTSelectContent>
                            </LTTSelect>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Trạng thái</LTTLabel>
                            <div className="flex items-center gap-2 pt-2">
                                <LTTSwitch
                                    checked={watch("isActive")}
                                    onChange={(v) => setValue("isActive", v)}
                                />
                                <span className="text-sm">{watch("isActive") ? "Đang bật" : "Đang tắt"}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <LTTLabel>Giờ bắt đầu</LTTLabel>
                            <LTTInput type="time" {...register("startTime")} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Giờ kết thúc</LTTLabel>
                            <LTTInput type="time" {...register("endTime")} />
                        </div>
                    </div>
                </form>
                <LTTDialogFooter>
                    <LTTButton variant="outline" onClick={() => onOpenChange(false)}>Hủy</LTTButton>
                    <LTTButton onClick={handleSubmit(onSubmit)} loading={upsertMutation.isLoading}>
                        {editingItem ? "Lưu thay đổi" : "Tạo quy tắc"}
                    </LTTButton>
                </LTTDialogFooter>
            </LTTDialogContent>
        </LTTDialog>
    );
}
