import { PaginationWithSearchRequestDto} from "@/src/@core/http/models/PaginationWithSearchRequestDto";

export interface GetListNewsAndOffersInputDto extends PaginationWithSearchRequestDto {
    isActive?: boolean;
    cinemaId?: string;
}

export interface UpdateNewsAndOffersInputDto {
    cinemaId?: string;
    title?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    posterUrl?: string;
}

export interface CreateNewsAndOffersInputDto {
    cinemaId?: string;
    title?: string;
    content?: string;
    startDate?: string;
    endDate?: string;
    posterUrl?: string;
}