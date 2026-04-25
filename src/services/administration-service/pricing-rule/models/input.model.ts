export interface CreatePricingRuleInputDto {
    seatTypeId?: string;
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

export interface UpdatePricingRuleInputDto {
    seatTypeId?: string;
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