import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { GenreOutputDto } from "./models/output.model";
import { CreateGenreInputDto, GetGenreListInputDto, UpdateGenreInputDto } from "./models/input.model";

const rootPath = "/movie-service";
const genrePath = "/genre";

const getGenresAsync = async (
	params: GetGenreListInputDto = { page: 1, fetch: 1000 },
): Promise<PagedResultDto<GenreOutputDto>> => {
	const response = await http.get<PagedResultDto<GenreOutputDto>>(`${rootPath}${genrePath}-all`, { params });
	return response.data;
};

const createGenreAsync = async (body: CreateGenreInputDto): Promise<GenreOutputDto> => {
	const response = await http.post<GenreOutputDto>(`${rootPath}${genrePath}`, {}, { params: { Name: body.name } });
	return response.data;
};

const updateGenreAsync = async (id: string, body: UpdateGenreInputDto): Promise<GenreOutputDto> => {
	const response = await http.put<GenreOutputDto>(`${rootPath}${genrePath}/${id}`, {}, { params: { Name: body.name } });
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
