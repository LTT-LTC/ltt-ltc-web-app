import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

const path = "/administration/admin/amenity-type";

import { GetAmenityTypeListInputDto, CreateAmenityTypeInputDto, UpdateAmenityTypeInputDto } from "./models/input.model";
import { AmenityTypeOutputDto } from "./models/output.model";

export const amenityTypeService = {
    getList: async (params?: GetAmenityTypeListInputDto) => {
        const { data } = await http.get<ApiResult<PagedResultDto<AmenityTypeOutputDto>>>(`${rootPath}${path}-all`, { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await http.get<ApiResult<AmenityTypeOutputDto>>(`${rootPath}${path}/${id}`);
        return data;
    },
    create: async (body: CreateAmenityTypeInputDto) => {
        const { data } = await http.post<ApiResult<AmenityTypeOutputDto>>(`${rootPath}${path}`, body);
        return data;
    },
    update: async (id: string, body: UpdateAmenityTypeInputDto) => {
        const { data } = await http.put<ApiResult<AmenityTypeOutputDto>>(`${rootPath}${path}/${id}`, body);
        return data;
    },
    delete: async (id: string) => {
        const { data } = await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
        return data;
    }
};
