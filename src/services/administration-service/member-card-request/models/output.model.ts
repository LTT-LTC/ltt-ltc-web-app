export interface MemberCardRequestOutputDto {
    id: string;
    customerId: string;
    targetMemberCardId?: string;
    requestType: string;
    requestStatus: string;
    requestNote?: string;
    reviewNote?: string;
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}
