import http from "@/src/@core/http";
import { get } from "@/src/@core/utils/get";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

const paymentApiBase = get.rootPath("/payment-service/customer/payment");

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

export interface ManualVnpayCompletionOutputDto {
    success: boolean;
    message: string;
    bookingId: string;
    paymentRequestId?: string;
    paymentStatus?: string;
    notificationSent: boolean;
}

const unwrap = <T>(payload: ApiResult<T> | T): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as ApiResult<T>).data;
    }
    return payload as T;
};

/**
 * POST create-payment-url on customer-scoped route — uses shared http client (Bearer + X-Tenant).
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

/**
 * POST manual-complete/{bookingId} - Fallback for when IPN/browser return fail.
 * Triggers manual completion check on the backend.
 */
export const manualCompleteVnPayPaymentAsync = async (
    bookingId: string
): Promise<ManualVnpayCompletionOutputDto> => {
    const response = await http.post<ApiResult<ManualVnpayCompletionOutputDto> | ManualVnpayCompletionOutputDto>(
        `${paymentApiBase}/manual-complete/${bookingId}`
    );
    return unwrap(response.data);
};

export const vnpayPaymentService = {
    createVnPayPaymentUrlAsync,
    manualCompleteVnPayPaymentAsync,
};
