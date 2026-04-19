export interface RefundListInputDto {
    page: number;
    pageSize: number;
}

export interface ApproveRefundInputDto {
    id: string;
}

export interface RejectRefundInputDto {
    id: string;
    reason: string;
}
