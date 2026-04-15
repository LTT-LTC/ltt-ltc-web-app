import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

const path = "/administration/admin/screen";
const cinemaPath = "/administration/admin/cinema";

export interface ScreenOutputDto {
    id: string;
    cinemaId: string;
    screenNumber: number;
    screenType?: string;
    seatLayout?: string;
    seatCount: number;
    status?: string;
}

export interface GetScreenListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
    status?: string;
}

export interface CreateScreenInputDto {
    screenNumber: number;
    screenType?: string;
    seatLayout?: string;
    seatCount: number;
    status?: string;
}

export interface UpdateScreenInputDto {
    screenNumber: number;
    screenType?: string;
    seatLayout?: string;
    seatCount: number;
    status?: string;
}

export const screenService = {
    getListAll: async (cinemaId: string, params: GetScreenListInputDto) => {
        const { data } = await http.get<ApiResult<PagedResultDto<ScreenOutputDto>>>(`${rootPath}${cinemaPath}/${cinemaId}/screen-all`, { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await http.get<ApiResult<ScreenOutputDto>>(`${rootPath}${path}/${id}`);
        return data;
    },
    create: async (cinemaId: string, body: CreateScreenInputDto) => {
        const { data } = await http.post<ApiResult<ScreenOutputDto>>(`${rootPath}${cinemaPath}/${cinemaId}/screen`, body);
        return data;
    },
    update: async (id: string, body: UpdateScreenInputDto) => {
        const { data } = await http.put<ApiResult<ScreenOutputDto>>(`${rootPath}${path}/${id}`, body);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
        return data;
    }
};
