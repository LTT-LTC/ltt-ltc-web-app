import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import type { GetCustomerShowtimeListInputDto, HoldSeatsInputDto } from "./models/input.model";
import type { CustomerShowtimeOutputDto, HoldSeatsOutputDto } from "./models/output.model";

const rootPath = "/administration-service/customer/showtimes";

const unwrap = <T>(payload: ApiResult<T> | T): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as ApiResult<T>).data;
    }
    return payload as T;
};

const getShowtimeListAsync = async (params: GetCustomerShowtimeListInputDto): Promise<CustomerShowtimeOutputDto[]> => {
    const response = await http.get<ApiResult<CustomerShowtimeOutputDto[]>>(rootPath, { params });
    return response.data.data || [];
};

const getShowtimeByIdAsync = async (id: string): Promise<CustomerShowtimeOutputDto> => {
    const response = await http.get<ApiResult<CustomerShowtimeOutputDto>>(`${rootPath}/${id}`);
    return response.data.data;
};

const holdSeatsAsync = async (body: HoldSeatsInputDto): Promise<HoldSeatsOutputDto> => {
    const response = await http.post<ApiResult<HoldSeatsOutputDto>>(`${rootPath}/seat-hold`, body);
    return unwrap(response.data);
};

const releaseSeatHoldAsync = async (showtimeId: string, sessionKey: string): Promise<void> => {
    await http.delete(`${rootPath}/seat-hold`, { params: { showtimeId, sessionKey } });
};

export const customerShowtimeService = {
    getShowtimeListAsync,
    getShowtimeByIdAsync,
    holdSeatsAsync,
    releaseSeatHoldAsync,
};

export type { CustomerShowtimeOutputDto, HoldSeatsOutputDto, ShowtimeMovieDto } from "./models/output.model";
export type { GetCustomerShowtimeListInputDto, HoldSeatsInputDto } from "./models/input.model";
