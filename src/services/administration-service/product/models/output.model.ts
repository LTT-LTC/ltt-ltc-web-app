export interface ProductOutputDto {
    id: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    categoryName?: string;
    image?: string;
}

export interface CategoryOutputDto {
    id: string;
    name: string;
    description?: string;
}

export interface ComboOutputDto {
    id: string;
    name: string;
    description?: string;
    price: number;
}
