export interface RefundOutputDto {
    id: string;
    customerName: string;
    customerEmail?: string;
    amount: number;
    reason: string;
    status: "pending" | "approved" | "rejected";
    processedAt?: string;
    processedBy?: string;
    movieTitle?: string;
    cinemaName?: string;
    showDate?: string;
    showTime?: string;
    ticketCount?: number;
}
