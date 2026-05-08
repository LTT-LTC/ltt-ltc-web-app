import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { GetCustomerShowtimeListInputDto } from "./models/input.model";
import { CustomerShowtimeOutputDto } from "./models/output.model";

const rootPath = "/administration-service/customer/showtimes";

const getShowtimeListAsync = async (params: GetCustomerShowtimeListInputDto): Promise<CustomerShowtimeOutputDto[]> => {
    const response = await http.get<ApiResult<CustomerShowtimeOutputDto[]>>(rootPath, { params });
    return response.data.data || [];
};

const getShowtimeByIdAsync = async (id: string): Promise<CustomerShowtimeOutputDto> => {
    const response = await http.get<ApiResult<CustomerShowtimeOutputDto>>(`${rootPath}/${id}`);
    return response.data.data;
};

export const customerShowtimeService = {
    getShowtimeListAsync,
    getShowtimeByIdAsync,
};
