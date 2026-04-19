import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
    GetMovieListInputDto as GetMovieListDto,
    CreateMovieInputDto,
    UpdateMovieInputDto,
} from "./models/input.model";
import {
    MovieOutputDto,
    MovieDetailOutputDto,
    MovieDistributionOutputDto,
} from "./models/output.model";
import { actorService } from "./actor/actor.service";
import { formatService } from "./format/format.service";
import { genreService } from "./genre/genre.service";
import { roleService } from "./role/role.service";
import { studioService } from "./studio/studio.service";

const rootPath = "/movie-service";
const moviePath = "/movie";
const ratingPath = "/rating";
const distributionPath = "/movie-distribution";

const getMovieListAsync = async (params: GetMovieListDto): Promise<PagedResultDto<MovieOutputDto>> => {
    const response = await http.get<PagedResultDto<MovieOutputDto>>(`${rootPath}${moviePath}`, { params });
    return response.data;
};

const getMovieDetailAsync = async (id: string): Promise<MovieDetailOutputDto> => {
    const response = await http.get<MovieDetailOutputDto>(`${rootPath}${moviePath}/${id}`);
    return response.data;
};

const createMovieAsync = async (body: CreateMovieInputDto): Promise<MovieOutputDto> => {
    const response = await http.post<MovieOutputDto>(`${rootPath}${moviePath}`, body);
    return response.data;
};

const updateMovieAsync = async (id: string, body: UpdateMovieInputDto): Promise<MovieOutputDto> => {
    const response = await http.put<MovieOutputDto>(`${rootPath}${moviePath}/${id}`, body);
    return response.data;
};

const deleteMovieAsync = async (id: string): Promise<void> => {
    await http.delete<void>(`${rootPath}${moviePath}/${id}`);
};

const bulkDeleteMoviesAsync = async (ids: string[]): Promise<void> => {
    await http.delete<void>(`${rootPath}${moviePath}`, { data: ids });
};

const getRatingsAsync = async (): Promise<PagedResultDto<any>> => {
    const response = await http.get<PagedResultDto<any>>(`${rootPath}${ratingPath}-all`);
    return response.data;
};

const createRatingAsync = async (body: any): Promise<any> => {
    const response = await http.post<any>(`${rootPath}${ratingPath}`, body);
    return response.data;
};

const updateRatingAsync = async (id: string, body: any): Promise<any> => {
    const response = await http.put<any>(`${rootPath}${ratingPath}/${id}`, body);
    return response.data;
};

const deleteRatingAsync = async (id: string): Promise<void> => {
    await http.delete<void>(`${rootPath}${ratingPath}/${id}`);
};

const getDistributionsAsync = async (): Promise<PagedResultDto<MovieDistributionOutputDto>> => {
    const response = await http.get<PagedResultDto<MovieDistributionOutputDto>>(`${rootPath}${distributionPath}-all`);
    return response.data;
};

const createDistributionAsync = async (body: any): Promise<MovieDistributionOutputDto> => {
    const response = await http.post<MovieDistributionOutputDto>(`${rootPath}${distributionPath}`, body);
    return response.data;
};

const updateDistributionAsync = async (id: string, body: any): Promise<MovieDistributionOutputDto> => {
    const response = await http.put<MovieDistributionOutputDto>(`${rootPath}${distributionPath}/${id}`, body);
    return response.data;
};

const deleteDistributionAsync = async (id: string): Promise<void> => {
    await http.delete<void>(`${rootPath}${distributionPath}/${id}`);
};

const bulkDeleteMovies = bulkDeleteMoviesAsync;

export const movieService = {
    getMovieAsync: getMovieListAsync,
    getMovieByIdAsync: getMovieDetailAsync,
    getMovieListAsync,
    getMovieDetailAsync,
    createMovieAsync,
    updateMovieAsync,
    deleteMovieAsync,
    bulkDeleteMoviesAsync,

    // Backward-compatible names used across existing pages/components
    getMovieList: getMovieListAsync,
    getMovieDetail: getMovieDetailAsync,
    createMovie: createMovieAsync,
    updateMovie: updateMovieAsync,
    deleteMovie: deleteMovieAsync,
    bulkDeleteMovies,

    ...genreService,
    getGenres: genreService.getGenresAsync,
    createGenre: genreService.createGenreAsync,
    updateGenre: genreService.updateGenreAsync,
    deleteGenre: genreService.deleteGenreAsync,

    ...actorService,
    getActors: actorService.getActorsAsync,
    createActor: actorService.createActorAsync,
    updateActor: actorService.updateActorAsync,
    deleteActor: actorService.deleteActorAsync,

    ...studioService,
    getStudios: studioService.getStudiosAsync,
    createStudio: studioService.createStudioAsync,
    updateStudio: studioService.updateStudioAsync,
    deleteStudio: studioService.deleteStudioAsync,

    ...formatService,
    getFormats: formatService.getFormatsAsync,
    createFormat: formatService.createFormatAsync,
    updateFormat: formatService.updateFormatAsync,
    deleteFormat: formatService.deleteFormatAsync,

    ...roleService,
    getRoles: roleService.getRolesAsync,
    createRole: roleService.createRoleAsync,
    updateRole: roleService.updateRoleAsync,
    deleteRole: roleService.deleteRoleAsync,

    getRatingsAsync,
    createRatingAsync,
    updateRatingAsync,
    deleteRatingAsync,
    getRatings: getRatingsAsync,
    createRating: createRatingAsync,
    updateRating: updateRatingAsync,
    deleteRating: deleteRatingAsync,

    getDistributionsAsync,
    createDistributionAsync,
    updateDistributionAsync,
    deleteDistributionAsync,
    getDistributions: getDistributionsAsync,
    createDistribution: createDistributionAsync,
    updateDistribution: updateDistributionAsync,
    deleteDistribution: deleteDistributionAsync,
};
