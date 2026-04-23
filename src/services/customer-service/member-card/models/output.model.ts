export interface MemberCardOutputDto {
    id: string;
    cardNumber: string;
    customerId: string;
    memberTierId?: string;
    currentPoints: number;
    totalSpent: number;
    issuedDate?: string;
    expiryDate?: string;
    status?: string;
}

export interface PointTransactionOutputDto {
    id: string;
    memberCardId: string;
    type?: string;
    pointNumber: number;
    createdAt?: string;
}

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
