import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const sensitiveRoutes = ['/my-ltc', '/booking'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if the user is trying to access a sensitive route
    const isSensitive = sensitiveRoutes.some(route => pathname.startsWith(route));

    if (isSensitive) {
        const token = request.cookies.get('accessToken');
        
        if (!token) {
            // Redirect to the customer login page if there's no access token
            const loginUrl = new URL(`/customer-login`, request.url);
            loginUrl.searchParams.set('returnUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
