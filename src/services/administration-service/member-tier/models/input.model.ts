export interface GetMemberTierListInputDto {
    skipCount: number;
    maxResultCount: number;
}

export interface CreateMemberTierInputDto {
    name: string;
    minPoints: number;
    discountPercentage: number;
    pointMultiplier: number;
}

export interface UpdateMemberTierInputDto {
    name: string;
    minPoints: number;
    discountPercentage: number;
    pointMultiplier: number;
}
