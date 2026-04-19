import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import {
    GetListEmployeeInputDto,
    CreateEmployeeInputDto,
    UpdateEmployeeInputDto
} from "./models/input.model";
import { PagedResultEmployeeOutputDto, EmployeeOutputDto } from "./models/output.model";

class EmployeeService {
    private readonly prefix = "/administration-service/api/employee";

    async getList(params: GetListEmployeeInputDto): Promise<PagedResultEmployeeOutputDto> {
        const response = await http.get<ApiResult<PagedResultEmployeeOutputDto>>(this.prefix, { params });
        return response.data.data;
    }

    async getDetail(id: string): Promise<EmployeeOutputDto> {
        const response = await http.get<ApiResult<EmployeeOutputDto>>(`${this.prefix}/${id}`);
        return response.data.data;
    }

    async create(body: CreateEmployeeInputDto): Promise<string> {
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

        const response = await http.post<ApiResult<string>>(this.prefix, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data.data;
    }

    // Note: Update not yet in controller but adding common pattern
    async update(id: string, body: UpdateEmployeeInputDto): Promise<boolean> {
        const response = await http.put<ApiResult<boolean>>(`${this.prefix}/${id}`, body);
        return response.data.data;
    }
}

export const employeeService = new EmployeeService();