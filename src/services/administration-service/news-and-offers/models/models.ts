export interface NewsAndOffersDto {
    id: string;
    title: string;
    content: string;
    status: 'active' | 'draft' | 'archived';
    createdAt: string;
}

export interface NewsAndOffersFilterDto {
    keyword?: string;
    status?: string[];
    skipCount?: number;
    maxResultCount?: number;
}
