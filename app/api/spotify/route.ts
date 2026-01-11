import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/spotify';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mood = searchParams.get('mood') || 'neutral';

    try {
        const tracks = await getRecommendations(mood);

        if (!tracks) {
            return NextResponse.json({ error: 'Failed to fetch tracks or missing secret' }, { status: 500 });
        }

        return NextResponse.json({ tracks });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
