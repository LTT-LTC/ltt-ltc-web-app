import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

const path = "/administration/admin/cinema";

import { GetCinemaListInputDto, CreateCinemaInputDto, UpdateCinemaInputDto } from "./models/input.model";
import { CinemaOutputDto } from "./models/output.model";

export const cinemaService = {
    getList: async (params: GetCinemaListInputDto) => {
        const { data } = await http.get<ApiResult<any>>(`${rootPath}${path}`, { params });
        return data.data;
    },
    getById: async (id: string) => {
        const { data } = await http.get<ApiResult<CinemaOutputDto>>(`${rootPath}${path}/${id}`);
        return data.data;
    },
    create: async (body: CreateCinemaInputDto) => {
        const { data } = await http.post<ApiResult<CinemaOutputDto>>(`${rootPath}${path}`, body);
        return data.data;
    },
    update: async (id: string, body: UpdateCinemaInputDto) => {
        const { data } = await http.put<ApiResult<CinemaOutputDto>>(`${rootPath}${path}/${id}`, body);
        return data.data;
    },
    delete: async (id: string) => {
        const { data } = await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
        return data.data;
    }
};
