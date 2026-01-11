const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';

const getAccessToken = async () => {
    if (!client_secret) {
        console.error("SPOTIFY_CLIENT_SECRET is missing!");
        return null;
    }

    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
        }),
        next: { revalidate: 3600 }
    });

    if (!response.ok) {
        console.error("Failed to fetch access token", await response.text());
        return null;
    }

    return response.json();
};

// Genre pools for each mood
// Genre pools for each mood (Using only real Spotify genres)
export const moodGenres: Record<string, string[]> = {
    happy: [
        'pop', 'dance', 'funk', 'disco', 'house', 'reggaeton', 'k-pop',
        'hip-hop', 'r-n-b', 'soul', 'indie-pop', 'tropical-house', 'synth-pop', 'power-pop'
    ],
    sad: [
        'acoustic', 'piano', 'indie', 'sleep', 'ambient', 'sad',
        'ballad', 'folk', 'singer-songwriter', 'blues', 'classical', 'emo'
    ],
    angry: [
        'metal', 'rock', 'punk', 'grunge', 'industrial', 'alt-rock',
        'hardcore', 'metalcore', 'heavy-metal', 'garage', 'psych-rock'
    ],
    neutral: [
        'chill', 'lo-fi', 'study', 'jazz', 'instrumental', 'bossa-nova',
        'classical', 'minimal-techno', 'trip-hop', 'groove'
    ],
    surprised: [
        'electronic', 'techno', 'dubstep', 'psytrance', 'hyperpop',
        'drum-and-bass', 'glitch-hop', 'idm', 'breakbeat', 'experimental', 'club'
    ]
};

// Shuffle array helper
const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const getRecommendations = async (mood: string) => {
    const tokenData = await getAccessToken();
    if (!tokenData?.access_token) return [];

    // Get random genre from the mood's genre pool
    const genres = moodGenres[mood] || moodGenres.neutral;
    const selectedGenre = genres[Math.floor(Math.random() * genres.length)];

    // Random offset (0-100) to get different results each time
    const randomOffset = Math.floor(Math.random() * 100);

    // Search by genre tag for better results
    const url = `${SEARCH_ENDPOINT}?q=genre:${encodeURIComponent(selectedGenre)}&type=track&limit=10&offset=${randomOffset}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
        cache: 'no-store' // Disable caching for fresh results
    });

    if (!response.ok) {
        console.error("Spotify Search Error", await response.text());
        return [];
    }

    const data = await response.json();
    const tracks = data.tracks?.items || [];

    // Shuffle the results for extra randomness
    return shuffleArray(tracks).slice(0, 5);
};
