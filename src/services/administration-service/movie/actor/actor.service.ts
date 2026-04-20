import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ActorOutputDto } from "./models/output.model";
import { CreateActorInputDto, GetActorListInputDto, UpdateActorInputDto } from "./models/input.model";

const rootPath = "/movie-service";
const actorPath = "/actor";

const getActorsAsync = async (
	params: GetActorListInputDto = { page: 1, fetch: 1000 },
): Promise<PagedResultDto<ActorOutputDto>> => {
	const response = await http.get<PagedResultDto<ActorOutputDto>>(`${rootPath}${actorPath}-all`, { params });
	return response.data;
};

const createActorAsync = async (body: CreateActorInputDto): Promise<ActorOutputDto> => {
	const response = await http.post<ActorOutputDto>(`${rootPath}${actorPath}`, {}, { params: { Name: body.name } });
	return response.data;
};

const updateActorAsync = async (id: string, body: UpdateActorInputDto): Promise<ActorOutputDto> => {
	const response = await http.put<ActorOutputDto>(`${rootPath}${actorPath}/${id}`, {}, { params: { Name: body.name } });
	return response.data;
};

const deleteActorAsync = async (id: string): Promise<void> => {
	await http.delete<void>(`${rootPath}${actorPath}/${id}`);
};

export const actorService = {
	getActorsAsync,
	createActorAsync,
	updateActorAsync,
	deleteActorAsync,
};
