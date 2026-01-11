import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 18);

    // Scopes required for personalized recommendations
    const scopes = [
        'user-top-read',      // Access user's top artists/tracks
        'user-read-private',  // Access user profile
        'user-read-email'     // Access user email
    ].join(' ');

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', client_id || '');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', redirect_uri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('show_dialog', 'true'); // Always show login dialog

    // Create response with redirect
    const response = NextResponse.redirect(authUrl.toString());

    // Store state in cookie for verification in callback
    response.cookies.set('spotify_auth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10, // 10 minutes
    });

    return response;
}
