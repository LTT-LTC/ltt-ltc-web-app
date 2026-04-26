export interface ProductOutputDto {
    id: string;
    productCategoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
    isActive: boolean;
    productType?: string;
}

export interface CategoryOutputDto {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface ComboOutputDto {
    id: string;
    name: string;
    description?: string;
    totalPrice: number;
    isActive: boolean;
}

export interface ProductVariantOutputDto {
    id: string;
    productId: string;
    name: string;
    additionalPrice: number;
    isActive: boolean;
}

export interface ProductDetailOutputDto extends ProductOutputDto {
    productVariants: ProductVariantOutputDto[];
}

export interface ComboItemOutputDto {
    id: string;
    comboId: string;
    productId: string;
    quantity: number;
    product?: ProductOutputDto;
}

export interface ComboDetailOutputDto extends ComboOutputDto {
    comboItems: ComboItemOutputDto[];
}
