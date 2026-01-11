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
const moodGenres: Record<string, string[]> = {
    happy: ['pop', 'dance', 'happy', 'funk', 'disco', 'upbeat', 'party', 'summer'],
    sad: ['acoustic', 'sad', 'ballad', 'melancholy', 'piano', 'emotional', 'indie folk'],
    angry: ['metal', 'rock', 'punk', 'hardcore', 'grunge', 'industrial', 'rage'],
    neutral: ['chill', 'lofi', 'ambient', 'jazz', 'instrumental'],
    surprised: ['electronic', 'edm', 'synthwave', 'house', 'dubstep']
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

    // Get random genre(s) from the mood's genre pool
    const genres = moodGenres[mood] || moodGenres.neutral;
    const shuffledGenres = shuffleArray(genres);

    // Pick 1-2 random genres and combine
    const selectedGenres = shuffledGenres.slice(0, Math.random() > 0.5 ? 2 : 1);
    const query = selectedGenres.join(' ');

    // Random offset (0-50) to get different results each time
    const randomOffset = Math.floor(Math.random() * 50);

    const url = `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=track&limit=10&offset=${randomOffset}`;

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
