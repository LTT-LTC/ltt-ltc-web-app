import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import {
    GetListEmployeeInputDto,
    CreateEmployeeInputDto,
    UpdateEmployeeInputDto
} from "./models/input.model";
import { PagedResultEmployeeOutputDto, EmployeeOutputDto } from "./models/output.model";
import { rootPath } from "../administration.service";

const employeePath = "/employee";

const getEmployeeListAsync = async (params: GetListEmployeeInputDto): Promise<PagedResultEmployeeOutputDto> => {
    const response = await http.get<ApiResult<PagedResultEmployeeOutputDto>>(`${rootPath}${employeePath}`, { params });
    return response.data.data;
};

const getEmployeeByIdAsync = async (id: string): Promise<EmployeeOutputDto> => {
    const response = await http.get<ApiResult<EmployeeOutputDto>>(`${rootPath}${employeePath}/${id}`);
    return response.data.data;
};

const createEmployeeAsync = async (body: CreateEmployeeInputDto): Promise<string> => {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (key === "avatarFile" && value instanceof File) {
                formData.append("AvatarFile", value);
            } else if (value instanceof Date) {
                formData.append(key, value.toISOString());
            } else {
                formData.append(key, String(value));
            }
        }
    });

    const response = await http.post<ApiResult<string>>(`${rootPath}${employeePath}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data.data;
};

const updateEmployeeAsync = async (id: string, body: UpdateEmployeeInputDto): Promise<boolean> => {
    const response = await http.put<ApiResult<boolean>>(`${rootPath}${employeePath}/${id}`, body);
    return response.data.data;
};

const deleteEmployeeAsync = async (id: string): Promise<void> => {
    await http.delete<ApiResult<void>>(`${rootPath}${employeePath}/${id}`);
}

export const employeeService = {
    getEmployeeListAsync,
    getEmployeeByIdAsync,
    createEmployeeAsync,
    updateEmployeeAsync,
    deleteEmployeeAsync,
};