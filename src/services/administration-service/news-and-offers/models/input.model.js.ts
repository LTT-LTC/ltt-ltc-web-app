import { PaginationWithSearchRequestDto} from "@/src/@core/http/models/PaginationWithSearchRequestDto";

export interface GetListNewsAndOffersInputDto extends PaginationWithSearchRequestDto {
    isActive?: boolean;
}

export interface UpdateNewsAndOffersInputDto extends PaginationWithSearchRequestDto {
    id: string;
    cinemaId?: string;
    title?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    posterUrl?: string;
}

export interface CreateNewsAndOffersInputDto extends PaginationWithSearchRequestDto {
    cinemaId?: string;
    title?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
    posterUrl?: string;
}