import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
    RefundOutputDto
} from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

const paymentpath = "/payment-service/admin/refund";
const path = "/refund";

const getRefundListAsync = async (params: any): Promise<PagedResultDto<RefundOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<RefundOutputDto>>>(`${paymentpath}${path}-all`, { params });
    return response.data.data;
};

const getRefundByIdAsync = async (id: string): Promise<RefundOutputDto> => {
    const response = await http.get<ApiResult<RefundOutputDto>>(`${paymentpath}${path}/${id}`);
    return response.data.data;
};

const createRefundAsync = async (body: any): Promise<RefundOutputDto> => {
    const response = await http.post<ApiResult<RefundOutputDto>>(`${paymentpath}${path}`, body);
    return response.data.data;
};

const approveRefundAsync = async (id: string): Promise<void> => {
    await http.put<ApiResult<void>>(`${paymentpath}${path}/${id}/approve`);
};

const rejectRefundAsync = async (id: string, reason: string): Promise<void> => {
    await http.put<ApiResult<void>>(`${paymentpath}${path}/${id}/reject`, { reason });
};

export const refundService = {
    getRefundListAsync,
    getRefundByIdAsync,
    createRefundAsync,
    approveRefundAsync,
    rejectRefundAsync,
};