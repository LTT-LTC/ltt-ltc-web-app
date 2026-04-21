import { customerService } from "@/src/services/customer-service/customer.service";
import { CustomerNewsOfferOutputDto } from "@/src/services/customer-service/content/models/output.model";

export type GetHeroNewsBannersInput = {
    limit: number;
};

export const getHeroNewsBannersMutation = async ({
    limit,
}: GetHeroNewsBannersInput): Promise<CustomerNewsOfferOutputDto[]> => {
    return customerService.contentService.getLatestNewsOfferBannersAsync(limit);
};
