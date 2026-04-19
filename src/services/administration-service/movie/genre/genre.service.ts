import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { GenreOutputDto } from "../models/output.model";
import { CreateGenreInputDto } from "../models/input.model";

const rootPath = "/movie-service";
const genrePath = "/genre";

const getGenresAsync = async (): Promise<PagedResultDto<GenreOutputDto>> => {
	const response = await http.get<PagedResultDto<GenreOutputDto>>(`${rootPath}${genrePath}-all`);
	return response.data;
};

const createGenreAsync = async (body: CreateGenreInputDto): Promise<GenreOutputDto> => {
	const response = await http.post<GenreOutputDto>(`${rootPath}${genrePath}`, body);
	return response.data;
};

const updateGenreAsync = async (id: string, body: any): Promise<GenreOutputDto> => {
	const response = await http.put<GenreOutputDto>(`${rootPath}${genrePath}/${id}`, body);
	return response.data;
};

const deleteGenreAsync = async (id: string): Promise<void> => {
	await http.delete<void>(`${rootPath}${genrePath}/${id}`);
};

export const genreService = {
	getGenresAsync,
	createGenreAsync,
	updateGenreAsync,
	deleteGenreAsync,
};
