import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
    GetShowtimeListInputDto,
    CreateShowtimeInputDto,
} from "./models/input.model";
import { ShowtimeOutputDto } from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { rootPath } from "../administration.service";

const path = "/showtimes";

const getShowtimeListAsync = async (params: GetShowtimeListInputDto): Promise<PagedResultDto<ShowtimeOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<ShowtimeOutputDto>>>(`${rootPath}${path}`, {
        params: {
            cinemaId: params.cinemaId,
            skipCount: (params.page - 1) * params.fetch,
            maxResultCount: params.fetch
        }
    });
    return response.data.data;
};

const getShowtimeByIdAsync = async (id: string): Promise<ShowtimeOutputDto> => {
    const response = await http.get<ApiResult<ShowtimeOutputDto>>(`${rootPath}${path}/${id}`);
    return response.data.data;
}

const updateShowtimeAsync = async (id: string, body: CreateShowtimeInputDto): Promise<ShowtimeOutputDto> => {
    const response = await http.put<ApiResult<ShowtimeOutputDto>>(`${rootPath}${path}/${id}`, body);
    return response.data.data;
}

const createShowtimeAsync = async (body: CreateShowtimeInputDto): Promise<ShowtimeOutputDto> => {
    const response = await http.post<ApiResult<ShowtimeOutputDto>>(`${rootPath}${path}`, body);
    return response.data.data;
};

const deleteShowtimeAsync = async (id: string): Promise<void> => {
    await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
};

export const showtimeService = {
    getShowtimeListAsync,
    createShowtimeAsync,
    deleteShowtimeAsync
};
