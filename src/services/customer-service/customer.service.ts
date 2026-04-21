import { get } from "@/src/@core/utils/get";
import { customerAuthService } from "./auth/auth.service";
import { customerContentService } from "./content/content.service";

export const rootCustomerPath: string = get.rootPath("/customer-service/api");

export const customerService = {
    authService: customerAuthService,
    contentService: customerContentService,
};