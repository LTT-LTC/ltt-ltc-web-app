export interface GetProductListInputDto {
    categoryId?: string;
    keyword?: string;
    page: number;
    fetch: number;
}

export interface CreateProductInputDto {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    image?: string;
}

export interface UpdateProductInputDto {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string;
}

export interface CreateCategoryInputDto {
    name: string;
    description?: string;
}

export interface CreateComboInputDto {
    name: string;
    description?: string;
    price: number;
}
