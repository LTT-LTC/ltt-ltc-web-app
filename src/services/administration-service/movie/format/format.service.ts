import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { FormatOutputDto } from "./models/output.model";
import { CreateFormatInputDto, GetFormatListInputDto, UpdateFormatInputDto } from "./models/input.model";

const rootPath = "/movie-service/admin/format";
const formatPath = "/format";

const getFormatsAsync = async (
	params: GetFormatListInputDto = { page: 1, fetch: 1000 },
): Promise<PagedResultDto<FormatOutputDto>> => {
	const response = await http.get<PagedResultDto<FormatOutputDto>>(`${rootPath}${formatPath}-all`, { params });
	return response.data;
};

const createFormatAsync = async (body: CreateFormatInputDto): Promise<FormatOutputDto> => {
	const response = await http.post<FormatOutputDto>(`${rootPath}${formatPath}`, {}, { params: { Name: body.name } });
	return response.data;
};

const updateFormatAsync = async (id: string, body: UpdateFormatInputDto): Promise<FormatOutputDto> => {
	const response = await http.put<FormatOutputDto>(`${rootPath}${formatPath}/${id}`, {}, { params: { Name: body.name } });
	return response.data;
};

const deleteFormatAsync = async (id: string): Promise<void> => {
	await http.delete<void>(`${rootPath}${formatPath}/${id}`);
};

export const formatService = {
	getFormatsAsync,
	createFormatAsync,
	updateFormatAsync,
	deleteFormatAsync,
};
