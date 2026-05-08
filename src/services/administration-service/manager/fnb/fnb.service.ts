import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
  CreateCategoryInputDto,
  CreateComboInputDto,
  CreateProductInputDto,
  GetProductListInputDto,
  UpdateCategoryInputDto,
  UpdateComboInputDto,
  UpdateProductInputDto,
} from "../../product/models/input.model";
import {
  CategoryOutputDto,
  ComboOutputDto,
  MediaUploadOutputDto,
  ProductOutputDto,
} from "../../product/models/output.model";
import { buildComboFormData, buildProductFormData } from "../../product/multipart";

const productRootPath = "/product-service/manager/product";
const comboRootPath = "/product-service/manager/combo";
const categoryRootPath = "/product-service/manager/category";
const mediaRootPath = "/product-service/manager/media-files";
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
  const formData = buildProductFormData(body);
  const response = await http.post<ApiResult<ProductOutputDto>>(`${productRootPath}${productPath}`, formData);
  return response.data.data;
};

const updateProductAsync = async (id: string, body: UpdateProductInputDto): Promise<ProductOutputDto> => {
  const formData = buildProductFormData(body);
  const response = await http.put<ApiResult<ProductOutputDto>>(`${productRootPath}${productPath}/${id}`, formData);
  return response.data.data;
};

const deleteProductAsync = async (id: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${productRootPath}${productPath}/${id}`);
};

const getProductByIdAsync = async (id: string): Promise<ProductOutputDto> => {
  const response = await http.get<ApiResult<ProductOutputDto>>(`${productRootPath}${productPath}/${id}`);
  return response.data.data;
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

const getComboByIdAsync = async (id: string): Promise<ComboOutputDto> => {
  const response = await http.get<ApiResult<ComboOutputDto>>(`${comboRootPath}${comboPath}/${id}`);
  return response.data.data;
};

const createComboAsync = async (body: CreateComboInputDto): Promise<ComboOutputDto> => {
  const formData = buildComboFormData(body);
  const response = await http.post<ApiResult<ComboOutputDto>>(`${comboRootPath}${comboPath}`, formData);
  return response.data.data;
};

const updateComboAsync = async (id: string, body: UpdateComboInputDto): Promise<ComboOutputDto> => {
  const formData = buildComboFormData(body);
  const response = await http.put<ApiResult<ComboOutputDto>>(`${comboRootPath}${comboPath}/${id}`, formData);
  return response.data.data;
};

const deleteComboAsync = async (id: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${comboRootPath}${comboPath}/${id}`);
};

const uploadMediaAsync = async (file: File): Promise<MediaUploadOutputDto> => {
  const form = new FormData();
  form.append("file", file, file.name);
  const response = await http.post<ApiResult<MediaUploadOutputDto>>(`${mediaRootPath}/upload`, form);
  return response.data.data;
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
  uploadMediaAsync,
};
