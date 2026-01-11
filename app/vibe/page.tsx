"use client";

import { useState, useEffect } from "react";
import CameraView from "@/components/camera-view";
import MusicPlayer from "@/components/music-player";
import VibeCard from "@/components/vibe-card";
import { ArrowLeft, Share2, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function VibePage() {
    const [currentMood, setCurrentMood] = useState<string>("");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [vibesData, setVibesData] = useState<any[]>([]);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [spotifyUser, setSpotifyUser] = useState<string | null>(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const userName = document.cookie
            .split('; ')
            .find(row => row.startsWith('spotify_user_name='))
            ?.split('=')[1];

        if (userName) {
            setSpotifyUser(decodeURIComponent(userName));
        }
    }, []);

    const handleMoodChange = (mood: string, imageSrc: string | null) => {
        setCurrentMood(mood);
        setCapturedImage(imageSrc);
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setSpotifyUser(null);
        // Reload to clear any cached data
        window.location.reload();
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-vibeflow-canvas bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <Link href="/" className="flex items-center gap-2 font-bold hover:underline decoration-4">
                    <div className="bg-black text-white p-2 border-2 border-black">
                        <ArrowLeft />
                    </div>
                    <span className="hidden sm:inline">BACK TO HOME</span>
                </Link>

                {/* Spotify Login Status */}
                <div className="flex items-center gap-3">
                    {spotifyUser ? (
                        <div className="flex items-center gap-2">
                            <div className="bg-green-500 text-white px-3 py-1 border-2 border-black font-bold text-sm flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">{spotifyUser}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-white text-black px-3 py-1 border-2 border-black font-bold text-sm flex items-center gap-1 hover:bg-red-100"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">LOGOUT</span>
                            </button>
                        </div>
                    ) : (
                        <a
                            href="/api/auth/login"
                            className="bg-green-500 text-white px-4 py-2 border-2 border-black font-bold text-sm flex items-center gap-2 hover:bg-green-600 transition-colors shadow-brutal-sm"
                        >
                            <LogIn className="w-4 h-4" />
                            LOGIN SPOTIFY
                        </a>
                    )}
                </div>
            </header>

            {/* Title */}
            <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-white border-4 border-black px-4 py-1 shadow-brutal-sm inline-block">
                    VIBE ROOM
                </h1>
                {spotifyUser && (
                    <p className="mt-2 font-mono text-sm bg-black text-green-400 px-3 py-1 inline-block border border-green-500">
                        ✨ Personalized Mode Active
                    </p>
                )}
            </div>

            {/* Main Content - Aligned */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center max-w-[1200px] mx-auto">
                {/* Left Column: Camera AI */}
                <div className="w-full lg:w-auto flex flex-col">
                    <div className="bg-vibeflow-yellow border-4 border-black px-4 py-2 font-black text-xl mb-4 shadow-brutal-sm text-center">
                        👁️ MOOD SCANNER
                    </div>
                    {/* Pass mood and image handler */}
                    <CameraView onMoodChange={handleMoodChange} />
                    <p className="mt-4 font-black text-xs bg-black text-white p-2 border-2 border-black text-center uppercase tracking-wider">
                        ⚡ TUNJUKKAN EKSPRESI TERBAIKMU
                    </p>
                </div>

                {/* Right Column: Music Player */}
                <div className="w-full lg:w-[450px] flex flex-col">
                    <div className="flex justify-between items-center bg-vibeflow-green border-4 border-black px-4 py-2 mb-4 shadow-brutal-sm">
                        <span className="font-black text-xl">🎵 PLAYLIST</span>
                        {/* Share Button (Only if mood exists) */}
                        {currentMood && (
                            <button
                                onClick={() => setIsShareOpen(true)}
                                className="bg-white text-black border-2 border-black px-3 py-1 font-bold text-sm flex items-center gap-2 hover:bg-gray-100"
                            >
                                <Share2 className="w-4 h-4" /> SHARE
                            </button>
                        )}
                    </div>

                    {currentMood ? (
                        <MusicPlayer
                            mood={currentMood}
                            onTracksLoaded={setVibesData}
                            isLoggedIn={!!spotifyUser}
                        />
                    ) : (
                        <div className="flex-1 border-4 border-black bg-white shadow-brutal p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <div className="animate-bounce mb-6">
                                <span className="text-6xl">🎧</span>
                            </div>
                            <h2 className="text-3xl font-black italic mb-4">WAITING FOR MOOD...</h2>
                            <p className="font-bold text-gray-500 max-w-[280px]">
                                Deteksi emosi wajahmu dan klik <span className="bg-vibeflow-green px-1">CREATE PLAYLIST</span> untuk memulai!
                            </p>
                            {!spotifyUser && (
                                <a
                                    href="/api/auth/login"
                                    className="mt-6 bg-green-500 text-white px-4 py-2 border-2 border-black font-bold text-sm flex items-center gap-2 hover:bg-green-600"
                                >
                                    <LogIn className="w-4 h-4" /> Login Spotify untuk rekomendasi personal
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Vibe Card Modal */}
            {isShareOpen && (
                <VibeCard
                    mood={currentMood}
                    imageSrc={capturedImage}
                    tracks={vibesData}
                    onClose={() => setIsShareOpen(false)}
                />
            )}

            {/* Footer */}
            <footer className="mt-12 text-center py-4 border-t-2 border-black/20">
                <p className="font-mono text-sm text-gray-600">
                    © {new Date().getFullYear()} <span className="font-bold">VibeFlow</span> — Built with 💖 by <span className="font-bold">Amar</span>
                </p>
            </footer>
        </main>
    );
}
