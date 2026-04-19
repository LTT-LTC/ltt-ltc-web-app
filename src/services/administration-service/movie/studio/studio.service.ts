import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { StudioOutputDto } from "../models/output.model";
import { CreateStudioInputDto } from "../models/input.model";

const rootPath = "/movie-service";
const studioPath = "/studio";

const getStudiosAsync = async (): Promise<PagedResultDto<StudioOutputDto>> => {
	const response = await http.get<PagedResultDto<StudioOutputDto>>(`${rootPath}${studioPath}-all`);
	return response.data;
};

const createStudioAsync = async (body: CreateStudioInputDto): Promise<StudioOutputDto> => {
	const response = await http.post<StudioOutputDto>(`${rootPath}${studioPath}`, body);
	return response.data;
};

const updateStudioAsync = async (id: string, body: any): Promise<StudioOutputDto> => {
	const response = await http.put<StudioOutputDto>(`${rootPath}${studioPath}/${id}`, body);
	return response.data;
};

const deleteStudioAsync = async (id: string): Promise<void> => {
	await http.delete<void>(`${rootPath}${studioPath}/${id}`);
};

export const studioService = {
	getStudiosAsync,
	createStudioAsync,
	updateStudioAsync,
	deleteStudioAsync,
};
