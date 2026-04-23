import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { rootPath } from "../../administration.service";
import { GetSeatTypeListInputDto } from "../../seat-type/models/input.model";
import { SeatTypeOutputDto } from "../../seat-type/models/output.model";

const path = "/seat-type";

const getSeatTypeListAsync = async (params: GetSeatTypeListInputDto) => {
  const { data } = await http.get<ApiResult<PagedResultDto<SeatTypeOutputDto>>>(`${rootPath}${path}`, {
    params,
  });
  return data.data;
};

const getSeatTypeByIdAsync = async (id: string) => {
  const { data } = await http.get<ApiResult<SeatTypeOutputDto>>(`${rootPath}${path}/${id}`);
  return data.data;
};

export const managerSeatTypeService = {
  getSeatTypeListAsync,
  getSeatTypeByIdAsync,
};
