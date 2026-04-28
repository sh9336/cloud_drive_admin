import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;
        const accessToken = cookieStore.get('access_token')?.value;
        const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

        // Notify external backend to invalidate the refresh token
        if (refreshToken) {
            await fetch(`${externalApiUrl}/auth/logout`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            }).catch(console.error); // We still want to clear local cookies even if backend fails
        }

        const nextResponse = NextResponse.json({ success: true });

        // Clear all cookies
        nextResponse.cookies.set('access_token', '', { maxAge: 0, path: '/' });
        nextResponse.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
        nextResponse.cookies.set('user', '', { maxAge: 0, path: '/' });

        return nextResponse;
    } catch (error) {
        console.error('Logout Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
