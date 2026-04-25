import { customerHeroAndBannerService } from "@/src/services/customer-service/hero-and-banner/hero-and-banner.service";
import {
    GetHeroNewsBannersInputDto,
    MovieSelectionTab,
} from "./models/input.model";
import {
    CustomerMovieOutputDto,
    CustomerNewsOfferOutputDto,
} from "./models/output.model";

const getMovieSelectionMutation = async (
    tab: MovieSelectionTab,
): Promise<CustomerMovieOutputDto[]> => {
    return customerHeroAndBannerService.getMovieSelectionAsync(tab);
};

const getHeroNewsBannersMutation = async ({
    limit,
}: GetHeroNewsBannersInputDto): Promise<CustomerNewsOfferOutputDto[]> => {
    return customerHeroAndBannerService.getHeroNewsBannersAsync(limit);
};

export {
    getMovieSelectionMutation,
    getHeroNewsBannersMutation,
};

export type {
    MovieSelectionTab,
    GetHeroNewsBannersInputDto,
};
