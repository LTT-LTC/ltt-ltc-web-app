import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { RoleOutputDto } from "../models/output.model";
import { CreateRoleInputDto } from "../models/input.model";

const rootPath = "/movie-service";
const rolePath = "/role";

const getRolesAsync = async (): Promise<PagedResultDto<RoleOutputDto>> => {
	const response = await http.get<PagedResultDto<RoleOutputDto>>(`${rootPath}${rolePath}-all`);
	return response.data;
};

const createRoleAsync = async (body: CreateRoleInputDto): Promise<RoleOutputDto> => {
	const response = await http.post<RoleOutputDto>(`${rootPath}${rolePath}`, body);
	return response.data;
};

const updateRoleAsync = async (id: string, body: any): Promise<RoleOutputDto> => {
	const response = await http.put<RoleOutputDto>(`${rootPath}${rolePath}/${id}`, body);
	return response.data;
};

const deleteRoleAsync = async (id: string): Promise<void> => {
	await http.delete<void>(`${rootPath}${rolePath}/${id}`);
};

export const roleService = {
	getRolesAsync,
	createRoleAsync,
	updateRoleAsync,
	deleteRoleAsync,
};
