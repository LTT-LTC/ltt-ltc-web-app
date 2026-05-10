import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import type { GetMyPaymentsInputDto } from "./models/input.model";
import type { PaymentOutputDto } from "./models/output.model";

const customerPaymentPrefix = "/payment-service/customer/payment";

/** Matches Payment API `CustomerPaymentController` — scoped to logged-in customer. */
const getMyPaymentsAsync = async (
    params: GetMyPaymentsInputDto,
): Promise<PagedResultDto<PaymentOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<PaymentOutputDto>>>(
        `${customerPaymentPrefix}/my-payments`,
        { params },
    );
    return response.data.data;
};

const getMyPaymentByIdAsync = async (id: string): Promise<PaymentOutputDto> => {
    const response = await http.get<ApiResult<PaymentOutputDto>>(`${customerPaymentPrefix}/${id}`);
    return response.data.data;
};

export const customerPaymentService = {
    getMyPaymentsAsync,
    getMyPaymentByIdAsync,
};

export type { PaymentOutputDto, GetMyPaymentsInputDto };
