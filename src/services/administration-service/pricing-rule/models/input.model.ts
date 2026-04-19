export interface CreatePricingRuleInputDto {
    seatTypeId?: string;
    ruleType: string;
    multiplier: number;
    startTime?: string;
    endTime?: string;
    dayOfWeek?: number;
    priority: number;
    isActive: boolean;
}

export interface UpdatePricingRuleInputDto {
    seatTypeId?: string;
    ruleType: string;
    multiplier: number;
    startTime?: string;
    endTime?: string;
    dayOfWeek?: number;
    priority: number;
    isActive: boolean;
}