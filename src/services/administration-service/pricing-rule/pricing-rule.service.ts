import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import {
    CreatePricingRuleInputDto,
    UpdatePricingRuleInputDto
} from "./models/input.model";
import { PricingRuleOutputDto } from "./models/output.model";
import { rootPath } from "../administration.service";

const pricingPath = "/pricing";
const subPath = "/cinema";

const getPricingRuleListAsync = async (cinemaId: string, skip: number = 0, count: number = 10): Promise<PagedResultDto<PricingRuleOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<PricingRuleOutputDto>>>(`${rootPath}${subPath}/${cinemaId}${pricingPath}-all`, {
        params: { skipCount: skip, maxResultCount: count }
    });
    return response.data.data;
};

const createPricingRuleAsync = async (cinemaId: string, body: CreatePricingRuleInputDto): Promise<PricingRuleOutputDto> => {
    const response = await http.post<ApiResult<PricingRuleOutputDto>>(`${rootPath}${subPath}/${cinemaId}${pricingPath}`, body);
    return response.data.data;
};

const updatePricingRuleAsync = async (cinemaId: string, id: string, body: UpdatePricingRuleInputDto): Promise<PricingRuleOutputDto> => {
    const response = await http.put<ApiResult<PricingRuleOutputDto>>(`${rootPath}${subPath}/${cinemaId}${pricingPath}/${id}`, body);
    return response.data.data;
};

const deletePricingRuleAsync = async (cinemaId: string, id: string): Promise<void> => {
    await http.delete(`${rootPath}${subPath}/${cinemaId}${pricingPath}/${id}`);
};



export const pricingRuleService = {
    getPricingRuleListAsync,
    createPricingRuleAsync,
    updatePricingRuleAsync,
    deletePricingRuleAsync,
};