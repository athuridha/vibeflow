import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Get stored state from cookie
    const storedState = request.cookies.get('spotify_auth_state')?.value;

    // Handle errors or state mismatch
    if (error) {
        return NextResponse.redirect(new URL('/vibe?error=access_denied', request.url));
    }

    if (!state || state !== storedState) {
        return NextResponse.redirect(new URL('/vibe?error=state_mismatch', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/vibe?error=no_code', request.url));
    }

    // Exchange code for tokens
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

    try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return NextResponse.redirect(new URL('/vibe?error=token_exchange_failed', request.url));
        }

        const tokens = await tokenResponse.json();

        // Fetch user profile to get display name
        const profileResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
            },
        });

        const profile = await profileResponse.json();

        // Create response with redirect to vibe page
        const response = NextResponse.redirect(new URL('/vibe?login=success', request.url));

        // Store tokens in HTTP-only cookies
        response.cookies.set('spotify_access_token', tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: tokens.expires_in, // Usually 3600 seconds (1 hour)
        });

        response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        // Store user display name in non-httpOnly cookie so client can read it
        response.cookies.set('spotify_user_name', profile.display_name || profile.id, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
        });

        // Clear auth state cookie
        response.cookies.delete('spotify_auth_state');

        return response;

    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/vibe?error=callback_error', request.url));
    }
}
