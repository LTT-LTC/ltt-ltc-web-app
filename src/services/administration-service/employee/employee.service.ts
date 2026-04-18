import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { 
    GetListEmployeeInputDto, 
    CreateEmployeeInputDto, 
    UpdateEmployeeInputDto 
} from "./models/input.model";
import { EmployeeOutputDto } from "./models/output.model";

class EmployeeService {
    private readonly prefix = "/administration-service/api/employee";

    async getList(params: GetListEmployeeInputDto): Promise<PagedResultDto<EmployeeOutputDto>> {
        const response = await http.get(this.prefix, { params });
        return response.data;
    }

    async getDetail(id: string): Promise<EmployeeOutputDto> {
        const response = await http.get(`${this.prefix}/${id}`);
        return response.data;
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

        const response = await http.post(this.prefix, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    }

    // Note: Update not yet in controller but adding common pattern
    async update(id: string, body: UpdateEmployeeInputDto): Promise<boolean> {
        const response = await http.put(`${this.prefix}/${id}`, body);
        return response.data;
    }
}

export const employeeService = new EmployeeService();