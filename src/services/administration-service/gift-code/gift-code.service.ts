import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { 
    GetGiftCodeListInputDto, 
    CreateGiftCodeInputDto 
} from "../masterdata/models/commercial.model";
import { GiftCodeOutputDto } from "../masterdata/models/commercial.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

class GiftCodeService {
    private readonly prefix = "/administration-service/api/administration/admin/gift-codes";

    async getList(params: GetGiftCodeListInputDto): Promise<PagedResultDto<GiftCodeOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<GiftCodeOutputDto>>>(this.prefix, { 
            params: {
                skipCount: (params.page - 1) * params.fetch,
                maxResultCount: params.fetch
            }
        });
        return response.data.data;
    }

    async create(body: CreateGiftCodeInputDto): Promise<GiftCodeOutputDto> {
        const response = await http.post<ApiResult<GiftCodeOutputDto>>(this.prefix, body);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${this.prefix}/${id}`);
    }
}

export const giftCodeService = new GiftCodeService();
