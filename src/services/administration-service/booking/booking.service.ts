import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PaymentOutputDto } from "./models/output.model";
import { getRoleScopedRootPath } from "../administration.service";

export type { PaymentOutputDto };

/** Matches BE `GetPaymentListInputDto` (extends `PaginationInputDto`). */
export interface GetPaymentListParams {
    page?: number;
    fetch?: number;
    sorting?: string;
    customerId?: string;
    cinemaId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    keyword?: string;
}

const getPaymentRootPath = (): string => {
    const rolePath = getRoleScopedRootPath();
    return rolePath.replace("/administration-service", "/payment-service") + "/payment";
};

/** Paginated payment list (Admin/Manager). */
const getBookingListAsync = async (params: GetPaymentListParams): Promise<PagedResultDto<PaymentOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<PaymentOutputDto>>>(
        `${getPaymentRootPath()}/payment-all`,
        { params: { ...params, page: params.page ?? 1, fetch: params.fetch ?? 20 } },
    );
    return response.data.data;
};

/** Single payment detail. */
const getBookingByIdAsync = async (id: string): Promise<PaymentOutputDto> => {
    const response = await http.get<ApiResult<PaymentOutputDto>>(`${getPaymentRootPath()}/payment/${id}`);
    return response.data.data;
};

const MAX_REPORT_PAGES = 50;
const REPORT_PAGE_SIZE = 100;

/**
 * Fetch all payments matching filters (loops pages). Used for revenue reports and dashboard aggregation.
 * Caps at MAX_REPORT_PAGES * REPORT_PAGE_SIZE items for safety.
 */
const fetchAllPaymentsForReport = async (
    params: Omit<GetPaymentListParams, "page" | "fetch">,
): Promise<{ items: PaymentOutputDto[]; totalCount: number; capped: boolean }> => {
    const all: PaymentOutputDto[] = [];
    let totalCount = 0;
    let page = 1;

    while (page <= MAX_REPORT_PAGES) {
        const result = await getBookingListAsync({ ...params, page, fetch: REPORT_PAGE_SIZE });
        totalCount = result.totalCount;
        all.push(...(result.items || []));
        if (all.length >= totalCount || (result.items?.length ?? 0) < REPORT_PAGE_SIZE) break;
        page++;
    }

    return { items: all, totalCount, capped: all.length < totalCount };
};

export const bookingService = {
    getBookingListAsync,
    getBookingByIdAsync,
    fetchAllPaymentsForReport,
};
