export interface GetGiftCodeListInputDto {
    keyword?: string;
    page: number;
    fetch: number;
}

export interface CreateGiftCodeInputDto {
    code: string;
    description?: string;
    discountType?: string;
    discountValue: number;
    minOrderAmount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
}

export interface GiftCodeOutputDto {
    id: string;
    code: string;
    description?: string;
    discountType?: string;
    discountValue: number;
    minOrderAmount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
}

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
