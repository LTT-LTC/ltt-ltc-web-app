import { AdminRole } from "../type/permission.types";
import { getUserInfoFromToken } from "./jwt";

const ADMIN_AUTH_PATHS = ["/administration-login", "/administration/login"];
const ADMIN_PUBLIC_PATHS = [
    ...ADMIN_AUTH_PATHS,
    "/administration-register",
    "/administration-reset-password",
];
const ADMIN_PROTECTED_PREFIXES = [
    "/administration",
    "/employee",
    "/manager",
    "/staff",
    "/pos",
];

const rolePriority: AdminRole[] = [
    AdminRole.ADMIN,
    AdminRole.MANAGER,
    AdminRole.STAFF,
    AdminRole.POS,
];

const roleKeywords: Record<AdminRole, string[]> = {
    [AdminRole.ADMIN]: ["admin", "administrator", "superadmin", "systemadmin"],
    [AdminRole.MANAGER]: ["manager", "cinemamanager", "tenantmanager"],
    [AdminRole.STAFF]: ["staff", "employee", "boxoffice"],
    [AdminRole.POS]: ["pos", "cashier", "pointofsale"],
};

const normalizeRole = (value: string): string =>
    value.toLowerCase().replace(/[\s_-]/g, "");

export const toRoleValues = (roleData: unknown): string[] => {
    if (Array.isArray(roleData)) {
        return roleData
            .map((role) => String(role).trim())
            .filter((role) => role.length > 0);
    }

    if (typeof roleData === "string") {
        return roleData
            .split(",")
            .map((role) => role.trim())
            .filter((role) => role.length > 0);
    }

    return [];
};

export const resolveAdminRoleFromRoleValues = (rawRoles: string[]): AdminRole | null => {
    if (rawRoles.length === 0) {
        return null;
    }

    const normalizedRoles = rawRoles.map(normalizeRole);

    for (const role of rolePriority) {
        const keywords = roleKeywords[role];
        const matched = normalizedRoles.some((roleValue) =>
            keywords.some((keyword) => roleValue === keyword || roleValue.includes(keyword))
        );

        if (matched) {
            return role;
        }
    }

    return null;
};

export const resolveAdminRoleFromToken = (token?: string | null): AdminRole | null => {
    if (!token) {
        return null;
    }

    const userInfo = getUserInfoFromToken(token);
    if (!userInfo) {
        return null;
    }

    return resolveAdminRoleFromRoleValues(toRoleValues(userInfo.role));
};

export const getAdminHomePathByRole = (role: AdminRole): string => {
    switch (role) {
        case AdminRole.ADMIN:
            return "/administration/admin/dashboard";
        case AdminRole.MANAGER:
            return "/administration/manager/dashboard";
        case AdminRole.STAFF:
        case AdminRole.POS:
            return "/administration/manager/dashboard";
        default:
            return "/administration-login";
    }
};

export const isAdminAuthPath = (pathname: string): boolean =>
    ADMIN_AUTH_PATHS.some((path) => pathname.startsWith(path));

export const isAdminProtectedPath = (pathname: string): boolean => {
    const isAdminPrefix = ADMIN_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const isPublicAdminPath = ADMIN_PUBLIC_PATHS.some((path) => pathname.startsWith(path));
    return isAdminPrefix && !isPublicAdminPath;
};

export const isAdminPathAllowedForRole = (pathname: string, role: AdminRole): boolean => {
    if (pathname.startsWith("/administration/admin")) {
        return role === AdminRole.ADMIN;
    }

    if (pathname.startsWith("/administration/manager")) {
        return role === AdminRole.ADMIN || role === AdminRole.MANAGER;
    }

    if (pathname.startsWith("/employee")) {
        return role === AdminRole.ADMIN || role === AdminRole.MANAGER;
    }

    if (pathname.startsWith("/manager")) {
        return role === AdminRole.ADMIN || role === AdminRole.MANAGER;
    }

    if (pathname.startsWith("/staff")) {
        return role === AdminRole.ADMIN || role === AdminRole.MANAGER || role === AdminRole.STAFF;
    }

    if (pathname.startsWith("/pos")) {
        return (
            role === AdminRole.ADMIN ||
            role === AdminRole.MANAGER ||
            role === AdminRole.STAFF ||
            role === AdminRole.POS
        );
    }

    if (pathname.startsWith("/administration")) {
        return (
            role === AdminRole.ADMIN ||
            role === AdminRole.MANAGER ||
            role === AdminRole.STAFF ||
            role === AdminRole.POS
        );
    }

    return true;
};
