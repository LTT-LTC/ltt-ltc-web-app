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

export default function UpsertPricingRuleDialog({ open, onOpenChange, editingItem, onSuccess, cinemaId }: Props) {
    const { t } = useLocalization();
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

                        <div className="space-y-2">
                            <LTTLabel>{t("admin.pricing_rules.form.day_of_week")}</LTTLabel>
                            <LTTSelect
                                value={watch("dayOfWeek")?.toString() || "any"}
                                onValueChange={(v) => setValue("dayOfWeek", v === "any" ? undefined : parseInt(v))}
                            >
                                <LTTSelectTrigger>
                                    <LTTSelectValue placeholder={t("admin.pricing_rules.every_day")} />
                                </LTTSelectTrigger>
                                <LTTSelectContent>
                                    <LTTSelectItem value="any">{t("admin.pricing_rules.every_day")}</LTTSelectItem>
                                    <LTTSelectItem value="1">{t("admin.pricing_rules.day.1")}</LTTSelectItem>
                                    <LTTSelectItem value="2">{t("admin.pricing_rules.day.2")}</LTTSelectItem>
                                    <LTTSelectItem value="3">{t("admin.pricing_rules.day.3")}</LTTSelectItem>
                                    <LTTSelectItem value="4">{t("admin.pricing_rules.day.4")}</LTTSelectItem>
                                    <LTTSelectItem value="5">{t("admin.pricing_rules.day.5")}</LTTSelectItem>
                                    <LTTSelectItem value="6">{t("admin.pricing_rules.day.6")}</LTTSelectItem>
                                    <LTTSelectItem value="0">{t("admin.pricing_rules.day.0")}</LTTSelectItem>
                                </LTTSelectContent>
                            </LTTSelect>
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
