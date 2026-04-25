export interface GetCinemaListInputDto {
    page: number;
    fetch: number;
    keyword?: string;
    status?: string;
}

export interface CreateCinemaInputDto {
    name: string;
    address?: string;
    city?: string;
    ward?: string;
    managerUserId?: string;
    serviceNumber?: string;
    status?: string;
}

export interface UpdateCinemaInputDto {
    name: string;
    address?: string;
    city?: string;
    ward?: string;
    managerUserId?: string;
    serviceNumber?: string;
    status?: string;
}
