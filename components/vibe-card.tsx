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

    const getMoodColor = () => {
        if (mood === 'happy') return 'bg-vibeflow-yellow border-black';
        if (mood === 'sad') return 'bg-vibeflow-blue text-white border-black';
        if (mood === 'angry') return 'bg-vibeflow-red text-white border-black';
        return 'bg-gray-200 border-black';
    };

    const handleDownload = async () => {
        const node = document.getElementById('vibe-card');
        if (!node) return;
        try {
            const htmlToImage = await import('html-to-image');
            const dataUrl = await htmlToImage.toPng(node);
            const link = document.createElement('a');
            link.download = `vibeflow-unwrapped-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to download image', error);
        }
    };

    const handleShare = async () => {
        const node = document.getElementById('vibe-card');
        if (!node) return;
        try {
            const htmlToImage = await import('html-to-image');
            const dataUrl = await htmlToImage.toPng(node);
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'my-vibe.png', { type: 'image/png' });
            if (navigator.share) {
                await navigator.share({
                    title: 'My VibeFlow Unwrapped',
                    text: `I'm feeling ${mood.toUpperCase()} today! Check out my vibe.`,
                    files: [file]
                });
            } else {
                alert("Sharing not supported. Image downloaded instead!");
                handleDownload();
            }
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
                    <X className="w-8 h-8" />
                </button>

                {/* THE CARD */}
                <div id="vibe-card" className={`w-full max-w-[350px] aspect-[9/16] ${getMoodColor()} border-4 shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] p-5 flex flex-col justify-between relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                    {/* Header */}
                    <div className="relative z-10 text-center border-b-2 border-black pb-2 mb-2">
                        <h1 className="font-black text-2xl tracking-tighter leading-none">VIBEFLOW</h1>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest mt-0.5">UNWRAPPED {new Date().getFullYear()}</p>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col items-center">
                        {/* Photo */}
                        <div className="w-28 h-28 border-4 border-black bg-white shadow-brutal-sm rotate-2 mb-2 overflow-hidden relative">
                            {imageSrc ? (
                                <img src={imageSrc} alt="My Vibe" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center font-bold text-gray-400">NO PHOTO</div>
                            )}
                            {/* Mood Sticker */}
                            <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 border-2 border-black font-black text-base uppercase rotate-[-10deg] shadow-sm ${mood === 'sad' || mood === 'angry' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                {mood}
                            </div>
                        </div>

                        {/* TOP 3 TRACKS */}
                        <div className="w-full space-y-1.5 mt-1">
                            <p className="text-[9px] font-bold text-gray-500 uppercase text-center bg-white border-2 border-black inline-block px-2 py-0.5 mx-auto transform -rotate-1">
                                YOUR VIBE PLAYLIST:
                            </p>
                            {tracks.slice(0, 3).map((track, i) => (
                                <div key={i} className="w-full bg-white border-2 border-black p-1.5 shadow-brutal-sm flex items-center gap-2">
                                    <span className="font-black text-sm text-gray-300 w-4 text-center shrink-0">#{i + 1}</span>
                                    <img src={track.album.images[0]?.url} alt="" className="w-7 h-7 border border-black shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="font-black text-[10px] truncate text-black">{track.name}</p>
                                        <p className="font-mono text-[8px] truncate text-gray-600">{track.artists[0]?.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 mt-2 pt-2 border-t-2 border-black text-center">
                        <p className="font-mono text-[10px] font-bold">{typeof window !== 'undefined' ? window.location.hostname : 'vibeflow.vercel.app'}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4 justify-center">
                    <button onClick={handleDownload} className="bg-white text-black border-4 border-black px-5 py-2 font-bold shadow-brutal hover:scale-105 transition-transform flex items-center gap-2">
                        <Download className="w-5 h-5" /> SAVE
                    </button>
                    <button onClick={handleShare} className="bg-vibeflow-green text-black border-4 border-black px-5 py-2 font-bold shadow-brutal hover:scale-105 transition-transform flex items-center gap-2">
                        <Share2 className="w-5 h-5" /> SHARE
                    </button>
                </div>
            </div>
        </div>
    );
}
