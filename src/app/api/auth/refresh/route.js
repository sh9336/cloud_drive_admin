import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
        }

        const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const response = await fetch(`${externalApiUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        const { access_token } = data.data || data;

        const nextResponse = NextResponse.json({ success: true });

        // Set the new access token cookie
        nextResponse.cookies.set({
            name: 'access_token',
            value: access_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
        });

        // Some backends also rotate the refresh token. If so, update it here:
        if (data.data?.refresh_token || data.refresh_token) {
            nextResponse.cookies.set({
                name: 'refresh_token',
                value: data.data?.refresh_token || data.refresh_token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60, // 7 days
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('Refresh Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
