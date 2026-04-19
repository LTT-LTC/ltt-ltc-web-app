import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

const path = "/seat-type";

import { GetSeatTypeListInputDto, CreateSeatTypeInputDto, UpdateSeatTypeInputDto } from "./models/input.model";
import { SeatTypeOutputDto } from "./models/output.model";

export const seatTypeService = {
    getList: async (params: GetSeatTypeListInputDto) => {
        const { data } = await http.get<ApiResult<PagedResultDto<SeatTypeOutputDto>>>(`${rootPath}${path}`, { params });
        return data.data;
    },
    getById: async (id: string) => {
        const { data } = await http.get<ApiResult<SeatTypeOutputDto>>(`${rootPath}${path}/${id}`);
        return data.data;
    },
    create: async (body: CreateSeatTypeInputDto) => {
        const { data } = await http.post<ApiResult<SeatTypeOutputDto>>(`${rootPath}${path}`, body);
        return data.data;
    },
    update: async (id: string, body: UpdateSeatTypeInputDto) => {
        const { data } = await http.put<ApiResult<SeatTypeOutputDto>>(`${rootPath}${path}/${id}`, body);
        return data.data;
    },
    delete: async (id: string) => {
        const { data } = await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
        return data.data;
    }
};
