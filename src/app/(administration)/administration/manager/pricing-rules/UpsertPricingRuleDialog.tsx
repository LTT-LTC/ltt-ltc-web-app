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
import {
    LTTSelect,
    LTTSelectContent,
    LTTSelectItem,
    LTTSelectTrigger,
    LTTSelectValue
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import LTTSwitch from "@/src/@core/component/AntD/LTTSwitch";
import { useForm } from "react-hook-form";
import { managerPricingRulesService as pricingRuleService } from "@/src/services/administration-service/manager/pricing-rules/pricing-rules.service";
import { managerSeatTypeService as seatTypeService } from "@/src/services/administration-service/manager/seat-type/seat-type.service";
import { SeatTypeOutputDto } from "@/src/services/administration-service/seat-type/models/output.model";
import { CreatePricingRuleInputDto } from "@/src/services/administration-service/pricing-rule/models/input.model";
import { PricingRuleOutputDto } from "@/src/services/administration-service/pricing-rule/models/output.model";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: PricingRuleOutputDto | null;
    onSuccess: () => void;
    cinemaId: string;
}

const DAY_OPTIONS = [
    { token: "MON", label: "Thứ 2" },
    { token: "TUE", label: "Thứ 3" },
    { token: "WED", label: "Thứ 4" },
    { token: "THU", label: "Thứ 5" },
    { token: "FRI", label: "Thứ 6" },
    { token: "SAT", label: "Thứ 7" },
    { token: "SUN", label: "Chủ nhật" },
];

export default function UpsertPricingRuleDialog({ open, onOpenChange, editingItem, onSuccess, cinemaId }: Props) {
    const { t } = useLocalization();
    const [seatTypes, setSeatTypes] = useState<SeatTypeOutputDto[]>([]);

    const { register, handleSubmit, reset, setValue, watch } = useForm<CreatePricingRuleInputDto>({
        defaultValues: {
            ruleType: "FIXED",
            multiplier: 1.0,
            priority: 0,
            isActive: true,
            daysOfWeek: ["ALL"],
            validFrom: undefined,
            validUntil: undefined
        }
    });

    const seatTypesMutation = useLTTMutation<any, void>({
        mutationFn: () => seatTypeService.getSeatTypeListAsync({ page: 1, fetch: 100 }),
        onSuccess: (res) => { if (res && res.items) setSeatTypes(res.items); }
    });

    const upsertMutation = useLTTMutation<any, CreatePricingRuleInputDto>({
        mutationFn: (body) => {
            if (editingItem?.id) {
                return pricingRuleService.updatePricingRuleAsync(cinemaId, editingItem.id, body);
            }
            return pricingRuleService.createPricingRuleAsync(cinemaId, body);
        },
        onSuccess: () => {
            toast.success(editingItem ? t("admin.pricing_rules.update_success") : t("admin.pricing_rules.create_success"));
            onSuccess();
            onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || t("admin.pricing_rules.generic_error"))
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
                    daysOfWeek: editingItem.daysOfWeek?.length ? editingItem.daysOfWeek : ["ALL"],
                    priority: editingItem.priority,
                    validFrom: editingItem.validFrom ? editingItem.validFrom.slice(0, 10) : undefined,
                    validUntil: editingItem.validUntil ? editingItem.validUntil.slice(0, 10) : undefined,
                    isActive: editingItem.isActive
                });
            } else {
                reset({
                    ruleType: "FIXED",
                    multiplier: 1.0,
                    priority: 0,
                    isActive: true,
                    daysOfWeek: ["ALL"],
                    validFrom: undefined,
                    validUntil: undefined
                });
            }
        }
    }, [open, editingItem, reset, seatTypes.length]);

    const onSubmit = (data: CreatePricingRuleInputDto) => {
        if (!data.daysOfWeek || data.daysOfWeek.length === 0) {
            toast.error("Vui lòng chọn ít nhất một ngày áp dụng");
            return;
        }
        if (data.validFrom && data.validUntil && data.validFrom > data.validUntil) {
            toast.error("Ngày bắt đầu không được sau ngày kết thúc");
            return;
        }
        upsertMutation.mutation(data);
    };

    const selectedDays = watch("daysOfWeek") || [];
    const isAllDays = selectedDays.includes("ALL");

    const toggleAllDays = (checked: boolean) => {
        setValue("daysOfWeek", checked ? ["ALL"] : []);
    };

    const toggleSingleDay = (token: string, checked: boolean) => {
        const current = new Set((watch("daysOfWeek") || []).filter((x) => x !== "ALL"));
        if (checked) {
            current.add(token);
        } else {
            current.delete(token);
        }
        setValue("daysOfWeek", Array.from(current));
    };

    return (
        <LTTDialog open={open} onOpenChange={onOpenChange}>
            <LTTDialogContent className="sm:max-w-lg">
                <LTTDialogHeader>
                    <LTTDialogTitle>{editingItem ? t("admin.pricing_rules.form.edit_title") : t("admin.pricing_rules.form.create_title")}</LTTDialogTitle>
                </LTTDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <LTTLabel>{t("admin.pricing_rules.form.seat_type")}</LTTLabel>
                            <LTTSelect
                                value={watch("seatTypeId") || "all"}
                                onValueChange={(v) => setValue("seatTypeId", v === "all" ? undefined : v)}
                            >
                                <LTTSelectTrigger>
                                    <LTTSelectValue placeholder={t("admin.pricing_rules.all")} />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    <LTTSelectItem value="all">{t("admin.pricing_rules.all_seat_types")}</LTTSelectItem>
                                    {seatTypes.map(st => (
                                        <LTTSelectItem key={st.id} value={st.id}>{st.name}</LTTSelectItem>
                                    ))}
                                </LTTSelectContent>
                            </LTTSelect>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>{t("admin.pricing_rules.form.rule_type")}</LTTLabel>
                            <LTTSelect
                                value={watch("ruleType")}
                                onValueChange={(v) => setValue("ruleType", v)}
                            >
                                <LTTSelectTrigger>
                                    <LTTSelectValue />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    <LTTSelectItem value="FIXED">{t("admin.pricing_rules.rule_type.fixed")}</LTTSelectItem>
                                    <LTTSelectItem value="SURCHARGE">{t("admin.pricing_rules.rule_type.surcharge")}</LTTSelectItem>
                                    <LTTSelectItem value="DISCOUNT">{t("admin.pricing_rules.rule_type.discount")}</LTTSelectItem>
                                </LTTSelectContent>
                            </LTTSelect>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>{t("admin.pricing_rules.form.multiplier")}</LTTLabel>
                            <LTTInput
                                type="number"
                                step="0.1"
                                {...register("multiplier", { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>{t("admin.pricing_rules.form.priority")}</LTTLabel>
                            <LTTInput
                                type="number"
                                {...register("priority", { valueAsNumber: true })}
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <LTTLabel>{t("admin.pricing_rules.form.day_of_week")}</LTTLabel>
                            <div className="space-y-3 rounded-md border border-border-shadcn p-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <LTTCheckbox checked={isAllDays} onCheckedChange={(v) => toggleAllDays(Boolean(v))} />
                                    <span>Tất cả các ngày (ALL)</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {DAY_OPTIONS.map((day) => (
                                        <label key={day.token} className="flex items-center gap-2 text-sm">
                                            <LTTCheckbox
                                                checked={!isAllDays && selectedDays.includes(day.token)}
                                                disabled={isAllDays}
                                                onCheckedChange={(v) => toggleSingleDay(day.token, Boolean(v))}
                                            />
                                            <span>{day.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>{t("admin.pricing_rules.form.status")}</LTTLabel>
                            <div className="flex items-center gap-2 pt-2">
                                <LTTSwitch
                                    checked={watch("isActive")}
                                    onChange={(v) => setValue("isActive", v)}
                                />
                                <span className="text-sm">{watch("isActive") ? t("admin.common.active") : t("admin.common.inactive")}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <LTTLabel>{t("admin.pricing_rules.form.start_time")}</LTTLabel>
                            <LTTInput type="time" {...register("startTime")} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>{t("admin.pricing_rules.form.end_time")}</LTTLabel>
                            <LTTInput type="time" {...register("endTime")} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Valid from</LTTLabel>
                            <LTTInput type="date" {...register("validFrom")} />
                        </div>
                        <div className="space-y-2">
                            <LTTLabel>Valid until</LTTLabel>
                            <LTTInput type="date" {...register("validUntil")} />
                        </div>
                    </div>
                </form>
                <LTTDialogFooter>
                    <LTTButton variant="outline" onClick={() => onOpenChange(false)}>{t("admin.common.delete_confirm.cancel")}</LTTButton>
                    <LTTButton onClick={handleSubmit(onSubmit)} loading={upsertMutation.isLoading}>
                        {editingItem ? t("admin.pricing_rules.form.save") : t("admin.pricing_rules.form.create")}
                    </LTTButton>
                </LTTDialogFooter>
            </LTTDialogContent>
        </LTTDialog>
    );
}
