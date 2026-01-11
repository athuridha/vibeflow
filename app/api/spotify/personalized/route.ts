import { NextRequest, NextResponse } from 'next/server';
import { moodGenres } from '@/lib/spotify';

// Mood constraints for audio features
const moodConstraints: Record<string, (features: any) => boolean> = {
    happy: (f) => f.valence >= 0.6 && f.energy >= 0.5,
    sad: (f) => f.valence <= 0.4,
    angry: (f) => f.energy >= 0.7 && f.valence <= 0.5,
    neutral: (f) => f.energy <= 0.6 && f.valence >= 0.3 && f.valence <= 0.7,
    surprised: (f) => f.energy >= 0.7
};

// Target attributes for recommendations (fallback & guiding)
const moodAttributes: Record<string, { valence: number; energy: number; danceability?: number }> = {
    happy: { valence: 0.8, energy: 0.8, danceability: 0.7 },
    sad: { valence: 0.2, energy: 0.3 },
    angry: { valence: 0.3, energy: 0.9 },
    neutral: { valence: 0.5, energy: 0.5 },
    surprised: { valence: 0.6, energy: 0.8 }
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
        // 1. Get user's top TRACKS (limit 50 to have a good pool)
        const topTracksResponse = await fetch(
            'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term',
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!topTracksResponse.ok) {
            if (topTracksResponse.status === 401) return NextResponse.json({ error: 'Token expired' }, { status: 401 });
            throw new Error('Failed to fetch top tracks');
        }

        const topTracksData = await topTracksResponse.json();
        const topTracks = topTracksData.items;
        const topTrackIds = topTracks.map((t: any) => t.id).join(',');

        let seedTracks: string[] = [];
        let debugSource = "Generic Genres";

        if (topTrackIds) {
            // 2. Get Audio Features for these tracks
            const featuresResponse = await fetch(
                `https://api.spotify.com/v1/audio-features?ids=${topTrackIds}`,
                { headers: { 'Authorization': `Bearer ${accessToken}` } }
            );

            if (featuresResponse.ok) {
                const featuresData = await featuresResponse.json();
                const features = featuresData.audio_features;

                // 3. Filter tracks that match current mood
                const predicate = moodConstraints[mood] || moodConstraints.happy;

                const matchingTracks = topTracks.filter((track: any, index: number) => {
                    const f = features[index];
                    return f && predicate(f);
                });

                if (matchingTracks.length > 0) {
                    // We found tracks from user history that match the mood!
                    // Pick up to 5 random ones as seeds
                    const shuffled = matchingTracks.sort(() => 0.5 - Math.random());
                    seedTracks = shuffled.slice(0, 5).map((t: any) => t.id);
                    debugSource = `User History (${matchingTracks.length} matches)`;
                }
            }
        }

        // 4. Prepare parameters for Recommendations API
        const recommendationsUrl = new URL('https://api.spotify.com/v1/recommendations');
        recommendationsUrl.searchParams.set('limit', '10');
        recommendationsUrl.searchParams.set('market', 'ID');

        // Set seeds
        if (seedTracks.length > 0) {
            recommendationsUrl.searchParams.set('seed_tracks', seedTracks.join(','));
        } else {
            // FALLBACK: Use mood-base Genres if no history matches
            const genres = moodGenres[mood] || moodGenres.neutral;
            // Pick 2 random genres
            const selectedGenres = genres.sort(() => 0.5 - Math.random()).slice(0, 2);
            recommendationsUrl.searchParams.set('seed_genres', selectedGenres.join(','));
            debugSource = "Fallback Mood Genres";
        }

        // Set target attributes (to guide the recommendations further)
        const attributes = moodAttributes[mood] || moodAttributes.happy;
        recommendationsUrl.searchParams.set('target_valence', attributes.valence.toString());
        recommendationsUrl.searchParams.set('target_energy', attributes.energy.toString());
        if (attributes.danceability) {
            recommendationsUrl.searchParams.set('target_danceability', attributes.danceability.toString());
        }

        // 5. Fetch Final Recommendations
        const recsResponse = await fetch(recommendationsUrl.toString(), {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!recsResponse.ok) throw new Error('Failed to fetch recommendations');

        const recsData = await recsResponse.json();

        // Prepare display info (What seeds were used?)
        let seedDisplayNames: string[] = [];
        if (seedTracks.length > 0) {
            // Find names of the seed tracks
            seedDisplayNames = topTracks
                .filter((t: any) => seedTracks.includes(t.id))
                .map((t: any) => t.name)
                .slice(0, 2); // Show first 2 names
        } else {
            seedDisplayNames = [`${mood.toUpperCase()} Vibes`];
        }

        return NextResponse.json({
            tracks: recsData.tracks,
            seedArtists: seedDisplayNames, // Reusing this field name to show source on UI
            debug: { source: debugSource, seedCount: seedTracks.length },
            personalized: true,
        });

    } catch (error) {
        console.error('Personalized recommendations error:', error);
        return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
    }
}
