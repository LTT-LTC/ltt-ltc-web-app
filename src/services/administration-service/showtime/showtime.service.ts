import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
    GetShowtimeListInputDto,
    CreateShowtimeInputDto,
} from "./models/input.model";
import { ShowtimeOutputDto } from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { getManagerRootPath, getRoleScopedRootPath } from "../administration.service";

const path = "/showtimes";

const getShowtimeListAsync = async (params: GetShowtimeListInputDto): Promise<PagedResultDto<ShowtimeOutputDto>> => {
    const roleRootPath = getRoleScopedRootPath();
    const response = await http.get<ApiResult<PagedResultDto<ShowtimeOutputDto>>>(`${roleRootPath}${path}/movie/${params.movieId}`, {
        params: {
            cinemaId: params.cinemaId,
            skipCount: (params.page - 1) * params.fetch,
            maxResultCount: params.fetch
        }
    });
    return response.data.data;
};

const getShowtimeByIdAsync = async (id: string): Promise<ShowtimeOutputDto> => {
    const roleRootPath = getRoleScopedRootPath();
    const response = await http.get<ApiResult<ShowtimeOutputDto>>(`${roleRootPath}${path}/${id}`);
    return response.data.data;
}

const updateShowtimeAsync = async (id: string, body: CreateShowtimeInputDto): Promise<ShowtimeOutputDto> => {
    const managerRootPath = getManagerRootPath();
    const response = await http.put<ApiResult<ShowtimeOutputDto>>(`${managerRootPath}${path}/${id}`, body);
    return response.data.data;
}

const createShowtimeAsync = async (body: CreateShowtimeInputDto): Promise<ShowtimeOutputDto> => {
    const managerRootPath = getManagerRootPath();
    const response = await http.post<ApiResult<ShowtimeOutputDto>>(`${managerRootPath}${path}`, body);
    return response.data.data;
};

const deleteShowtimeAsync = async (id: string): Promise<void> => {
    const managerRootPath = getManagerRootPath();
    await http.delete<ApiResult<void>>(`${managerRootPath}${path}/${id}`);
};

export const showtimeService = {
    getShowtimeListAsync,
    getShowtimeByIdAsync,
    createShowtimeAsync,
    updateShowtimeAsync,
    deleteShowtimeAsync
};
