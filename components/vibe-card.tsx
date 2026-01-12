"use client";

import { X, Download, Share2, Palette, Edit3 } from "lucide-react";
import { useState, useEffect } from "react";

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
    const [selectedColor, setSelectedColor] = useState<string>(mood);
    const [customTitle, setCustomTitle] = useState(`UNWRAPPED ${new Date().getFullYear()}`);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    // Sync initial mood with selected color (mapped to simple names)
    useEffect(() => {
        if (mood === 'happy') setSelectedColor('yellow');
        else if (mood === 'sad') setSelectedColor('blue');
        else if (mood === 'angry') setSelectedColor('red');
        else setSelectedColor('white');
    }, [mood]);

    const getThemeClasses = (color: string) => {
        switch (color) {
            case 'yellow': return 'bg-vibeflow-yellow border-black text-black';
            case 'blue': return 'bg-vibeflow-blue border-black text-white';
            case 'red': return 'bg-vibeflow-red border-black text-white';
            case 'white': return 'bg-white border-black text-black';
            case 'black': return 'bg-black border-white text-white outline outline-2 outline-black';
            default: return 'bg-gray-200 border-black text-black';
        }
    };

    const themes = [
        { id: 'yellow', bg: 'bg-vibeflow-yellow' },
        { id: 'blue', bg: 'bg-vibeflow-blue' },
        { id: 'red', bg: 'bg-vibeflow-red' },
        { id: 'white', bg: 'bg-white' },
        { id: 'black', bg: 'bg-black' },
    ];

    const handleDownload = async () => {
        const node = document.getElementById('vibe-card');
        if (!node) return;
        try {
            const htmlToImage = await import('html-to-image');
            const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 4, skipAutoScale: true });
            const link = document.createElement('a');
            link.download = `vibeflow-${Date.now()}.png`;
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
                    title: 'My VibeFlow',
                    text: `Check out my vibe: ${customTitle}`,
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">

            {/* Main Container - Centered */}
            <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-300 my-auto">

                {/* Close Button - Moved to corner of screen on mobile, corner of container on desktop */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-right-12 md:top-0 text-white hover:text-vibeflow-red transition-colors p-2 bg-black border-2 border-white/20 rounded-full"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* THE CARD - 9:16 Aspect Ratio */}
                <div id="vibe-card" className={`w-[280px] aspect-[9/16] ${getThemeClasses(selectedColor)} border-4 shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)] p-4 flex flex-col justify-between relative overflow-hidden transition-colors duration-300`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>

                    {/* Header */}
                    <div className="relative z-10 text-center border-b-2 border-current pb-2 mt-2">
                        <h1 className="font-black text-2xl tracking-tighter leading-none mb-1">VIBEFLOW</h1>
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                autoFocus
                                className="font-mono text-[10px] font-bold uppercase tracking-widest bg-transparent border-b border-dashed border-current text-center w-full outline-none"
                            />
                        ) : (
                            <p
                                onClick={() => setIsEditingTitle(true)}
                                className="font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:underline decoration-dashed underline-offset-2"
                                title="Click to edit"
                            >
                                {customTitle} <Edit3 className="w-2 h-2 inline ml-1 opacity-50" />
                            </p>
                        )}
                    </div>

                    {/* Photo + Mood */}
                    <div className="relative z-10 flex justify-center my-3">
                        <div className="w-28 h-28 border-4 border-current bg-white shadow-brutal-sm rotate-2 overflow-hidden relative group">
                            {imageSrc ? (
                                <img src={imageSrc} alt="My Vibe" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center font-bold text-gray-400 text-[8px]">NO PHOTO</div>
                            )}

                            {/* Mood Sticker */}
                            <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 border-2 border-current font-black text-[10px] uppercase rotate-[-8deg] ${selectedColor === 'black' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                {mood}
                            </div>
                        </div>
                    </div>

                    {/* TOP 5 TRACKS */}
                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="text-center mb-1.5">
                            <span className="text-[7px] font-bold uppercase bg-current text-transparent bg-clip-text filter invert contrast-200 border border-current px-1.5 py-0.5 inline-block transform -rotate-1">
                                YOUR VIBE PLAYLIST
                            </span>
                        </div>
                        <div className="space-y-[4px] flex-1">
                            {tracks.slice(0, 5).map((track, i) => (
                                <div key={i} className={`w-full ${selectedColor === 'black' ? 'bg-gray-900 border-white' : 'bg-white border-black'} border p-[4px] flex items-center gap-1.5 shadow-sm`}>
                                    <span className="font-black text-[8px] opacity-50 w-3 shrink-0 text-center">{i + 1}</span>
                                    <img src={track.album.images[0]?.url} alt="" className={`w-6 h-6 border ${selectedColor === 'black' ? 'border-white' : 'border-black'} shrink-0`} />
                                    <div className="overflow-hidden flex-1">
                                        <p className={`font-bold text-[8px] truncate leading-tight ${selectedColor === 'black' ? 'text-white' : 'text-black'}`}>{track.name}</p>
                                        <p className="font-mono text-[6px] truncate opacity-60">{track.artists[0]?.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 pt-2 border-t-2 border-current text-center mt-1">
                        <p className="font-mono text-[6px] font-bold opacity-70">
                            {typeof window !== 'undefined' ? window.location.hostname : 'vibeflow.vercel.app'}
                        </p>
                    </div>
                </div>

                {/* CUSTOMIZATION TOOLBAR */}
                <div className="mt-8 bg-white border-4 border-black p-3 shadow-brutal flex flex-col gap-3 w-full max-w-[280px]">
                    <div className="flex justify-between items-center">
                        <span className="font-black text-xs uppercase flex items-center gap-1">
                            <Palette className="w-3 h-3" /> Theme
                        </span>
                        <div className="flex gap-2">
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedColor(theme.id)}
                                    className={`w-6 h-6 rounded-full border-2 border-black ${theme.bg} ${selectedColor === theme.id ? 'ring-2 ring-black ring-offset-2 scale-110' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3 w-full max-w-[280px]">
                    <button onClick={handleDownload} className="flex-1 bg-white text-black border-3 border-black py-2 font-bold text-sm shadow-brutal hover:scale-105 transition-transform flex items-center justify-center gap-1.5">
                        <Download className="w-4 h-4" /> SAVE
                    </button>
                    <button onClick={handleShare} className="flex-1 bg-vibeflow-green text-black border-3 border-black py-2 font-bold text-sm shadow-brutal hover:scale-105 transition-transform flex items-center justify-center gap-1.5">
                        <Share2 className="w-4 h-4" /> SHARE
                    </button>
                </div>

            </div>
        </div>
    );
}
