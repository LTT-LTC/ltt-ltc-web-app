import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { getRoleScopedRootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { GetCinemaListInputDto, CreateCinemaInputDto, UpdateCinemaInputDto } from "./models/input.model";
import { CinemaOutputDto } from "./models/output.model";

const path = "/cinema";

const getCinemaListAsync = async (params: GetCinemaListInputDto) => {
    const { data } = await http.get<ApiResult<PagedResultDto<CinemaOutputDto>>>(`${getRoleScopedRootPath()}${path}`, { params });
    return data.data;
}

const getCinemaByIdAsync = async (id: string) => {
    const { data } = await http.get<ApiResult<CinemaOutputDto>>(`${getRoleScopedRootPath()}${path}/${id}`);
    return data.data;
}

const createCinemaAsync = async (body: CreateCinemaInputDto) => {
    const { data } = await http.post<ApiResult<CinemaOutputDto>>(`${getRoleScopedRootPath()}${path}`, body);
    return data.data;
}

const updateCinemaAsync = async (id: string, body: UpdateCinemaInputDto) => {
    const { data } = await http.put<ApiResult<CinemaOutputDto>>(`${getRoleScopedRootPath()}${path}/${id}`, body);
    return data.data;
}

const deleteCinemaAsync = async (id: string) => {
    const { data } = await http.delete<ApiResult<void>>(`${getRoleScopedRootPath()}${path}/${id}`);
    return data.data;
}

export const cinemaService = {
    getCinemaAsync: getCinemaListAsync,
    getCinemaByIdAsync,
    createCinemaAsync,
    updateCinemaAsync,
    deleteCinemaAsync,

    getCinemaListAsync,

    getList: getCinemaListAsync,
    getById: getCinemaByIdAsync,
    create: createCinemaAsync,
    update: updateCinemaAsync,
    delete: deleteCinemaAsync,
}

export type { CinemaOutputDto };