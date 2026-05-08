export interface ProductOutputDto {
    id: string;
    tenantId?: string;
    productCategoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryOutputDto {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface ComboProductLineOutputDto {
    productId: string;
    quantity: number;
    product?: ProductOutputDto;
}

export interface ComboOutputDto {
    id: string;
    tenantId?: string;
    name: string;
    description?: string;
    imageUrl?: string;
    totalPrice: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    products: ComboProductLineOutputDto[];
}

export interface MediaUploadOutputDto {
    url: string;
    publicId: string;
}
