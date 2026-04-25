import { customerContentService } from "../content/content.service";
import {
	GetHeroNewsBannersInputDto,
	MovieSelectionTab,
} from "./models/input.model";
import {
	CustomerMovieOutputDto,
	CustomerNewsOfferOutputDto,
} from "./models/output.model";

const getMovieSelectionAsync = async (
	tab: MovieSelectionTab,
): Promise<CustomerMovieOutputDto[]> => {
	if (tab === "coming_soon") {
		return customerContentService.getComingSoonMoviesAsync();
	}

	return customerContentService.getNowShowingMoviesAsync();
};

const getHeroNewsBannersAsync = async (
	limit: number,
): Promise<CustomerNewsOfferOutputDto[]> => {
	const input: GetHeroNewsBannersInputDto = { limit };
	return customerContentService.getLatestNewsOfferBannersAsync(input.limit);
};

export const customerHeroAndBannerService = {
	getMovieSelectionAsync,
	getHeroNewsBannersAsync,

	getMovieSelection: getMovieSelectionAsync,
	getHeroNewsBanners: getHeroNewsBannersAsync,
};

export type {
	MovieSelectionTab,
	GetHeroNewsBannersInputDto,
	CustomerMovieOutputDto,
	CustomerNewsOfferOutputDto,
};
