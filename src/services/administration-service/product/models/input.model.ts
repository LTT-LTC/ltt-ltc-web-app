export interface GetProductListInputDto {
    categoryId?: string;
    keyword?: string;
    page: number;
    fetch: number;
}

export interface ComboProductLineDto {
    productId: string;
    quantity: number;
}

/**
 * Product create payload. The dialog can either upload a fresh image (`imageFile`)
 * or reuse an existing Cloudinary URL (`imageUrl`). The service serialises the
 * payload as multipart/form-data, so both fields appear directly in the FormData.
 */
export interface CreateProductInputDto {
    productCategoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    isActive: boolean;
    imageFile?: File;
    imageUrl?: string;
}

export interface UpdateProductInputDto {
    productCategoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    isActive: boolean;
    imageFile?: File;
    imageUrl?: string;
}

export interface CreateCategoryInputDto {
    name: string;
    description?: string;
    isActive: boolean;
}

export interface UpdateCategoryInputDto extends CreateCategoryInputDto { }

/**
 * Combo create payload. `products` is a list of `{productId, quantity}` rows;
 * the service serialises them as `Products[i].ProductId` / `Products[i].Quantity`
 * in multipart/form-data so .NET model-binding picks them up directly.
 */
export interface CreateComboInputDto {
    name: string;
    description?: string;
    totalPrice: number;
    isActive: boolean;
    imageFile?: File;
    imageUrl?: string;
    products: ComboProductLineDto[];
}

export interface UpdateComboInputDto extends CreateComboInputDto { }
