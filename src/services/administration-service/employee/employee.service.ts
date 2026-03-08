import http from "@/src/@core/http";
import {
    GetListEmployeeInputDto,
    UpdateEmployeeInputDto,
} from "./models/input.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { rootPath } from "../administration.service";
import {
    EmployeeOutputDto,
    PagedResultEmployeeOutputDto
} from "./models/output.model";

const path = "/employee";

const getListAsync = async (params: GetListEmployeeInputDto) => {
    const { data } = await http.get<ApiResult<PagedResultEmployeeOutputDto>>(
        `${rootPath}${path}`,
        { params },
    );

    return data.data;
};

const getEmployeeDetailAsync = async (employeeId: string) => {
    const { data } = await http.get<ApiResult<EmployeeOutputDto>>(
        `${rootPath}${path}/${employeeId}`,
    );

    return data.data;
};

const updateEmployeeAsync = async (employeeId: string, body: FormData) => {
    const { data } = await http.put<ApiResult<boolean>>(
        `${rootPath}${path}/${employeeId}`,
        body,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    );

    return data.data;
};

const createEmployeeAsync = async (body: FormData) => {
    const { data } = await http.post<ApiResult<string>>(
        `${rootPath}${path}`,
        body,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    );

    return data.data;
};

export const employeeService = {
    getEmployeeDetailAsync,
    updateEmployeeAsync,
    getListAsync,
    createEmployeeAsync,
}