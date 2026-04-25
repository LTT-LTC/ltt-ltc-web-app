export interface PaymentOutputDto {
    id: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    // Map from extra properties if needed
    movieTitle?: string;
    cinemaName?: string;
}