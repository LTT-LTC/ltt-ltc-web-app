import http from "@/src/@core/http/http";
import { rootPath } from "../administration.service";
import { ApiResult, PagedResultDto } from "@/src/@core/http/models/ApiResult";

const path = "/administration/admin/seat-type";

export interface SeatTypeOutputDto {
    id: string;
    name: string;
    description?: string;
    numberOfSeat: number;
    displayDirection?: string;
    priceMultiplier: number;
    updatedAt?: string;
}

export interface GetSeatTypeListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
}

export interface CreateSeatTypeInputDto {
    name: string;
    description?: string;
    numberOfSeat: number;
    displayDirection?: string;
    priceMultiplier: number;
}

export interface UpdateSeatTypeInputDto {
    name: string;
    description?: string;
    numberOfSeat: number;
    displayDirection?: string;
    priceMultiplier: number;
}

export const seatTypeService = {
    getList: async (params: GetSeatTypeListInputDto) => {
        const { data } = await http.get<ApiResult<PagedResultDto<SeatTypeOutputDto>>>(`${rootPath}${path}`, { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await http.get<ApiResult<SeatTypeOutputDto>>(`${rootPath}${path}/${id}`);
        return data;
    },
    create: async (body: CreateSeatTypeInputDto) => {
        const { data } = await http.post<ApiResult<SeatTypeOutputDto>>(`${rootPath}${path}`, body);
        return data;
    },
    update: async (id: string, body: UpdateSeatTypeInputDto) => {
        const { data } = await http.put<ApiResult<SeatTypeOutputDto>>(`${rootPath}${path}/${id}`, body);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
        return data;
    }
};
