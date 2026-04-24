import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { getRoleScopedRootPath } from "../../administration.service";
import { GetListNewsAndOffersInputDto, CreateNewsAndOffersInputDto, UpdateNewsAndOffersInputDto } from "../../news-and-offers/models/input.model";
import { NewsAndOffersOutputDto, PagedResultNewsAndOffersOutputDto } from "../../news-and-offers/models/output.model";

const path = "/news-and-offers";

export type CreateNewsAndOffersFormInput = CreateNewsAndOffersInputDto & {
  imageFile?: File;
  isActive?: boolean;
};

export type UpdateNewsAndOffersFormInput = UpdateNewsAndOffersInputDto & {
  imageFile?: File;
};

const toFormData = (body: CreateNewsAndOffersFormInput | UpdateNewsAndOffersFormInput) => {
  const formData = new FormData();
  if (body.cinemaId) formData.append("CinemaId", body.cinemaId);
  if (body.title) formData.append("Title", body.title);
  if (body.content) formData.append("Content", body.content);
  if (body.startDate) formData.append("StartDate", body.startDate);
  if (body.endDate) formData.append("EndDate", body.endDate);
  if (typeof body.posterUrl === "string") formData.append("PosterUrl", body.posterUrl);
  if (typeof body.isActive === "boolean") formData.append("IsActive", String(body.isActive));
  if (body.imageFile) formData.append("ImageFile", body.imageFile);
  return formData;
};

const getNewsAndOffersListAsync = async (params: GetListNewsAndOffersInputDto) => {
  const { data } = await http.get<ApiResult<PagedResultNewsAndOffersOutputDto>>(`${getRoleScopedRootPath()}${path}`, { params });
  return data.data;
};

const getNewsAndOffersByIdAsync = async (id: string) => {
  const { data } = await http.get<ApiResult<NewsAndOffersOutputDto>>(`${getRoleScopedRootPath()}${path}/${id}`);
  return data.data;
};

const createNewsAndOffersAsync = async (body: CreateNewsAndOffersFormInput) => {
  const { data } = await http.post<ApiResult<NewsAndOffersOutputDto>>(`${getRoleScopedRootPath()}${path}`, toFormData(body), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

const updateNewsAndOffersAsync = async (id: string, body: UpdateNewsAndOffersFormInput) => {
  const { data } = await http.put<ApiResult<NewsAndOffersOutputDto>>(`${getRoleScopedRootPath()}${path}/${id}`, toFormData(body), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

const deleteNewsAndOffersAsync = async (id: string) => {
  await http.delete<ApiResult<void>>(`${getRoleScopedRootPath()}${path}/${id}`);
};

export const managerNewsAndOffersService = {
  getNewsAndOffersListAsync,
  getNewsAndOffersByIdAsync,
  createNewsAndOffersAsync,
  updateNewsAndOffersAsync,
  deleteNewsAndOffersAsync,
};
