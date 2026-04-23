import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
    ADMIN_ACCESS_TOKEN_KEY,
    ADMIN_REFRESH_TOKEN_KEY,
    CUSTOMER_ACCESS_TOKEN_KEY,
    CUSTOMER_REFRESH_TOKEN_KEY,
    TENANT_KEY
} from './@core/const';
import {
    getAdminHomePathByRole,
    isAdminAuthPath,
    isAdminPathAllowedForRole,
    isAdminProtectedPath,
    resolveAdminRoleFromRoleValues,
    resolveAdminRoleFromToken,
    toRoleValues,
} from './@core/utils/admin-auth';

const sensitiveCustomerRoutes = ['/my-ltc', '/booking'];
const customerAuthRoutes = ['/customer-login', '/customer-register'];

interface ApplicationConfigurationCurrentUser {
    isAuthenticated?: boolean;
    roles?: unknown;
    role?: unknown;
}

interface ApplicationConfigurationResponse {
    currentUser?: ApplicationConfigurationCurrentUser;
    result?: {
        currentUser?: ApplicationConfigurationCurrentUser;
    };
    data?: {
        currentUser?: ApplicationConfigurationCurrentUser;
    };
}

const getCurrentUserFromConfigurationResponse = (payload: unknown) => {
    const typedPayload = payload as ApplicationConfigurationResponse;
    return typedPayload.currentUser ?? typedPayload.result?.currentUser ?? typedPayload.data?.currentUser ?? null;
};

const createLoginRedirect = (request: NextRequest, clearCookies = false) => {
    const loginUrl = new URL('/administration-login', request.url);
    loginUrl.searchParams.set('returnUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`);

    const response = NextResponse.redirect(loginUrl);
    if (clearCookies) {
        response.cookies.delete(ADMIN_ACCESS_TOKEN_KEY);
        response.cookies.delete(ADMIN_REFRESH_TOKEN_KEY);
    }
    return response;
};

const getAdminConfigurationUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!apiUrl) {
        return null;
    }
    return `${apiUrl}/administration-service/api/abp/application-configuration`;
};

const getDefaultTenant = () => {
    const tenantOptions = process.env.NEXT_PUBLIC_TENANTS;
    if (!tenantOptions) {
        return 'LTC';
    }

    try {
        const parsedTenants = JSON.parse(tenantOptions);
        if (!Array.isArray(parsedTenants) || parsedTenants.length === 0) {
            return 'LTC';
        }

        const firstTenant = parsedTenants[0];
        const tenantValue = firstTenant?.value;
        if (typeof tenantValue === 'string' && tenantValue.trim()) {
            return tenantValue.trim();
        }

        const tenantLabel = firstTenant?.label;
        if (typeof tenantLabel === 'string' && tenantLabel.trim()) {
            return tenantLabel.trim();
        }
    } catch {
        return 'LTC';
    }

    return 'LTC';
};

const resolveTenantFromRequest = (request: NextRequest) => {
    const tenantHeader = request.headers.get(TENANT_KEY) ?? request.headers.get(TENANT_KEY.toLowerCase());
    if (tenantHeader?.trim()) {
        return tenantHeader.trim();
    }

    const tenantCookie = request.cookies.get(TENANT_KEY)?.value?.trim();
    if (tenantCookie) {
        return tenantCookie;
    }

    return getDefaultTenant();
};

const resolveValidatedAdminRole = async (request: NextRequest, accessToken: string) => {
    const localRole = resolveAdminRoleFromToken(accessToken);
    if (!localRole) {
        return null;
    }

    const configurationUrl = getAdminConfigurationUrl();
    if (!configurationUrl) {
        return localRole;
    }

    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Accept-Language': request.headers.get('accept-language') ?? 'vi',
        };

        headers[TENANT_KEY] = resolveTenantFromRequest(request);

        const response = await fetch(configurationUrl, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        if (response.status === 401 || response.status === 403) {
            return null;
        }

        if (!response.ok) {
            return localRole;
        }

        const payload = await response.json();
        const currentUser = getCurrentUserFromConfigurationResponse(payload);

        if (!currentUser?.isAuthenticated) {
            return null;
        }

        const validatedRole = resolveAdminRoleFromRoleValues(toRoleValues(currentUser.roles ?? currentUser.role));
        return validatedRole ?? localRole;
    } catch {
        return localRole;
    }
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const adminAccessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_KEY)?.value;
    const adminRefreshToken = request.cookies.get(ADMIN_REFRESH_TOKEN_KEY)?.value;
    const customerAccessToken = request.cookies.get(CUSTOMER_ACCESS_TOKEN_KEY)?.value;
    const customerRefreshToken = request.cookies.get(CUSTOMER_REFRESH_TOKEN_KEY)?.value;
    const hasCustomerAuthToken = Boolean(customerAccessToken || customerRefreshToken);

    const isSensitiveCustomer = sensitiveCustomerRoutes.some(route => pathname.startsWith(route));
    const isCustomerAuthPath = customerAuthRoutes.some(route => pathname.startsWith(route));

    if (isAdminAuthPath(pathname) && adminAccessToken) {
        const role = await resolveValidatedAdminRole(request, adminAccessToken);
        if (role) {
            return NextResponse.redirect(new URL(getAdminHomePathByRole(role), request.url));
        }
    }

    if (isCustomerAuthPath && hasCustomerAuthToken) {
        return NextResponse.redirect(new URL('/homepage', request.url));
    }

    if (isSensitiveCustomer) {
        if (!customerAccessToken) {
            const loginUrl = new URL(`/customer-login`, request.url);
            loginUrl.searchParams.set('returnUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    if (isAdminProtectedPath(pathname)) {
        if (!adminAccessToken) {
            return createLoginRedirect(request);
        }

        const role = await resolveValidatedAdminRole(request, adminAccessToken);
        if (!role) {
            return createLoginRedirect(request, true);
        }

        if (!isAdminPathAllowedForRole(pathname, role)) {
            return NextResponse.redirect(new URL(getAdminHomePathByRole(role), request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
