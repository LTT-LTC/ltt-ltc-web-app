import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { GetMovieListInputDto } from "./models/input.model";
import { MovieDetailOutputDto, MovieOutputDto } from "./models/output.model";

const rootPath = "/movie-service";
const moviePath = "/movie";

const getMovieListAsync = async (params: GetMovieListInputDto): Promise<PagedResultDto<MovieOutputDto>> => {
    const response = await http.get<PagedResultDto<MovieOutputDto>>(`${rootPath}${moviePath}-all`, { params });
    return response.data;
};

const getMovieByIdAsync = async (id: string): Promise<MovieDetailOutputDto> => {
    const response = await http.get<MovieDetailOutputDto>(`${rootPath}${moviePath}/${id}`);
    return response.data;
};

export const customerMovieService = {
    getMovieAsync: getMovieListAsync,
    getMovieListAsync,
    getMovieByIdAsync,
    getMovieDetailAsync: getMovieByIdAsync,
};
