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

    /** From joined `PaymentRequests` */
    currency?: string;
    paymentGateway?: string;
    gatewayOrderId?: string;
    paymentRequestCreatedAt?: string;
    paymentRequestExpiredAt?: string;

    /** From customer-service booking summaries (when integration configured) */
    bookingShowtimeId?: string;
    bookingStatus?: string;
    bookingSeatCodes?: string;
    bookingTotalPrice?: number;
    bookingPaidAmount?: number;
    bookingDiscountAmount?: number;
    bookingCreatedAt?: string;
    bookingExpiredAt?: string;
    bookingSnapshotJson?: string;

    /** Legacy / enriched fields if API adds projections later */
    customerName?: string;
    status?: string;
    createdAt?: string;
    movieTitle?: string;
    cinemaName?: string;
}
