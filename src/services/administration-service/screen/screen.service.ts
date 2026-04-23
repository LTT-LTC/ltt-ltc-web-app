import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
    GetScreenListInputDto,
    CreateScreenInputDto,
    UpdateScreenInputDto
} from "./models/input.model";
import { ScreenOutputDto } from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { rootPath } from "../administration.service";

const path = "/screens"
const subPath = "/cinema";

const getScreenListAsync = async (cinemaId: string, params: GetScreenListInputDto): Promise<PagedResultDto<ScreenOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<ScreenOutputDto>>>(`${rootPath}${path}${subPath}/${cinemaId}`, { params });
    return response.data.data;
};

const getScreenByIdAsync = async (_cinemaId: string, id: string): Promise<ScreenOutputDto> => {
    const response = await http.get<ApiResult<ScreenOutputDto>>(`${rootPath}${path}/${id}`);
    return response.data.data;
};

const createScreenAsync = async (cinemaId: string, body: CreateScreenInputDto): Promise<ScreenOutputDto> => {
    const response = await http.post<ApiResult<ScreenOutputDto>>(`${rootPath}${path}${subPath}/${cinemaId}`, body);
    return response.data.data;
};

const updateScreenAsync = async (_cinemaId: string, id: string, body: UpdateScreenInputDto): Promise<ScreenOutputDto> => {
    const response = await http.put<ApiResult<ScreenOutputDto>>(`${rootPath}${path}/${id}`, body);
    return response.data.data;
};

const deleteScreenAsync = async (_cinemaId: string, id: string): Promise<void> => {
    await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
};

export const screenService = {
    getScreenListAsync,
    getScreenByIdAsync,
    createScreenAsync,
    updateScreenAsync,
    deleteScreenAsync
};
