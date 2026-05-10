import http from "@/src/@core/http";
import { get } from "@/src/@core/utils/get";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

const paymentApiBase = get.rootPath("/payment-service/api/payment");

export interface CreateVnPayPaymentUrlInputDto {
    bookingId: string;
    /** Amount in VND (major units, integer). */
    amount: number;
    orderInfo: string;
    locale?: string;
    bankCode?: string;
}

export interface CreateVnPayPaymentUrlOutputDto {
    paymentUrl: string;
}

const unwrap = <T>(payload: ApiResult<T> | T): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as ApiResult<T>).data;
    }
    return payload as T;
};

/**
 * POST create-payment-url — uses shared http client (Bearer + X-Tenant) like other customer calls.
 */
export const createVnPayPaymentUrlAsync = async (
    input: CreateVnPayPaymentUrlInputDto
): Promise<string> => {
    const response = await http.post<ApiResult<CreateVnPayPaymentUrlOutputDto> | CreateVnPayPaymentUrlOutputDto>(
        `${paymentApiBase}/create-payment-url`,
        {
            bookingId: input.bookingId,
            amount: input.amount,
            orderInfo: input.orderInfo,
            locale: input.locale,
            bankCode: input.bankCode,
        }
    );
    const dto = unwrap(response.data);
    return dto.paymentUrl;
};

export const vnpayPaymentService = {
    createVnPayPaymentUrlAsync,
};
