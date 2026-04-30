import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { FormatOutputDto } from "./models/output.model";
import { CreateFormatInputDto, GetFormatListInputDto, UpdateFormatInputDto } from "./models/input.model";
import { getMovieRoleRootPath } from "../role-root-path";

const formatPath = "/format";

const getFormatsAsync = async (
	params: GetFormatListInputDto = { page: 1, fetch: 1000 },
): Promise<PagedResultDto<FormatOutputDto>> => {
	const rootPath = `${getMovieRoleRootPath()}/format`;
	const response = await http.get<PagedResultDto<FormatOutputDto>>(`${rootPath}${formatPath}-all`, { params });
	return response.data;
};

const createFormatAsync = async (body: CreateFormatInputDto): Promise<FormatOutputDto> => {
	const rootPath = `${getMovieRoleRootPath()}/format`;
	const response = await http.post<FormatOutputDto>(`${rootPath}${formatPath}`, {}, { params: { Name: body.name } });
	return response.data;
};

const updateFormatAsync = async (id: string, body: UpdateFormatInputDto): Promise<FormatOutputDto> => {
	const rootPath = `${getMovieRoleRootPath()}/format`;
	const response = await http.put<FormatOutputDto>(`${rootPath}${formatPath}/${id}`, {}, { params: { Name: body.name } });
	return response.data;
};

const deleteFormatAsync = async (id: string): Promise<void> => {
	const rootPath = `${getMovieRoleRootPath()}/format`;
	await http.delete<void>(`${rootPath}${formatPath}/${id}`);
};

export const formatService = {
	getFormatsAsync,
	createFormatAsync,
	updateFormatAsync,
	deleteFormatAsync,
};
