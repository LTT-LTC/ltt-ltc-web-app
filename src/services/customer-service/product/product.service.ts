import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import {
    ComboOutputDto,
    ProductOutputDto,
} from "@/src/services/administration-service/product/models/output.model";

export type CustomerProductOutputDto = ProductOutputDto;
export type CustomerComboOutputDto = ComboOutputDto;

const rootPath = "/product-service";

const unwrap = <T>(payload: ApiResult<T> | T): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as ApiResult<T>).data;
    }
    return payload as T;
};

const getProductListAsync = async (params?: { keyword?: string; productCategoryId?: string; page?: number; pageSize?: number }): Promise<PagedResultDto<CustomerProductOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<CustomerProductOutputDto>> | PagedResultDto<CustomerProductOutputDto>>(`${rootPath}/product-all`, { params });
    return unwrap(response.data);
};

const getProductAsync = async (id: string): Promise<CustomerProductOutputDto> => {
    const response = await http.get<ApiResult<CustomerProductOutputDto> | CustomerProductOutputDto>(`${rootPath}/product/${id}`);
    return unwrap(response.data);
};

const getComboListAsync = async (params?: { page?: number; pageSize?: number }): Promise<PagedResultDto<CustomerComboOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<CustomerComboOutputDto>> | PagedResultDto<CustomerComboOutputDto>>(`${rootPath}/combo-all`, { params });
    return unwrap(response.data);
};

const getComboAsync = async (id: string): Promise<CustomerComboOutputDto> => {
    const response = await http.get<ApiResult<CustomerComboOutputDto> | CustomerComboOutputDto>(`${rootPath}/combo/${id}`);
    return unwrap(response.data);
};

export const customerProductService = {
    getProductListAsync,
    getProductAsync,
    getComboListAsync,
    getComboAsync,
};
