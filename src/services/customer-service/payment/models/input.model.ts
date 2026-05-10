/**
 * Query for `GET /payment-service/customer/payment/my-payments`.
 * Aligns with `GetPaymentListInputDto` / `PaginationInputDto` (camelCase query params).
 */
export interface GetMyPaymentsInputDto {
    page: number;
    fetch: number;
    /** Optional filters — wire when UI exposes them */
    customerId?: string;
    cinemaId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    orderBy?: string;
    isSortDesc?: boolean;
    keyword?: string;
}
