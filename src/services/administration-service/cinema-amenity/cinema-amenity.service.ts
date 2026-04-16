import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

const cinemaPath = "/administration/admin/cinema";

import { GetCinemaAmenityListInputDto, CreateCinemaAmenityInputDto, UpdateCinemaAmenityInputDto } from "./models/input.model";
import { CinemaAmenityOutputDto } from "./models/output.model";

export const cinemaAmenityService = {
    getListAll: async (cinemaId: string, params?: GetCinemaAmenityListInputDto) => {
        const { data } = await http.get<ApiResult<PagedResultDto<CinemaAmenityOutputDto>>>(`${rootPath}${cinemaPath}/${cinemaId}/amenity-all`, { params });
        return data.data;
    },
    getById: async (cinemaId: string, amenityId: string) => {
        const { data } = await http.get<ApiResult<CinemaAmenityOutputDto>>(`${rootPath}${cinemaPath}/${cinemaId}/amenity/${amenityId}`);
        return data.data;
    },
    create: async (cinemaId: string, body: CreateCinemaAmenityInputDto) => {
        const { data } = await http.post<ApiResult<CinemaAmenityOutputDto>>(`${rootPath}${cinemaPath}/${cinemaId}/amenity`, body);
        return data.data;
    },
    update: async (cinemaId: string, amenityId: string, body: UpdateCinemaAmenityInputDto) => {
        const { data } = await http.put<ApiResult<CinemaAmenityOutputDto>>(`${rootPath}${cinemaPath}/${cinemaId}/amenity/${amenityId}`, body);
        return data.data;
    },
    delete: async (cinemaId: string, amenityId: string) => {
        const { data } = await http.delete<ApiResult<void>>(`${rootPath}${cinemaPath}/${cinemaId}/amenity/${amenityId}`);
        return data.data;
    }
};
