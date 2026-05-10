import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PaymentOutputDto } from "./models/output.model";
export type { PaymentOutputDto };

const prefix = "/payment-service";

/** Admin/Manager: full payment list (requires Admin/Manager role). */
const getBookingListAsync = async (params: any): Promise<PagedResultDto<PaymentOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<PaymentOutputDto>>>(`${prefix}/payment-all`, { params });
    return response.data.data;
};

const getBookingByIdAsync = async (id: string): Promise<PaymentOutputDto> => {
    const response = await http.get<ApiResult<PaymentOutputDto>>(`${prefix}/payment/${id}`);
    return response.data.data;
};

export const bookingService = {
    getBookingListAsync,
    getBookingByIdAsync,
};
