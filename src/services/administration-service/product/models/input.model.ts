export interface GetProductListInputDto {
    categoryId?: string;
    keyword?: string;
    page: number;
    fetch: number;
}

export interface CreateProductInputDto {
    productCategoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
    isActive: boolean;
    productType?: string;
}

export interface UpdateProductInputDto {
    productCategoryId?: string;
    name?: string;
    description?: string;
    basePrice?: number;
    imageUrl?: string;
    isActive?: boolean;
    productType?: string;
}

export interface CreateCategoryInputDto {
    name: string;
    description?: string;
    isActive: boolean;
}

export interface UpdateCategoryInputDto extends CreateCategoryInputDto {
}

export interface CreateComboInputDto {
    name: string;
    description?: string;
    totalPrice: number;
    isActive: boolean;
    comboItems?: CreateComboItemInputDto[];
}

export interface UpdateComboInputDto {
    name: string;
    description?: string;
    totalPrice: number;
    isActive: boolean;
}

export interface CreateComboItemInputDto {
    productId: string;
    quantity: number;
}

export interface CreateProductVariantInputDto {
    name: string;
    additionalPrice: number;
    isActive: boolean;
}

export interface UpdateProductVariantInputDto extends CreateProductVariantInputDto {
}
