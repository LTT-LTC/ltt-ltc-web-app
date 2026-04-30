import { get } from "@/src/@core/utils/get";
import { ADMIN_ACCESS_TOKEN_KEY } from "@/src/@core/const";
import { getCookie } from "@/src/@core/utils/cookie";
import { AdminRole } from "@/src/@core/type/permission.types";
import { resolveAdminRoleFromToken } from "@/src/@core/utils/admin-auth";
import { authService } from "./auth/auth.service";
import { employeeService } from "./employee/employee.service";
import { newsAndOffersService } from "./news-and-offers/news-and-offers.service";
import { cinemaService } from "./cinema/cinema.service";
import { screenService } from "./screen/screen.service";
import { seatTypeService } from "./seat-type/seat-type.service";
import { cinemaAmenityService } from "./cinema-amenity/cinema-amenity.service";
import { amenityTypeService } from "./amenity-type/amenity-type.service";
import { movieService } from "./movie/movie.service";
import { customerService } from "./customer/customer.service";
import { memberTierService } from "./member-tier/member-tier.service";

const resolveRoleSegment = (): string => {
    if (typeof window === "undefined") {
        return "";
    }

    const accessToken = getCookie(ADMIN_ACCESS_TOKEN_KEY);
    const role = resolveAdminRoleFromToken(accessToken);

    switch (role) {
        case AdminRole.ADMIN:
            return "/admin";
        case AdminRole.MANAGER:
            return "/manager";
        case AdminRole.STAFF:
            return "/staff";
        case AdminRole.POS:
            return "/pos";
        default:
            return "";
    }
};

/** Unscoped base (auth, anonymous employee registration). Matches BE routes without /admin|/manager|… prefix. */
export const authRootPath: string = get.rootPath("/administration-service");

/** Role-scoped API base for authenticated administration resources. */
export const rootPath: string = get.rootPath(`/administration-service${resolveRoleSegment()}`);
export const getRoleScopedRootPath = (): string =>
    get.rootPath(`/administration-service${resolveRoleSegment()}`);
export const getAdminRootPath = (): string => get.rootPath("/administration-service/admin");
export const getManagerRootPath = (): string => get.rootPath("/administration-service/manager");
export const getStaffRootPath = (): string => get.rootPath("/administration-service/staff");
export const getPosRootPath = (): string => get.rootPath("/administration-service/pos");

export const administrationService = {
    authService: authService,
    employeeService: employeeService,
    newsAndOffersService: newsAndOffersService,
    cinemaService: cinemaService,
    screenService: screenService,
    seatTypeService: seatTypeService,
    cinemaAmenityService: cinemaAmenityService,
    amenityTypeService: amenityTypeService,
    movieService: movieService,
    customerService: customerService,
    memberTierService: memberTierService,
};
