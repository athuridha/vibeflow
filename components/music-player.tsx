"use client";

import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Disc, Music, ExternalLink } from 'lucide-react';

type Track = {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
    preview_url: string | null;
    external_urls: { spotify: string };
};

export default function MusicPlayer({ mood }: { mood: string }) {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [playingTrack, setPlayingTrack] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!mood || mood === 'neutral') return;

        const fetchMusic = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/spotify?mood=${mood}`);
                const data = await res.json();
                if (data.tracks) setTracks(data.tracks);
            } catch (err) {
                console.error("Failed to fetch music", err);
            }
            setLoading(false);
        };

        const timeout = setTimeout(fetchMusic, 500);
        return () => clearTimeout(timeout);
    }, [mood]);

    const togglePlay = (previewUrl: string, trackId: string) => {
        if (playingTrack === trackId) {
            audioRef.current?.pause();
            setPlayingTrack(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(previewUrl);
            audioRef.current.play();
            setPlayingTrack(trackId);
            audioRef.current.onended = () => setPlayingTrack(null);
        }
    };

    const getMoodColor = () => {
        if (mood === 'happy') return 'bg-vibeflow-yellow';
        if (mood === 'sad') return 'bg-vibeflow-blue text-white';
        if (mood === 'angry') return 'bg-vibeflow-red text-white';
        return 'bg-gray-200';
    };

    return (
        <div className="flex-1 border-4 border-black bg-white shadow-brutal overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`px-4 py-2 font-bold text-sm border-b-4 border-black ${getMoodColor()}`}>
                PLAYING FOR: <span className="uppercase">{mood}</span>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
                        <Disc className="w-16 h-16 animate-spin" />
                        <p className="font-bold text-xl">DIGGING CRATES...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tracks.map((track) => (
                            <div key={track.id}
                                className={`flex items-center gap-3 border-2 border-black p-2 transition-all hover:bg-gray-50 ${playingTrack === track.id ? 'bg-vibeflow-yellow shadow-brutal-sm -translate-x-1 -translate-y-1' : ''}`}>

                                <img src={track.album.images[0]?.url} alt={track.name} className="w-12 h-12 border border-black object-cover flex-shrink-0" />

                                <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-sm truncate">{track.name}</h4>
                                    <p className="text-xs font-mono text-gray-600 truncate">{track.artists[0]?.name}</p>
                                </div>

                                <div className="flex gap-1 flex-shrink-0">
                                    {track.preview_url ? (
                                        <button
                                            onClick={() => togglePlay(track.preview_url!, track.id)}
                                            className="w-10 h-10 flex items-center justify-center bg-black text-white hover:bg-vibeflow-red transition-colors border-2 border-black"
                                        >
                                            {playingTrack === track.id ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
                                        </button>
                                    ) : (
                                        <a
                                            href={track.external_urls?.spotify}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 flex items-center justify-center bg-green-500 text-white hover:bg-green-600 transition-colors border-2 border-black"
                                            title="Open in Spotify"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {tracks.length === 0 && (
                            <div className="text-center py-8">
                                <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p className="font-bold text-gray-500">Tidak ada lagu ditemukan</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
