import { TENANT_KEY } from "../const";
import { getCookie, setCookie } from "./cookie";

const FALLBACK_TENANT = "LTC";

export const getDefaultTenant = (): string => {
    const tenantOptions = process.env.NEXT_PUBLIC_TENANTS;
    if (!tenantOptions) {
        return FALLBACK_TENANT;
    }

    try {
        const parsedTenants = JSON.parse(tenantOptions);
        if (!Array.isArray(parsedTenants) || parsedTenants.length === 0) {
            return FALLBACK_TENANT;
        }

        const firstTenant = parsedTenants[0]?.value;
        if (typeof firstTenant === "string" && firstTenant.trim()) {
            return firstTenant.trim();
        }
    } catch {
        return FALLBACK_TENANT;
    }

    return FALLBACK_TENANT;
};

export const getOrCreateTenantOnClient = (): string => {
    if (typeof window === "undefined") {
        return getDefaultTenant();
    }

    const existingTenant = localStorage.getItem(TENANT_KEY)?.trim();
    if (existingTenant) {
        setCookie(TENANT_KEY, existingTenant);
        return existingTenant;
    }

    const tenant = getDefaultTenant();
    localStorage.setItem(TENANT_KEY, tenant);
    setCookie(TENANT_KEY, tenant);
    return tenant;
};

export const setTenantOnClient = (tenantId: string): void => {
    if (typeof window === "undefined") {
        return;
    }

    const normalizedTenantId = tenantId.trim();
    localStorage.setItem(TENANT_KEY, normalizedTenantId);
    setCookie(TENANT_KEY, normalizedTenantId);
};

export const getTenantOptions = (): { value: string; label: string }[] => {
    const tenantOptions = process.env.NEXT_PUBLIC_TENANTS;
    if (!tenantOptions) {
        return [];
    }

    try {
        const parsedTenants = JSON.parse(tenantOptions);
        return Array.isArray(parsedTenants) ? parsedTenants : [];
    } catch {
        return [];
    }
};

export const syncTenantCookieFromLocalStorage = (): void => {
    if (typeof window === "undefined") {
        return;
    }

    const tenantFromStorage = localStorage.getItem(TENANT_KEY)?.trim();
    if (tenantFromStorage) {
        setCookie(TENANT_KEY, tenantFromStorage);
        return;
    }

    const tenantFromCookie = getCookie(TENANT_KEY);
    if (!tenantFromCookie) {
        const tenant = getDefaultTenant();
        localStorage.setItem(TENANT_KEY, tenant);
        setCookie(TENANT_KEY, tenant);
    }
};