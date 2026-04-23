import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { StudioOutputDto } from "./models/output.model";
import { CreateStudioInputDto, GetStudioListInputDto, UpdateStudioInputDto } from "./models/input.model";

const rootPath = "/movie-service/admin/studio";
const studioPath = "/studio";

const getStudiosAsync = async (
	params: GetStudioListInputDto = { page: 1, fetch: 1000 },
): Promise<PagedResultDto<StudioOutputDto>> => {
	const response = await http.get<PagedResultDto<StudioOutputDto>>(`${rootPath}${studioPath}-all`, { params });
	return response.data;
};

const createStudioAsync = async (body: CreateStudioInputDto): Promise<StudioOutputDto> => {
	const response = await http.post<StudioOutputDto>(`${rootPath}${studioPath}`, {}, { params: { Name: body.name } });
	return response.data;
};

const updateStudioAsync = async (id: string, body: UpdateStudioInputDto): Promise<StudioOutputDto> => {
	const response = await http.put<StudioOutputDto>(`${rootPath}${studioPath}/${id}`, {}, { params: { Name: body.name } });
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
