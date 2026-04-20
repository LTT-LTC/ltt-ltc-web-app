export interface GetActorListInputDto {
    page?: number;
    fetch?: number;
    orderBy?: string;
    isSortDesc?: boolean;
    keyword?: string;
}

export interface CreateActorInputDto { name: string; }
export interface UpdateActorInputDto { name: string; }
