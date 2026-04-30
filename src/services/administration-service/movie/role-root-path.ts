import { ADMIN_ACCESS_TOKEN_KEY } from "@/src/@core/const";
import { AdminRole } from "@/src/@core/type/permission.types";
import { getCookie } from "@/src/@core/utils/cookie";
import { resolveAdminRoleFromToken } from "@/src/@core/utils/admin-auth";

export const getMovieRoleRootPath = (): string => {
    const accessToken = getCookie(ADMIN_ACCESS_TOKEN_KEY);
    const role = resolveAdminRoleFromToken(accessToken);

    if (role === AdminRole.MANAGER) {
        return "/movie-service/manager";
    }
    else if (role === AdminRole.ADMIN) {
        return "/movie-service/admin";
    }
    else if (role === AdminRole.STAFF) {
        return "/movie-service/staff";
    }
    return "/movie-service";
};
