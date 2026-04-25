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

export interface UpdateGiftCodeInputDto {
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