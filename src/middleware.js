import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // We only want to intercept requests meant for the external API proxy
    if (pathname.startsWith('/api-proxy')) {
        // Get the access token from the HttpOnly cookie
        const accessToken = request.cookies.get('access_token')?.value;

        // Clone the URL and rewrite it to point to the external backend
        const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const targetUrl = request.url.replace(request.nextUrl.origin + '/api-proxy', externalApiUrl);
        
        // Clone the request headers
        const requestHeaders = new Headers(request.headers);
        
        // If we have a token, inject it into the Authorization header
        if (accessToken) {
            requestHeaders.set('Authorization', `Bearer ${accessToken}`);
        }

        // Forward the request to the external API
        return NextResponse.rewrite(new URL(targetUrl), {
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api-proxy/:path*'],
};
