import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    // Clear all Spotify-related cookies
    const response = NextResponse.json({ success: true });

    response.cookies.delete('spotify_access_token');
    response.cookies.delete('spotify_refresh_token');
    response.cookies.delete('spotify_user_name');
    response.cookies.delete('spotify_auth_state');

    return response;
}
