export interface GetGenreListInputDto {
    page?: number;
    fetch?: number;
    orderBy?: string;
    isSortDesc?: boolean;
    keyword?: string;
}

export interface CreateGenreInputDto { name: string; }
export interface UpdateGenreInputDto { name: string; }
