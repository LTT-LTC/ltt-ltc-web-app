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