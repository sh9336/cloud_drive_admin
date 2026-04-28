import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Forward the login request to the external Go backend
        const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const response = await fetch(`${externalApiUrl}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // The external API returns access_token, refresh_token, and user object
        const { access_token, refresh_token, user } = data.data || data;

        // Create the Next.js response
        const nextResponse = NextResponse.json({ success: true, user });

        // Set HttpOnly cookies for security
        nextResponse.cookies.set({
            name: 'access_token',
            value: access_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
        });

        nextResponse.cookies.set({
            name: 'refresh_token',
            value: refresh_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        // Optional: Save non-sensitive user data in a non-HttpOnly cookie for immediate frontend access
        nextResponse.cookies.set({
            name: 'user',
            value: JSON.stringify(user),
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
        });

        return nextResponse;
    } catch (error) {
        console.error('Login Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
