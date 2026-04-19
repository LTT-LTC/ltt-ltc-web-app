import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { 
    CreatePricingRuleInputDto, 
    PricingRuleOutputDto 
} from "../masterdata/models/commercial.model";

class PricingRuleService {
    private readonly prefix = "/administration-service/api/administration/manager/cinema";

    async getList(cinemaId: string, skip: number = 0, count: number = 10): Promise<PagedResultDto<PricingRuleOutputDto>> {
        const response = await http.get(`${this.prefix}/${cinemaId}/pricing-rule-all`, { 
            params: { skipCount: skip, maxResultCount: count } 
        });
        return response.data;
    }

    async create(cinemaId: string, body: CreatePricingRuleInputDto): Promise<PricingRuleOutputDto> {
        const response = await http.post(`${this.prefix}/${cinemaId}/pricing-rule`, body);
        return response.data;
    }

    async delete(cinemaId: string, id: string): Promise<void> {
        await http.delete(`${this.prefix}/${cinemaId}/pricing-rule/${id}`);
    }
}

export const pricingRuleService = new PricingRuleService();
