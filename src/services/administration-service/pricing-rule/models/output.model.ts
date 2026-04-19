export interface PricingRuleOutputDto {
    id: string;
    seatTypeId?: string;
    seatTypeName?: string;
    ruleType: string;
    multiplier: number;
    startTime?: string;
    endTime?: string;
    dayOfWeek?: number;
    priority: number;
    isActive: boolean;
}
