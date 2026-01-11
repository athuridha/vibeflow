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
            const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 4, skipAutoScale: true });
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
            const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 4, skipAutoScale: true });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'my-vibe.png', { type: 'image/png' });
            if (navigator.share) {
                await navigator.share({
                    title: 'My VibeFlow Unwrapped',
                    text: `I'm feeling ${mood.toUpperCase()} today!`,
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
                <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors">
                    <X className="w-7 h-7" />
                </button>

                {/* THE CARD - 9:16 Aspect Ratio */}
                <div id="vibe-card" className={`w-[270px] aspect-[9/16] ${getMoodColor()} border-4 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-3 flex flex-col justify-between relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>

                    {/* Header */}
                    <div className="relative z-10 text-center border-b-2 border-black pb-1.5">
                        <h1 className="font-black text-lg tracking-tighter leading-none">VIBEFLOW</h1>
                        <p className="font-mono text-[7px] font-bold uppercase tracking-widest">UNWRAPPED {new Date().getFullYear()}</p>
                    </div>

                    {/* Photo + Mood */}
                    <div className="relative z-10 flex justify-center my-2">
                        <div className="w-24 h-24 border-3 border-black bg-white shadow-brutal-sm rotate-2 overflow-hidden relative">
                            {imageSrc ? (
                                <img src={imageSrc} alt="My Vibe" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center font-bold text-gray-400 text-[8px]">NO PHOTO</div>
                            )}
                            <div className={`absolute -bottom-0.5 -right-0.5 px-1.5 py-0.5 border border-black font-black text-[9px] uppercase rotate-[-8deg] ${mood === 'sad' || mood === 'angry' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                {mood}
                            </div>
                        </div>
                    </div>

                    {/* TOP 5 TRACKS */}
                    <div className="relative z-10 flex-1 flex flex-col">
                        <p className="text-[6px] font-bold text-gray-500 uppercase text-center bg-white border border-black inline-block px-1 py-0.5 mx-auto mb-1 transform -rotate-1">
                            YOUR VIBE PLAYLIST
                        </p>
                        <div className="space-y-[3px] flex-1">
                            {tracks.slice(0, 5).map((track, i) => (
                                <div key={i} className="w-full bg-white border border-black p-[3px] flex items-center gap-1">
                                    <span className="font-black text-[7px] text-gray-400 w-2.5 shrink-0 text-center">{i + 1}</span>
                                    <img src={track.album.images[0]?.url} alt="" className="w-5 h-5 border border-black shrink-0" />
                                    <div className="overflow-hidden flex-1">
                                        <p className="font-bold text-[7px] truncate text-black leading-tight">{track.name}</p>
                                        <p className="font-mono text-[5px] truncate text-gray-500">{track.artists[0]?.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 pt-1.5 border-t-2 border-black text-center">
                        <p className="font-mono text-[7px] font-bold">{typeof window !== 'undefined' ? window.location.hostname : 'vibeflow.vercel.app'}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3 justify-center">
                    <button onClick={handleDownload} className="bg-white text-black border-3 border-black px-4 py-1.5 font-bold text-sm shadow-brutal hover:scale-105 transition-transform flex items-center gap-1.5">
                        <Download className="w-4 h-4" /> SAVE
                    </button>
                    <button onClick={handleShare} className="bg-vibeflow-green text-black border-3 border-black px-4 py-1.5 font-bold text-sm shadow-brutal hover:scale-105 transition-transform flex items-center gap-1.5">
                        <Share2 className="w-4 h-4" /> SHARE
                    </button>
                </div>
            </div>
        </div>
    );
}
