/** Request body item for `POST .../customer/booking`. */
export interface CreateBookingItemInputDto {
    itemType: "SEAT" | "COMBO" | "PRODUCT";
    referenceId?: string;
    variantId?: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
}

/** Request body for `POST .../customer/booking`. */
export interface CreateBookingInputDto {
    bookingId?: string;
    showtimeId: string;
    paymentMethod?: string;
    discountAmount?: number;
    items: CreateBookingItemInputDto[];
}

/** Line item snapshot for `PUT .../customer/booking/{id}/prepare-for-payment`. */
export interface PrepareBookingLineItemDto {
    itemType: "SEAT" | "COMBO" | "PRODUCT";
    referenceId?: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

/** Request body for `PUT .../customer/booking/{id}/prepare-for-payment`. */
export interface PrepareBookingForPaymentInputDto {
    showtimeId: string;
    seatCodes: string[];
    snapshotJson?: string;
    discountAmount: number;
    totalPrice: number;
    items: PrepareBookingLineItemDto[];
}
