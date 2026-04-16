import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

const path = "/administration/manager/screens";

import { GetScreenListInputDto, CreateScreenInputDto, UpdateScreenInputDto } from "./models/input.model";
import { ScreenOutputDto } from "./models/output.model";

export const screenService = {
    getListAll: async (cinemaId: string, params: GetScreenListInputDto) => {
        const { data } = await http.get<ApiResult<PagedResultDto<ScreenOutputDto>>>(`${rootPath}${path}/cinema/${cinemaId}/screen-all`, { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await http.get<ApiResult<ScreenOutputDto>>(`${rootPath}${path}/${id}`);
        return data;
    },
    create: async (cinemaId: string, body: CreateScreenInputDto) => {
        const { data } = await http.post<ApiResult<ScreenOutputDto>>(`${rootPath}${path}/cinema/${cinemaId}`, body);
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
