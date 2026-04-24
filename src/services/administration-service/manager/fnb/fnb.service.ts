import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
  CreateCategoryInputDto,
  CreateComboInputDto,
  CreateProductInputDto,
  GetProductListInputDto,
  UpdateProductInputDto,
} from "../../product/models/input.model";
import { CategoryOutputDto, ComboOutputDto, ProductOutputDto } from "../../product/models/output.model";

const productRootPath = "/product-service/manager/product";
const comboRootPath = "/product-service/manager/combo";
const categoryRootPath = "/product-service/manager/category";
const productPath = "/product";
const comboPath = "/combo";
const categoryPath = "/category";

const getProductListAsync = async (params: GetProductListInputDto): Promise<PagedResultDto<ProductOutputDto>> => {
  const safeParams: GetProductListInputDto = {
    ...params,
    keyword: params.keyword ?? "",
  };
  const response = await http.get<ApiResult<PagedResultDto<ProductOutputDto>>>(`${productRootPath}${productPath}-all`, { params: safeParams });
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

const getCategoryListAsync = async (): Promise<PagedResultDto<CategoryOutputDto>> => {
  const response = await http.get<ApiResult<PagedResultDto<CategoryOutputDto>>>(`${categoryRootPath}${categoryPath}-all`);
  return response.data.data;
};

const createCategoryAsync = async (body: CreateCategoryInputDto): Promise<CategoryOutputDto> => {
  const response = await http.post<ApiResult<CategoryOutputDto>>(`${categoryRootPath}${categoryPath}`, body);
  return response.data.data;
};

const updateCategoryAsync = async (id: string, body: CreateCategoryInputDto): Promise<CategoryOutputDto> => {
  const response = await http.put<ApiResult<CategoryOutputDto>>(`${categoryRootPath}${categoryPath}/${id}`, body);
  return response.data.data;
};

const deleteCategoryAsync = async (id: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${categoryRootPath}${categoryPath}/${id}`);
};

const getComboListAsync = async (): Promise<PagedResultDto<ComboOutputDto>> => {
  const response = await http.get<ApiResult<PagedResultDto<ComboOutputDto>>>(`${comboRootPath}${comboPath}-all`);
  return response.data.data;
};

const createComboAsync = async (body: CreateComboInputDto): Promise<ComboOutputDto> => {
  const response = await http.post<ApiResult<ComboOutputDto>>(`${comboRootPath}${comboPath}`, body);
  return response.data.data;
};

const updateComboAsync = async (id: string, body: CreateComboInputDto): Promise<ComboOutputDto> => {
  const response = await http.put<ApiResult<ComboOutputDto>>(`${comboRootPath}${comboPath}/${id}`, body);
  return response.data.data;
};

const deleteComboAsync = async (id: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${comboRootPath}${comboPath}/${id}`);
};

export const managerFnbService = {
  getProductListAsync,
  createProductAsync,
  updateProductAsync,
  deleteProductAsync,
  getCategoryListAsync,
  createCategoryAsync,
  updateCategoryAsync,
  deleteCategoryAsync,
  getComboListAsync,
  createComboAsync,
  updateComboAsync,
  deleteComboAsync,
};
