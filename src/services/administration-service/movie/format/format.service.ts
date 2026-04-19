import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { FormatOutputDto } from "../models/output.model";
import { CreateFormatInputDto } from "../models/input.model";

const rootPath = "/movie-service";
const formatPath = "/format";

const getFormatsAsync = async (): Promise<PagedResultDto<FormatOutputDto>> => {
	const response = await http.get<PagedResultDto<FormatOutputDto>>(`${rootPath}${formatPath}-all`);
	return response.data;
};

const createFormatAsync = async (body: CreateFormatInputDto): Promise<FormatOutputDto> => {
	const response = await http.post<FormatOutputDto>(`${rootPath}${formatPath}`, body);
	return response.data;
};

const updateFormatAsync = async (id: string, body: any): Promise<FormatOutputDto> => {
	const response = await http.put<FormatOutputDto>(`${rootPath}${formatPath}/${id}`, body);
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
