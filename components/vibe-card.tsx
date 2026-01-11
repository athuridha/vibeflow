"use client";

import { X, Download, Share2 } from "lucide-react";

type Track = {
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
};

interface VibeCardProps {
    mood: string;
    imageSrc: string | null;
    tracks: Track[];
    onClose: () => void;
}

export default function VibeCard({ mood, imageSrc, tracks, onClose }: VibeCardProps) {
    const topTrack = tracks[0];

    const getMoodColor = () => {
        if (mood === 'happy') return 'bg-vibeflow-yellow border-black';
        if (mood === 'sad') return 'bg-vibeflow-blue text-white border-black';
        if (mood === 'angry') return 'bg-vibeflow-red text-white border-black';
        return 'bg-gray-200 border-black';
    };

    const getMoodColorHex = () => {
        if (mood === 'happy') return '#FFDE00'; // Yellow
        if (mood === 'sad') return '#3B82F6';   // Blue
        if (mood === 'angry') return '#EF4444'; // Red
        return '#E5E7EB';
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* THE CARD (To be captured/shared) */}
                <div id="vibe-card" className={`w-full max-w-[350px] aspect-[9/16] ${getMoodColor()} border-4 shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] p-6 flex flex-col justify-between relative overflow-hidden`}>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                    {/* Header */}
                    <div className="relative z-10 text-center border-b-4 border-black pb-4 mb-4">
                        <h1 className="font-black text-3xl tracking-tighter leading-none">VIBEFLOW</h1>
                        <p className="font-mono text-xs font-bold uppercase tracking-widest mt-1">UNWRAPPED {new Date().getFullYear()}</p>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col items-center">
                        {/* Photo */}
                        <div className="w-48 h-48 border-4 border-black bg-white shadow-brutal-sm rotate-2 mb-6 overflow-hidden relative">
                            {imageSrc ? (
                                <img src={imageSrc} alt="My Vibe" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center font-bold text-gray-400">NO PHOTO</div>
                            )}
                            {/* Mood Sticker */}
                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 border-2 border-black font-black text-xl uppercase rotate-[-10deg] shadow-sm ${mood === 'sad' || mood === 'angry' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                {mood}
                            </div>
                        </div>

                        {/* Top Track */}
                        {topTrack && (
                            <div className="w-full bg-white border-2 border-black p-3 shadow-brutal-sm transform -rotate-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CURRENTLY VIBING TO:</p>
                                <div className="flex items-center gap-3">
                                    <img src={topTrack.album.images[0]?.url} className="w-10 h-10 border border-black" />
                                    <div className="overflow-hidden">
                                        <p className="font-black text-sm truncate text-black">{topTrack.name}</p>
                                        <p className="font-mono text-xs truncate text-black">{topTrack.artists[0].name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 mt-6 pt-4 border-t-4 border-black text-center">
                        <p className="font-mono text-[10px] font-bold">vibeflow.vercel.app</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-4 justify-center">
                    <button className="bg-white text-black border-4 border-black px-6 py-3 font-bold shadow-brutal hover:scale-105 transition-transform flex items-center gap-2">
                        <Download className="w-5 h-5" /> SAVE IMAGE
                    </button>
                    {/* Share API is limited on desktop, usually works on mobile */}
                    <button className="bg-vibeflow-green text-black border-4 border-black px-6 py-3 font-bold shadow-brutal hover:scale-105 transition-transform flex items-center gap-2">
                        <Share2 className="w-5 h-5" /> SHARE
                    </button>
                </div>
            </div>
        </div>
    );
}
