export interface PricingRuleOutputDto {
    id: string;
    seatTypeId?: string;
    seatTypeName?: string;
    ruleType: string;
    multiplier: number;
    startTime?: string;
    endTime?: string;
    daysOfWeek: string[];
    priority: number;
    validFrom?: string;
    validUntil?: string;
    isActive: boolean;
}
