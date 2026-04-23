import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { rootPath } from "../../administration.service";
import { GetGiftCodeListInputDto } from "../../gift-code/models/input.model";
import { GiftCodeOutputDto } from "../../gift-code/models/output.model";
import { GetListNewsAndOffersInputDto } from "../../news-and-offers/models/input.model";
import { NewsAndOffersOutputDto, PagedResultNewsAndOffersOutputDto } from "../../news-and-offers/models/output.model";
import { toAbpPaginationParams } from "../../_shared/pagination";

const giftCardPath = "/gift-codes";
const promotionsPath = "/news-and-offers";

const getGiftCardListAsync = async (params: GetGiftCodeListInputDto): Promise<PagedResultDto<GiftCodeOutputDto>> => {
  const response = await http.get<ApiResult<PagedResultDto<GiftCodeOutputDto>>>(`${rootPath}${giftCardPath}`, {
    params: toAbpPaginationParams(params),
  });
  return response.data.data;
};

const getPromotionListAsync = async (params: GetListNewsAndOffersInputDto): Promise<PagedResultNewsAndOffersOutputDto> => {
  const response = await http.get<ApiResult<PagedResultNewsAndOffersOutputDto>>(`${rootPath}${promotionsPath}`, {
    params,
  });
  return response.data.data;
};

const getPromotionByIdAsync = async (id: string): Promise<NewsAndOffersOutputDto> => {
  const response = await http.get<ApiResult<NewsAndOffersOutputDto>>(`${rootPath}${promotionsPath}/${id}`);
  return response.data.data;
};

export const managerPromotionGiftcardService = {
  getGiftCardListAsync,
  getPromotionListAsync,
  getPromotionByIdAsync,
};
