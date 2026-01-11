import { NextRequest, NextResponse } from 'next/server';

// Mood to audio attributes mapping
const moodAttributes: Record<string, { valence: number; energy: number; danceability?: number }> = {
    happy: { valence: 0.8, energy: 0.7, danceability: 0.7 },
    sad: { valence: 0.2, energy: 0.3 },
    angry: { valence: 0.3, energy: 0.9 },
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mood = searchParams.get('mood') || 'happy';

    // Get access token from cookie
    const accessToken = request.cookies.get('spotify_access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        // 1. Get user's top artists for seeding
        const topArtistsResponse = await fetch(
            'https://api.spotify.com/v1/me/top/artists?limit=5&time_range=medium_term',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!topArtistsResponse.ok) {
            // Token might be expired
            if (topArtistsResponse.status === 401) {
                return NextResponse.json({ error: 'Token expired' }, { status: 401 });
            }
            throw new Error('Failed to fetch top artists');
        }

        const topArtists = await topArtistsResponse.json();
        const seedArtistIds = topArtists.items
            .slice(0, 2) // Use top 2 artists as seeds
            .map((artist: any) => artist.id)
            .join(',');

        // 2. Get mood-based attributes
        const attributes = moodAttributes[mood] || moodAttributes.happy;

        // 3. Build recommendations URL
        const recommendationsUrl = new URL('https://api.spotify.com/v1/recommendations');
        recommendationsUrl.searchParams.set('limit', '10');
        recommendationsUrl.searchParams.set('market', 'ID'); // Indonesia

        if (seedArtistIds) {
            recommendationsUrl.searchParams.set('seed_artists', seedArtistIds);
        } else {
            // Fallback to genre seeds if no top artists
            const genreSeeds = mood === 'happy' ? 'pop,dance' : mood === 'sad' ? 'acoustic,indie' : 'rock,metal';
            recommendationsUrl.searchParams.set('seed_genres', genreSeeds);
        }

        recommendationsUrl.searchParams.set('target_valence', attributes.valence.toString());
        recommendationsUrl.searchParams.set('target_energy', attributes.energy.toString());
        if (attributes.danceability) {
            recommendationsUrl.searchParams.set('target_danceability', attributes.danceability.toString());
        }

        // 4. Fetch recommendations
        const recommendationsResponse = await fetch(recommendationsUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!recommendationsResponse.ok) {
            throw new Error('Failed to fetch recommendations');
        }

        const recommendations = await recommendationsResponse.json();

        return NextResponse.json({
            tracks: recommendations.tracks,
            seedArtists: topArtists.items.slice(0, 2).map((a: any) => a.name),
            personalized: true,
        });

    } catch (error) {
        console.error('Personalized recommendations error:', error);
        return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
    }
}
