import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { 
    GetMovieListDto, 
    CreateMovieInputDto, 
    UpdateMovieInputDto,
    CreateGenreInputDto,
    CreateActorInputDto,
    CreateStudioInputDto,
    CreateFormatInputDto,
    CreateRoleInputDto
} from "./models/input.model";
import { 
    MovieOutputDto, 
    MovieDetailOutputDto,
    GenreOutputDto,
    ActorOutputDto,
    StudioOutputDto,
    FormatOutputDto,
    RoleOutputDto,
    MovieDistributionOutputDto
} from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

class MovieService {
    private readonly prefix = "/movie-service/api";

    // Movie CRUD
    async getMovieList(params: any): Promise<PagedResultDto<MovieOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<MovieOutputDto>>>(`${this.prefix}/movie-all`, { params });
        return response.data.data;
    }

    async getMovieDetail(id: string): Promise<MovieDetailOutputDto> {
        const response = await http.get<ApiResult<MovieDetailOutputDto>>(`${this.prefix}/movie/${id}`);
        return response.data.data;
    }

    async createMovie(body: CreateMovieInputDto): Promise<MovieOutputDto> {
        const response = await http.post<ApiResult<MovieOutputDto>>(`${this.prefix}/movie`, body);
        return response.data.data;
    }

    async updateMovie(id: string, body: UpdateMovieInputDto): Promise<MovieOutputDto> {
        const response = await http.put<ApiResult<MovieOutputDto>>(`${this.prefix}/movie/${id}`, body);
        return response.data.data;
    }

    async deleteMovie(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/movie/${id}`);
    }

    async bulkDeleteMovies(ids: string[]): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/movie`, { data: ids });
    }

    // Metadata - Genres
    async getGenres(): Promise<PagedResultDto<GenreOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<GenreOutputDto>>>(`${this.prefix}/genre-all`);
        return response.data.data;
    }

    async createGenre(body: CreateGenreInputDto): Promise<GenreOutputDto> {
        const response = await http.post<ApiResult<GenreOutputDto>>(`${this.prefix}/genre`, body);
        return response.data.data;
    }

    async updateGenre(id: string, body: any): Promise<GenreOutputDto> {
        const response = await http.put<ApiResult<GenreOutputDto>>(`${this.prefix}/genre/${id}`, body);
        return response.data.data;
    }

    async deleteGenre(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/genre/${id}`);
    }

    // Metadata - Actors
    async getActors(): Promise<PagedResultDto<ActorOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<ActorOutputDto>>>(`${this.prefix}/actor-all`);
        return response.data.data;
    }

    async createActor(body: CreateActorInputDto): Promise<ActorOutputDto> {
        const response = await http.post<ApiResult<ActorOutputDto>>(`${this.prefix}/actor`, body);
        return response.data.data;
    }

    async updateActor(id: string, body: any): Promise<ActorOutputDto> {
        const response = await http.put<ApiResult<ActorOutputDto>>(`${this.prefix}/actor/${id}`, body);
        return response.data.data;
    }

    async deleteActor(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/actor/${id}`);
    }

    // Metadata - Studios
    async getStudios(): Promise<PagedResultDto<StudioOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<StudioOutputDto>>>(`${this.prefix}/studio-all`);
        return response.data.data;
    }

    async createStudio(body: CreateStudioInputDto): Promise<StudioOutputDto> {
        const response = await http.post<ApiResult<StudioOutputDto>>(`${this.prefix}/studio`, body);
        return response.data.data;
    }

    async updateStudio(id: string, body: any): Promise<StudioOutputDto> {
        const response = await http.put<ApiResult<StudioOutputDto>>(`${this.prefix}/studio/${id}`, body);
        return response.data.data;
    }

    async deleteStudio(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/studio/${id}`);
    }

    // Metadata - Formats
    async getFormats(): Promise<PagedResultDto<FormatOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<FormatOutputDto>>>(`${this.prefix}/format-all`);
        return response.data.data;
    }

    async createFormat(body: CreateFormatInputDto): Promise<FormatOutputDto> {
        const response = await http.post<ApiResult<FormatOutputDto>>(`${this.prefix}/format`, body);
        return response.data.data;
    }

    async updateFormat(id: string, body: any): Promise<FormatOutputDto> {
        const response = await http.put<ApiResult<FormatOutputDto>>(`${this.prefix}/format/${id}`, body);
        return response.data.data;
    }

    async deleteFormat(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/format/${id}`);
    }

    // Metadata - Roles
    async getRoles(): Promise<PagedResultDto<RoleOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<RoleOutputDto>>>(`${this.prefix}/role-all`);
        return response.data.data;
    }

    async createRole(body: CreateRoleInputDto): Promise<RoleOutputDto> {
        const response = await http.post<ApiResult<RoleOutputDto>>(`${this.prefix}/role`, body);
        return response.data.data;
    }

    async updateRole(id: string, body: any): Promise<RoleOutputDto> {
        const response = await http.put<ApiResult<RoleOutputDto>>(`${this.prefix}/role/${id}`, body);
        return response.data.data;
    }

    async deleteRole(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/role/${id}`);
    }

    // Metadata - Ratings
    async getRatings(): Promise<PagedResultDto<any>> {
        const response = await http.get<ApiResult<PagedResultDto<any>>>(`${this.prefix}/rating-all`);
        return response.data.data;
    }

    async createRating(body: any): Promise<any> {
        const response = await http.post<ApiResult<any>>(`${this.prefix}/rating`, body);
        return response.data.data;
    }

    async updateRating(id: string, body: any): Promise<any> {
        const response = await http.put<ApiResult<any>>(`${this.prefix}/rating/${id}`, body);
        return response.data.data;
    }

    async deleteRating(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/rating/${id}`);
    }

    // Distributions
    async getDistributions(): Promise<PagedResultDto<MovieDistributionOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<MovieDistributionOutputDto>>>(`${this.prefix}/movie-distribution-all`);
        return response.data.data;
    }

    async createDistribution(body: any): Promise<MovieDistributionOutputDto> {
        const response = await http.post<ApiResult<MovieDistributionOutputDto>>(`${this.prefix}/movie-distribution`, body);
        return response.data.data;
    }

    async updateDistribution(id: string, body: any): Promise<MovieDistributionOutputDto> {
        const response = await http.put<ApiResult<MovieDistributionOutputDto>>(`${this.prefix}/movie-distribution/${id}`, body);
        return response.data.data;
    }

    async deleteDistribution(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/movie-distribution/${id}`);
    }
}

export const movieService = new MovieService();
