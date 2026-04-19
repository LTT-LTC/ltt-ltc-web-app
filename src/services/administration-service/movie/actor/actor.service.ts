import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ActorOutputDto } from "../models/output.model";
import { CreateActorInputDto } from "../models/input.model";

const rootPath = "/movie-service";
const actorPath = "/actor";

const getActorsAsync = async (): Promise<PagedResultDto<ActorOutputDto>> => {
	const response = await http.get<PagedResultDto<ActorOutputDto>>(`${rootPath}${actorPath}-all`);
	return response.data;
};

const createActorAsync = async (body: CreateActorInputDto): Promise<ActorOutputDto> => {
	const response = await http.post<ActorOutputDto>(`${rootPath}${actorPath}`, body);
	return response.data;
};

const updateActorAsync = async (id: string, body: any): Promise<ActorOutputDto> => {
	const response = await http.put<ActorOutputDto>(`${rootPath}${actorPath}/${id}`, body);
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
