import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { 
    GetShowtimeListInputDto, 
    CreateShowtimeDto, 
    ShowtimeOutputDto 
} from "./models/showtime.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

class ShowtimeService {
    private readonly prefix = "/ltc/administration-service/api/administration/manager/showtimes";

    async getList(params: GetShowtimeListInputDto): Promise<PagedResultDto<ShowtimeOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<ShowtimeOutputDto>>>(this.prefix, { 
            params: { 
                cinemaId: params.cinemaId,
                skipCount: (params.page - 1) * params.fetch,
                maxResultCount: params.fetch
            } 
        });
        return response.data.data;
    }

    async create(body: CreateShowtimeDto): Promise<ShowtimeOutputDto> {
        const response = await http.post<ApiResult<ShowtimeOutputDto>>(this.prefix, body);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/${id}`);
    }
}

export const showtimeService = new ShowtimeService();
