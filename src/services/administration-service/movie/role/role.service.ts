import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { RoleOutputDto } from "./models/output.model";
import { CreateRoleInputDto, GetRoleListInputDto, UpdateRoleInputDto } from "./models/input.model";
import { getMovieRoleRootPath } from "../role-root-path";

const rolePath = "/role";

const getRolesAsync = async (
	params: GetRoleListInputDto = { page: 1, fetch: 1000 },
): Promise<PagedResultDto<RoleOutputDto>> => {
	const rootPath = `${getMovieRoleRootPath()}/movie-role`;
	const response = await http.get<PagedResultDto<RoleOutputDto>>(`${rootPath}${rolePath}-all`, { params });
	return response.data;
};

const createRoleAsync = async (body: CreateRoleInputDto): Promise<RoleOutputDto> => {
	const rootPath = `${getMovieRoleRootPath()}/movie-role`;
	const response = await http.post<RoleOutputDto>(`${rootPath}${rolePath}`, {}, { params: { Name: body.name } });
	return response.data;
};

const updateRoleAsync = async (id: string, body: UpdateRoleInputDto): Promise<RoleOutputDto> => {
	const rootPath = `${getMovieRoleRootPath()}/movie-role`;
	const response = await http.put<RoleOutputDto>(`${rootPath}${rolePath}/${id}`, {}, { params: { Name: body.name } });
	return response.data;
};

const deleteRoleAsync = async (id: string): Promise<void> => {
	const rootPath = `${getMovieRoleRootPath()}/movie-role`;
	await http.delete<void>(`${rootPath}${rolePath}/${id}`);
};

export const roleService = {
	getRolesAsync,
	createRoleAsync,
	updateRoleAsync,
	deleteRoleAsync,
};
