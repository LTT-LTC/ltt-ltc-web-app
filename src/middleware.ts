import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const sensitiveCustomerRoutes = ['/my-ltc', '/booking'];
const sensitiveAdminRoutes = ['/administration'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isSensitiveCustomer = sensitiveCustomerRoutes.some(route => pathname.startsWith(route));
    const isSensitiveAdmin = sensitiveAdminRoutes.some(route => pathname.startsWith(route) && !pathname.startsWith('/administration-login') && !pathname.startsWith('/administration-register') && !pathname.startsWith('/administration-reset-password'));

    if (isSensitiveCustomer) {
        const token = request.cookies.get('accessToken');
        if (!token) {
            const loginUrl = new URL(`/customer-login`, request.url);
            loginUrl.searchParams.set('returnUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    if (isSensitiveAdmin) {
        // const token = request.cookies.get('adminAccessToken') || request.cookies.get('accessToken'); // Assuming token logic. Usually admin might use a separate cookie or 'accessToken'.
        // if (!token || pathname === '/administration') { // If it's pure /administration, maybe redirect to a dashboard if logged in, else login.
        //     // Wait, "all default route come from the /administration need to be redirected to the login page of the administration domain (/administration-login)"
        //     const loginUrl = new URL(`/administration-login`, request.url);
        //     loginUrl.searchParams.set('returnUrl', pathname);
        //     return NextResponse.redirect(loginUrl);
        // }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
