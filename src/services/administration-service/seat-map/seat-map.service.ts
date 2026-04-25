import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { getRoleScopedRootPath } from "../administration.service";
import {
  CreateSeatMapInputDto,
  GetSeatMapListInputDto,
  UpdateSeatMapInputDto,
} from "./models/input.model";
import { SeatMapOutputDto } from "./models/output.model";

const path = "/seatmaps";
const subPath = "/cinema";

const getSeatMapListAsync = async (
  cinemaId: string,
  params: GetSeatMapListInputDto
): Promise<PagedResultDto<SeatMapOutputDto>> => {
  const response = await http.get<ApiResult<PagedResultDto<SeatMapOutputDto>>>(
    `${getRoleScopedRootPath()}${path}${subPath}/${cinemaId}`,
    { params }
  );
  return response.data.data;
};

const getSeatMapByIdAsync = async (id: string): Promise<SeatMapOutputDto> => {
  const response = await http.get<ApiResult<SeatMapOutputDto>>(
    `${getRoleScopedRootPath()}${path}/${id}`
  );
  return response.data.data;
};

const createSeatMapAsync = async (
  cinemaId: string,
  body: CreateSeatMapInputDto
): Promise<SeatMapOutputDto> => {
  const response = await http.post<ApiResult<SeatMapOutputDto>>(
    `${getRoleScopedRootPath()}${path}${subPath}/${cinemaId}`,
    body
  );
  return response.data.data;
};

const updateSeatMapAsync = async (
  id: string,
  body: UpdateSeatMapInputDto
): Promise<SeatMapOutputDto> => {
  const response = await http.put<ApiResult<SeatMapOutputDto>>(
    `${getRoleScopedRootPath()}${path}/${id}`,
    body
  );
  return response.data.data;
};

const deleteSeatMapAsync = async (id: string): Promise<void> => {
  await http.delete<ApiResult<void>>(`${getRoleScopedRootPath()}${path}/${id}`);
};

export const seatMapService = {
  getSeatMapListAsync,
  getSeatMapByIdAsync,
  createSeatMapAsync,
  updateSeatMapAsync,
  deleteSeatMapAsync,
};
