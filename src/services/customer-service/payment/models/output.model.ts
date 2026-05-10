/** Aligns with Payment Service `PaymentOutputDto` (camelCase JSON). */
export interface PaymentOutputDto {
    id: string;
    tenantId?: string;
    paymentRequestId?: string;
    bookingId?: string;
    amount: number;
    paymentMethod?: string;
    paymentStatus?: string;
    paidTime?: string;
    gatewayTransactionId?: string;
    gatewayResponseCode?: string;
    gatewayRawResponse?: string;
    /** Legacy / enriched fields if API adds projections later */
    customerName?: string;
    status?: string;
    createdAt?: string;
    movieTitle?: string;
    cinemaName?: string;
}
