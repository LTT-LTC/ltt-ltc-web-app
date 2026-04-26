import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
  CreateCategoryInputDto,
  CreateComboItemInputDto,
  CreateComboInputDto,
  CreateProductInputDto,
  CreateProductVariantInputDto,
  GetProductListInputDto,
  UpdateCategoryInputDto,
  UpdateComboInputDto,
  UpdateProductVariantInputDto,
  UpdateProductInputDto,
} from "../../product/models/input.model";
import {
  CategoryOutputDto,
  ComboDetailOutputDto,
  ComboOutputDto,
  ProductDetailOutputDto,
  ProductOutputDto,
  ProductVariantOutputDto,
} from "../../product/models/output.model";

const productRootPath = "/product-service/manager/product";
const comboRootPath = "/product-service/manager/combo";
const categoryRootPath = "/product-service/manager/category";
const productPath = "/product";
const comboPath = "/combo";
const categoryPath = "/category";

type PaginationParams = { page?: number; fetch?: number; keyword?: string };

const normalizeListParams = (params?: PaginationParams): PaginationParams => ({
  page: params?.page ?? 1,
  fetch: params?.fetch ?? 10,
  ...(params?.keyword !== undefined ? { keyword: params.keyword } : {}),
});

const getProductListAsync = async (params: GetProductListInputDto): Promise<PagedResultDto<ProductOutputDto>> => {
  const normalized = normalizeListParams(params);
  const response = await http.get<ApiResult<PagedResultDto<ProductOutputDto>>>(`${productRootPath}${productPath}-all`, {
    params: {
      ...normalized,
      categoryId: params.categoryId,
    },
  });
  return response.data.data;
};

const createProductAsync = async (body: CreateProductInputDto): Promise<ProductOutputDto> => {
  const response = await http.post<ApiResult<ProductOutputDto>>(`${productRootPath}${productPath}`, body);
  return response.data.data;
};

const updateProductAsync = async (id: string, body: UpdateProductInputDto): Promise<ProductOutputDto> => {
  const response = await http.put<ApiResult<ProductOutputDto>>(`${productRootPath}${productPath}/${id}`, body);
  return response.data.data;
};

const deleteProductAsync = async (id: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${productRootPath}${productPath}/${id}`);
};

const getCategoryListAsync = async (params?: PaginationParams): Promise<PagedResultDto<CategoryOutputDto>> => {
  const response = await http.get<ApiResult<PagedResultDto<CategoryOutputDto>>>(`${categoryRootPath}${categoryPath}-all`, {
    params: normalizeListParams(params),
  });
  return response.data.data;
};

const createCategoryAsync = async (body: CreateCategoryInputDto): Promise<CategoryOutputDto> => {
  const response = await http.post<ApiResult<CategoryOutputDto>>(`${categoryRootPath}${categoryPath}`, body);
  return response.data.data;
};

const updateCategoryAsync = async (id: string, body: UpdateCategoryInputDto): Promise<CategoryOutputDto> => {
  const response = await http.put<ApiResult<CategoryOutputDto>>(`${categoryRootPath}${categoryPath}/${id}`, body);
  return response.data.data;
};

const deleteCategoryAsync = async (id: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${categoryRootPath}${categoryPath}/${id}`);
};

const getComboListAsync = async (params?: PaginationParams): Promise<PagedResultDto<ComboOutputDto>> => {
  const response = await http.get<ApiResult<PagedResultDto<ComboOutputDto>>>(`${comboRootPath}${comboPath}-all`, {
    params: normalizeListParams(params),
  });
  return response.data.data;
};

const getComboByIdAsync = async (id: string): Promise<ComboDetailOutputDto> => {
  const response = await http.get<ApiResult<ComboDetailOutputDto>>(`${comboRootPath}${comboPath}/${id}`);
  return response.data.data;
};

const createComboAsync = async (body: CreateComboInputDto): Promise<ComboOutputDto> => {
  const response = await http.post<ApiResult<ComboOutputDto>>(`${comboRootPath}${comboPath}`, body);
  return response.data.data;
};

const updateComboAsync = async (id: string, body: UpdateComboInputDto): Promise<ComboOutputDto> => {
  const response = await http.put<ApiResult<ComboOutputDto>>(`${comboRootPath}${comboPath}/${id}`, body);
  return response.data.data;
};

const deleteComboAsync = async (id: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${comboRootPath}${comboPath}/${id}`);
};

const getProductByIdAsync = async (id: string): Promise<ProductDetailOutputDto> => {
  const response = await http.get<ApiResult<ProductDetailOutputDto>>(`${productRootPath}${productPath}/${id}`);
  return response.data.data;
};

const createProductVariantAsync = async (productId: string, body: CreateProductVariantInputDto): Promise<ProductVariantOutputDto> => {
  const response = await http.post<ApiResult<ProductVariantOutputDto>>(`${productRootPath}${productPath}/${productId}/variant`, body);
  return response.data.data;
};

const updateProductVariantAsync = async (productId: string, variantId: string, body: UpdateProductVariantInputDto): Promise<ProductVariantOutputDto> => {
  const response = await http.put<ApiResult<ProductVariantOutputDto>>(`${productRootPath}${productPath}/${productId}/variant/${variantId}`, body);
  return response.data.data;
};

const deleteProductVariantAsync = async (productId: string, variantId: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${productRootPath}${productPath}/${productId}/variant/${variantId}`);
};

const addComboItemAsync = async (comboId: string, body: CreateComboItemInputDto): Promise<void> => {
  await http.post<ApiResult<void>>(`${comboRootPath}${comboPath}/${comboId}/item`, body);
};

const deleteComboItemAsync = async (comboId: string, comboItemId: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${comboRootPath}${comboPath}/${comboId}/item/${comboItemId}`);
};

export const managerFnbService = {
  getProductListAsync,
  getProductByIdAsync,
  createProductAsync,
  updateProductAsync,
  deleteProductAsync,
  getCategoryListAsync,
  createCategoryAsync,
  updateCategoryAsync,
  deleteCategoryAsync,
  getComboListAsync,
  getComboByIdAsync,
  createComboAsync,
  updateComboAsync,
  deleteComboAsync,
  createProductVariantAsync,
  updateProductVariantAsync,
  deleteProductVariantAsync,
  addComboItemAsync,
  deleteComboItemAsync,
};
