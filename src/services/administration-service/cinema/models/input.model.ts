export interface GetCinemaListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
    provinceRaw?: string;
    managerId?: string;
    status?: string;
}

export interface CreateCinemaInputDto {
    name: string;
    address: string;
    provinceRaw: string;
}

export interface UpdateCinemaInputDto {
    name: string;
    address: string;
    provinceRaw: string;
}
