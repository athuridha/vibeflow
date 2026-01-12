import { NextRequest, NextResponse } from 'next/server';
import { moodGenres } from '@/lib/spotify';

// Mood constraints for audio features (Relaxed to find more matches)
const moodConstraints: Record<string, (features: any) => boolean> = {
    happy: (f) => f.valence >= 0.5 && f.energy >= 0.5, // Reduced valence from 0.6
    sad: (f) => f.valence <= 0.45, // Increased from 0.4
    angry: (f) => f.energy >= 0.6, // Removed valence check, focus on energy
    neutral: (f) => f.energy <= 0.65 && f.valence >= 0.3 && f.valence <= 0.7,
    surprised: (f) => f.energy >= 0.6
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
                    // 1. Take up to 5 of them DIRECTLY into the final list (Prioritize user's actual music)
                    const shuffledMatches = matchingTracks.sort(() => 0.5 - Math.random());

                    // Keep 3-4 actual top tracks
                    finalTracks = shuffledMatches.slice(0, 4);

                    // Use them as seeds for the rest
                    seedTracks = finalTracks.map((t: any) => t.id);
                    debugSource = `User History (${finalTracks.length} direct tracks)`;
                }
            }
        }

        // 4. Fill the rest with Recommendations
        const spotsLeft = 10 - finalTracks.length;
        let recommendedTracks: any[] = [];

        if (spotsLeft > 0) {
            const recommendationsUrl = new URL('https://api.spotify.com/v1/recommendations');
            recommendationsUrl.searchParams.set('limit', spotsLeft.toString());
            recommendationsUrl.searchParams.set('market', 'ID');

            // Set seeds
            if (seedTracks.length > 0) {
                // Max 5 seeds allowed by Spotify
                const seeds = seedTracks.slice(0, 5);
                recommendationsUrl.searchParams.set('seed_tracks', seeds.join(','));
            } else {
                // FALLBACK STRATEGY
                const genres = moodGenres[mood] || moodGenres.neutral;
                const selectedGenre = genres[Math.floor(Math.random() * genres.length)];
                const fallbackArtist = topTracks[0]?.artists[0]?.id;

                if (fallbackArtist) {
                    recommendationsUrl.searchParams.set('seed_artists', fallbackArtist);
                    recommendationsUrl.searchParams.set('seed_genres', selectedGenre);
                    debugSource = "Hybrid Fallback (Artist + Genre)";
                } else {
                    recommendationsUrl.searchParams.set('seed_genres', selectedGenre);
                    debugSource = "Genre Fallback";
                }
            }

            // Set target attributes
            const attributes = moodAttributes[mood] || moodAttributes.happy;
            recommendationsUrl.searchParams.set('target_valence', attributes.valence.toString());
            recommendationsUrl.searchParams.set('target_energy', attributes.energy.toString());
            if (attributes.danceability) {
                recommendationsUrl.searchParams.set('target_danceability', attributes.danceability.toString());
            }

            // Fetch Final Recommendations
            const recsResponse = await fetch(recommendationsUrl.toString(), {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (recsResponse.ok) {
                const recsData = await recsResponse.json();
                recommendedTracks = recsData.tracks;
            }
        }

        // Combine Top Tracks + Recommendations
        // Shuffle them together so it's a mix, or keep Top Tracks at top?
        // Let's keep Top Tracks at the top for immediate familiarity, then recommendations
        const allTracks = [...finalTracks, ...recommendedTracks];

        // Prepare display info (What seeds were used?)
        let seedDisplayNames: string[] = [];
        if (seedTracks.length > 0) {
            seedDisplayNames = topTracks
                .filter((t: any) => seedTracks.includes(t.id))
                .map((t: any) => t.name)
                .slice(0, 2);
        } else {
            seedDisplayNames = [`${mood.toUpperCase()} Vibes`];
        }

        return NextResponse.json({
            tracks: allTracks,
            seedArtists: seedDisplayNames,
            debug: { source: debugSource, directMatches: finalTracks.length },
            personalized: true,
        });

    } catch (error) {
        console.error('Personalized recommendations error:', error);
        return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
    }
}
