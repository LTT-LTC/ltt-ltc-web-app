import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { CustomerCinemaOutputDto } from "./models/output.model";
import { GetCustomerCinemaListInputDto } from "./models/input.model";

const rootPath = "/administration-service/customer/cinema";

const getCinemaListAsync = async (params?: GetCustomerCinemaListInputDto): Promise<CustomerCinemaOutputDto[]> => {
    const response = await http.get<ApiResult<CustomerCinemaOutputDto[]>>(rootPath, {
        params,
    });
    return response.data.data || [];
};

const getCinemaByIdAsync = async (id: string): Promise<CustomerCinemaOutputDto> => {
    const response = await http.get<ApiResult<CustomerCinemaOutputDto>>(`${rootPath}/${id}`);
    return response.data.data;
};

export const customerCinemaService = {
    getCinemaListAsync,
    getCinemaByIdAsync,
};

export type { CustomerCinemaOutputDto };
