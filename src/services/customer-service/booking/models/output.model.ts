/** Response from customer booking endpoints (create / prepare / patch payment method). */
export interface BookingOutputDto {
    id: string;
    userId?: string;
    showtimeId: string;
    bookingStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    discountAmount: number;
    totalPrice: number;
    paidAmount?: number;
    createdAt?: string;
    updatedAt?: string;
    expiredAt?: string;
}
