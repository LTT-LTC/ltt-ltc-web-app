import { TENANT_KEY } from "../const";
import { getCookie, setCookie } from "./cookie";

const FALLBACK_TENANT = "LTC";
const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TenantOption = { value?: string; label?: string };

const getParsedTenantOptions = (): TenantOption[] => {
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

export const normalizeTenantForHeader = (tenantValue?: string | null): string => {
    const normalizedInput = tenantValue?.trim();
    if (!normalizedInput) {
        return FALLBACK_TENANT;
    }

    const tenantOptions = getParsedTenantOptions();
    if (tenantOptions.length === 0) {
        return normalizedInput;
    }

    const matchedByValue = tenantOptions.find(
        (option) => option.value?.trim().toLowerCase() === normalizedInput.toLowerCase()
    );
    if (matchedByValue?.value?.trim()) {
        return matchedByValue.value.trim();
    }

    const matchedByLabel = tenantOptions.find(
        (option) => option.label?.trim().toLowerCase() === normalizedInput.toLowerCase()
    );
    if (matchedByLabel?.value?.trim()) {
        return matchedByLabel.value.trim();
    }

    if (GUID_REGEX.test(normalizedInput)) {
        const guidMapped = tenantOptions.find(
            (option) => option.value?.trim().toLowerCase() === normalizedInput.toLowerCase()
        );
        if (guidMapped?.label?.trim()) {
            return guidMapped.label.trim();
        }
    }

    return normalizedInput;
};

export const getDefaultTenant = (): string => {
    const tenantOptions = getParsedTenantOptions();
    if (tenantOptions.length === 0) {
        return FALLBACK_TENANT;
    }

    const firstTenant = tenantOptions[0];
    if (firstTenant?.value?.trim()) {
        return normalizeTenantForHeader(firstTenant.value);
    }
    if (firstTenant?.label?.trim()) {
        return normalizeTenantForHeader(firstTenant.label);
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

    const normalizedTenantId = normalizeTenantForHeader(tenantId);
    localStorage.setItem(TENANT_KEY, normalizedTenantId);
    setCookie(TENANT_KEY, normalizedTenantId);
};

export const getTenantOptions = (): { value: string; label: string }[] => {
    return getParsedTenantOptions() as { value: string; label: string }[];
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