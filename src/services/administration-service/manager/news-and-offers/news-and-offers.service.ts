import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { rootPath } from "../../administration.service";
import { GetListNewsAndOffersInputDto, CreateNewsAndOffersInputDto, UpdateNewsAndOffersInputDto } from "../../news-and-offers/models/input.model";
import { NewsAndOffersOutputDto, PagedResultNewsAndOffersOutputDto } from "../../news-and-offers/models/output.model";

const path = "/news-and-offers";

const getNewsAndOffersListAsync = async (params: GetListNewsAndOffersInputDto) => {
  const { data } = await http.get<ApiResult<PagedResultNewsAndOffersOutputDto>>(`${rootPath}${path}`, { params });
  return data.data;
};

const getNewsAndOffersByIdAsync = async (id: string) => {
  const { data } = await http.get<ApiResult<NewsAndOffersOutputDto>>(`${rootPath}${path}/${id}`);
  return data.data;
};

const createNewsAndOffersAsync = async (body: CreateNewsAndOffersInputDto) => {
  const { data } = await http.post<ApiResult<string>>(`${rootPath}${path}`, body);
  return data.data;
};

const updateNewsAndOffersAsync = async (id: string, body: UpdateNewsAndOffersInputDto) => {
  const { data } = await http.put<ApiResult<boolean>>(`${rootPath}${path}/${id}`, body);
  return data.data;
};

const deleteNewsAndOffersAsync = async (id: string) => {
  const { data } = await http.delete<ApiResult<boolean>>(`${rootPath}${path}/${id}`);
  return data.data;
};

export const managerNewsAndOffersService = {
  getNewsAndOffersListAsync,
  getNewsAndOffersByIdAsync,
  createNewsAndOffersAsync,
  updateNewsAndOffersAsync,
  deleteNewsAndOffersAsync,
};
