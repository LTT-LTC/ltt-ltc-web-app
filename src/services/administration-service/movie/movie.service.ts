import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
    GetMovieListInputDto as GetMovieListDto,
    CreateMovieInputDto,
    UpdateMovieInputDto,
    GetRatingListInputDto,
    CreateRatingInputDto,
    UpdateRatingInputDto,
    GetDistributionListInputDto,
    CreateDistributionInputDto,
    UpdateDistributionInputDto,
    CreateDistributionRequestParams,
    UpdateDistributionRequestParams,
} from "./models/input.model";
import {
    MovieOutputDto,
    MovieDetailOutputDto,
    RatingOutputDto,
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
const mediaFilePath = "/media-files";

export interface UploadMoviePosterOutputDto {
    secureUrl: string;
    publicId: string;
    displayName: string;
    format?: string;
    size: number;
}

const getMovieListAsync = async (params: GetMovieListDto): Promise<PagedResultDto<MovieOutputDto>> => {
    const response = await http.get<PagedResultDto<MovieOutputDto>>(`${rootPath}${moviePath}-all`, { params });
    return response.data;
};

const getMovieDetailAsync = async (id: string): Promise<MovieDetailOutputDto> => {
    const response = await http.get<MovieDetailOutputDto>(`${rootPath}${moviePath}/${id}`);
    return response.data;
};

const appendMovieField = (formData: FormData, key: string, value?: string | number | boolean | null) => {
    if (value === undefined || value === null || value === "") {
        return;
    }

    formData.append(key, String(value));
};

const appendMovieActorRoles = (formData: FormData, actorRoles?: CreateMovieInputDto["actorRoles"]) => {
    if (!actorRoles || actorRoles.length === 0) {
        return;
    }

    actorRoles.forEach((item, index) => {
        appendMovieField(formData, `ActorRoles[${index}].ActorName`, item.actorName);
        appendMovieField(formData, `ActorRoles[${index}].RoleName`, item.roleName);
    });
};

const appendMovieGenres = (formData: FormData, genreListId?: string[]) => {
    if (!genreListId || genreListId.length === 0) {
        return;
    }

    genreListId.forEach((item, index) => appendMovieField(formData, `GenreListId[${index}]`, item));
};

const buildMovieFormData = (body: CreateMovieInputDto | UpdateMovieInputDto): FormData => {
    const formData = new FormData();

    appendMovieField(formData, "Id", body.id);
    appendMovieField(formData, "Title", body.title);
    appendMovieField(formData, "OriginalTitle", body.originalTitle);
    appendMovieField(formData, "DurationMins", body.durationMins);
    appendMovieField(formData, "ReleaseDate", body.releaseDate);
    appendMovieField(formData, "PremiereDate", body.premiereDate);
    appendMovieField(formData, "Status", body.status);
    appendMovieField(formData, "Description", body.description);
    appendMovieField(formData, "PosterUrl", body.posterUrl);
    appendMovieField(formData, "TrailerUrl", body.trailerUrl);
    appendMovieField(formData, "StudioId", body.studioId);
    appendMovieField(formData, "StudioName", body.studioName);
    appendMovieField(formData, "RatingId", body.ratingId);
    appendMovieField(formData, "RatingNumber", body.ratingNumber);

    appendMovieGenres(formData, body.genreListId);
    appendMovieActorRoles(formData, body.actorRoles);

    if (body.imageFile) {
        formData.append("ImageFile", body.imageFile);
    }

    return formData;
};

const createMovieAsync = async (body: CreateMovieInputDto): Promise<MovieOutputDto> => {
    const formData = buildMovieFormData(body);
    const response = await http.post<MovieOutputDto>(`${rootPath}${moviePath}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

const updateMovieAsync = async (id: string, body: UpdateMovieInputDto): Promise<MovieOutputDto> => {
    const formData = buildMovieFormData(body);
    const response = await http.put<MovieOutputDto>(`${rootPath}${moviePath}/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

const deleteMovieAsync = async (id: string): Promise<void> => {
    await http.delete<void>(`${rootPath}${moviePath}/${id}`);
};

const uploadMoviePosterAsync = async (imageFile: File): Promise<UploadMoviePosterOutputDto> => {
    const formData = new FormData();
    formData.append("ImageFile", imageFile);
    const response = await http.post<UploadMoviePosterOutputDto>(`${rootPath}${mediaFilePath}/poster`, formData);
    return response.data;
};

const bulkDeleteMoviesAsync = async (ids: string[]): Promise<void> => {
    await http.delete<void>(`${rootPath}${moviePath}`, { data: ids });
};

const getRatingsAsync = async (
    params: GetRatingListInputDto = { page: 1, fetch: 1000 },
): Promise<PagedResultDto<RatingOutputDto>> => {
    const response = await http.get<PagedResultDto<RatingOutputDto>>(`${rootPath}${ratingPath}-all`, { params });
    return response.data;
};

const createRatingAsync = async (body: CreateRatingInputDto): Promise<RatingOutputDto> => {
    const response = await http.post<RatingOutputDto>(`${rootPath}${ratingPath}`, {}, {
        params: {
            Code: body.code,
            Name: body.name,
            Description: body.description,
        },
    });
    return response.data;
};

const updateRatingAsync = async (id: string, body: UpdateRatingInputDto): Promise<RatingOutputDto> => {
    const response = await http.put<RatingOutputDto>(`${rootPath}${ratingPath}/${id}`, {}, {
        params: {
            Code: body.code,
            Name: body.name,
            Description: body.description,
        },
    });
    return response.data;
};

const deleteRatingAsync = async (id: string): Promise<void> => {
    await http.delete<void>(`${rootPath}${ratingPath}/${id}`);
};

const getDistributionsAsync = async (
    params: GetDistributionListInputDto = { skipCount: 0, maxResultCount: 100 },
): Promise<PagedResultDto<MovieDistributionOutputDto>> => {
    const response = await http.get<PagedResultDto<MovieDistributionOutputDto>>(`${rootPath}${distributionPath}-all`, { params });
    return response.data;
};

const toCreateDistributionParams = (body: CreateDistributionInputDto): CreateDistributionRequestParams => ({
    MovieId: body.movieId,
    LicenseStartDate: body.licenseStartDate,
    LicenseEndDate: body.licenseEndDate,
    IsExclusive: body.isExclusive,
});

const toUpdateDistributionParams = (body: UpdateDistributionInputDto): UpdateDistributionRequestParams => ({
    LicenseStartDate: body.licenseStartDate,
    LicenseEndDate: body.licenseEndDate,
    IsExclusive: body.isExclusive,
});

const createDistributionAsync = async (body: CreateDistributionInputDto): Promise<MovieDistributionOutputDto> => {
    const params = toCreateDistributionParams(body);
    const response = await http.post<MovieDistributionOutputDto>(`${rootPath}${distributionPath}`, {}, {
        params,
    });
    return response.data;
};

const updateDistributionAsync = async (id: string, body: UpdateDistributionInputDto): Promise<MovieDistributionOutputDto> => {
    const params = toUpdateDistributionParams(body);
    const response = await http.put<MovieDistributionOutputDto>(`${rootPath}${distributionPath}/${id}`, {}, {
        params,
    });
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
    uploadMoviePosterAsync,
    bulkDeleteMoviesAsync,

    // Backward-compatible names used across existing pages/components
    getMovieList: getMovieListAsync,
    getMovieDetail: getMovieDetailAsync,
    createMovie: createMovieAsync,
    updateMovie: updateMovieAsync,
    deleteMovie: deleteMovieAsync,
    uploadMoviePoster: uploadMoviePosterAsync,
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
