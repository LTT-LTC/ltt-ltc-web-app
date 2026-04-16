import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { 
    GetScreenListInputDto, 
    CreateScreenInputDto, 
    UpdateScreenInputDto 
} from "./models/input.model";
import { ScreenOutputDto } from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

class ScreenService {
    private readonly prefix = "/ltc/administration-service/api/administration/manager/screens";

    async getListAll(cinemaId: string, params: GetScreenListInputDto): Promise<PagedResultDto<ScreenOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<ScreenOutputDto>>>(`${this.prefix}/cinema/${cinemaId}/screen-all`, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<ScreenOutputDto> {
        const response = await http.get<ApiResult<ScreenOutputDto>>(`${this.prefix}/${id}`);
        return response.data.data;
    }

    async create(cinemaId: string, body: CreateScreenInputDto): Promise<ScreenOutputDto> {
        const response = await http.post<ApiResult<ScreenOutputDto>>(`${this.prefix}/cinema/${cinemaId}`, body);
        return response.data.data;
    }

    async update(id: string, body: UpdateScreenInputDto): Promise<ScreenOutputDto> {
        const response = await http.put<ApiResult<ScreenOutputDto>>(`${this.prefix}/${id}`, body);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/${id}`);
    }
}

export const screenService = new ScreenService();
