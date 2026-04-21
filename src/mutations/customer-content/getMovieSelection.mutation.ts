import { customerService } from "@/src/services/customer-service/customer.service";
import { CustomerMovieOutputDto } from "@/src/services/customer-service/content/models/output.model";

export type MovieSelectionTab = "now_showing" | "coming_soon";

export const getMovieSelectionMutation = async (
    tab: MovieSelectionTab,
): Promise<CustomerMovieOutputDto[]> => {
    if (tab === "coming_soon") {
        return customerService.contentService.getComingSoonMoviesAsync();
    }

    return customerService.contentService.getNowShowingMoviesAsync();
};
