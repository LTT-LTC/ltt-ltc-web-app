import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

const path = "/administration/admin/cinema";

export interface CinemaOutputDto {
    id: string;
    tenantId?: string;
    name: string;
    address: string;
    provinceRaw: string;
    description?: string;
    managerId?: string;
    hotline?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface GetCinemaListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
    provinceRaw?: string;
    managerId?: string;
    status?: string;
}

export interface CreateCinemaInputDto {
    name: string;
    address: string;
    provinceRaw: string;
}

export interface UpdateCinemaInputDto {
    name: string;
    address: string;
    provinceRaw: string;
}

export const cinemaService = {
    getList: async (params: GetCinemaListInputDto) => {
        const { data } = await http.get<ApiResult<any>>(`${rootPath}${path}`, { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await http.get<ApiResult<CinemaOutputDto>>(`${rootPath}${path}/${id}`);
        return data;
    },
    create: async (body: CreateCinemaInputDto) => {
        const { data } = await http.post<ApiResult<CinemaOutputDto>>(`${rootPath}${path}`, body);
        return data;
    },
    update: async (id: string, body: UpdateCinemaInputDto) => {
        const { data } = await http.put<ApiResult<CinemaOutputDto>>(`${rootPath}${path}/${id}`, body);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
        return data;
    }
};
