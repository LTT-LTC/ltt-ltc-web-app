import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
    GetProductListInputDto,
    CreateProductInputDto,
    UpdateProductInputDto,
    CreateCategoryInputDto,
    CreateComboInputDto,
    UpdateCategoryInputDto,
    UpdateComboInputDto
} from "./models/input.model";
import {
    ProductOutputDto,
    CategoryOutputDto,
    ComboOutputDto
} from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

const rootpath = "/product-service";
const productPath = "/product";
const comboPath = "/combo";
const categoryPath = "/category";

const getProductListAsync = async (params: GetProductListInputDto): Promise<PagedResultDto<ProductOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<ProductOutputDto>>>(`${rootpath}${productPath}`, { params });
    return response.data.data;
};

const getProductByIdAsync = async (id: string): Promise<ProductOutputDto> => {
    const response = await http.get<ApiResult<ProductOutputDto>>(`${rootpath}${productPath}/${id}`);
    return response.data.data;
};

const createProductAsync = async (body: CreateProductInputDto): Promise<ProductOutputDto> => {
    const response = await http.post<ApiResult<ProductOutputDto>>(`${rootpath}${productPath}`, body);
    return response.data.data;
};

const updateProductAsync = async (id: string, body: UpdateProductInputDto): Promise<ProductOutputDto> => {
    const response = await http.put<ApiResult<ProductOutputDto>>(`${rootpath}${productPath}/${id}`, body);
    return response.data.data;
};

const deleteProductAsync = async (id: string): Promise<void> => {
    await http.delete<ApiResult<void>>(`${rootpath}${productPath}/${id}`);
};

const getCategoryListAsync = async (): Promise<PagedResultDto<CategoryOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<CategoryOutputDto>>>(`${rootpath}${categoryPath}-all`);
    return response.data.data;
};

const getCategoryByIdAsync = async (id: string): Promise<CategoryOutputDto> => {
    const response = await http.get<ApiResult<CategoryOutputDto>>(`${rootpath}${categoryPath}/${id}`);
    return response.data.data;
}

const createCategoryAsync = async (body: CreateCategoryInputDto): Promise<CategoryOutputDto> => {
    const response = await http.post<ApiResult<CategoryOutputDto>>(`${rootpath}${categoryPath}`, body);
    return response.data.data;
};

const updateCategoryAsync = async (id: string, body: UpdateCategoryInputDto): Promise<CategoryOutputDto> => {
    const response = await http.put<ApiResult<CategoryOutputDto>>(`${rootpath}${categoryPath}/${id}`, body);
    return response.data.data;
};

const deleteCategoryAsync = async (id: string): Promise<void> => {
    await http.delete<ApiResult<void>>(`${rootpath}${categoryPath}/${id}`);
}

const getComboListAsync = async (): Promise<PagedResultDto<ComboOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<ComboOutputDto>>>(`${rootpath}${comboPath}-all`);
    return response.data.data;
};

const getComboByIdAsync = async (id: string): Promise<ComboOutputDto> => {
    const response = await http.get<ApiResult<ComboOutputDto>>(`${rootpath}${comboPath}/${id}`);
    return response.data.data;
};

const updateComboAsync = async (id: string, body: UpdateComboInputDto): Promise<ComboOutputDto> => {
    const response = await http.put<ApiResult<ComboOutputDto>>(`${rootpath}${comboPath}/${id}`, body);
    return response.data.data;
}

const createComboAsync = async (body: CreateComboInputDto): Promise<ComboOutputDto> => {
    const response = await http.post<ApiResult<ComboOutputDto>>(`${rootpath}${comboPath}`, body);
    return response.data.data;
};

const deleteComboAsync = async (id: string): Promise<void> => {
    await http.delete<ApiResult<void>>(`${rootpath}${comboPath}/${id}`);
}

export const productService = {
    getProductListAsync,
    getProductByIdAsync,
    createProductAsync,
    updateProductAsync,
    deleteProductAsync,
    getCategoryListAsync,
    getCategoryByIdAsync,
    createCategoryAsync,
    updateCategoryAsync,
    deleteCategoryAsync,
    getComboListAsync,
    getComboByIdAsync,
    createComboAsync,
    updateComboAsync,
    deleteComboAsync
};