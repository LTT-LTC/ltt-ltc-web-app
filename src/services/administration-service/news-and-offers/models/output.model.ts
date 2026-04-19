import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export interface NewsAndOffersOutputDto {
    id: string;
    cinemaId?: string;
    title: string;
    content: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    posterUrl?: string;
    createdAt: string;
}

export interface PagedResultNewsAndOffersOutputDto extends PagedResultDto<NewsAndOffersOutputDto> {
    extendData: Record<string, any>;
}
