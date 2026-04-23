import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { rootPath } from "../../administration.service";
import { CreatePricingRuleInputDto, UpdatePricingRuleInputDto } from "../../pricing-rule/models/input.model";
import { PricingRuleOutputDto } from "../../pricing-rule/models/output.model";
import { toAbpPaginationParams } from "../../_shared/pagination";

const pricingPath = "/pricing";
const subPath = "/cinema";

const getPricingRuleListAsync = async (cinemaId: string, page: number = 1, fetch: number = 10): Promise<PagedResultDto<PricingRuleOutputDto>> => {
  const response = await http.get<ApiResult<PagedResultDto<PricingRuleOutputDto>>>(`${rootPath}${subPath}/${cinemaId}${pricingPath}-all`, {
    params: toAbpPaginationParams({ page, fetch }),
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

export const managerPricingRulesService = {
  getPricingRuleListAsync,
  createPricingRuleAsync,
  updatePricingRuleAsync,
  deletePricingRuleAsync,
};
