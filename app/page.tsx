import { ArrowRight, MoveRight, Smile, Frown, Flame } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-vibeflow-canvas bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Navbar Container */}
      <nav className="w-full max-w-5xl flex justify-center items-center mb-20 border-brutal bg-white p-4 shadow-brutal">
        <h1 className="text-3xl font-black tracking-tighter">VIBEFLOW.</h1>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-8 mb-20">
        <div className="inline-block bg-vibeflow-yellow border-brutal px-6 py-2 shadow-brutal -rotate-2 mb-4">
          <span className="font-bold text-lg">VISUALIZER YOUR MOOD</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black leading-[0.9]">
          SEE YOUR <span className="bg-vibeflow-blue text-white px-2">FEELINGS</span>. <br />
          HEAR YOUR <span className="bg-vibeflow-red text-white px-2">VIBE</span>.
        </h1>

        <div className="relative inline-block mx-auto mt-12 group cursor-default">
          <div className="absolute top-0 left-0 w-full h-full bg-black translate-x-2 translate-y-2"></div>
          <div className="relative bg-white border-4 border-black p-8 max-w-2xl text-left">
            <p className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tighter mb-2">
              STOP TYPING.
            </p>
            <p className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tighter bg-vibeflow-yellow inline-block px-2 mb-6">
              START FEELING.
            </p>
            <p className="text-xl font-bold font-mono text-gray-800">
              // Biarkan wajahmu yang memilih lagunya.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-8 group">
        <a href="/vibe" className="bg-vibeflow-green border-brutal text-xl md:text-2xl font-black px-8 md:px-12 py-4 md:py-6 shadow-brutal hover:shadow-brutal-hover hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-4 mx-auto w-fit text-center">
          MULAI SEKARANG <ArrowRight className="w-6 h-6 md:w-8 md:h-8 stroke-[3]" />
        </a>
      </div>

      {/* Feature Cards Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-6xl">
        {/* Happy Card */}
        <div className="bg-vibeflow-yellow border-brutal p-6 shadow-brutal hover:-translate-y-2 transition-transform">
          <div className="bg-black text-white w-12 h-12 flex items-center justify-center border-brutal mb-4 shadow-brutal-sm">
            <Smile className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black mb-2">HAPPY VIBES</h3>
          <p className="font-medium bg-white/50 p-2 border-2 border-black">
            Playlist Pop & Visual Neon cerah untuk hari bahagiamu.
          </p>
        </div>

        {/* Sad Card */}
        <div className="bg-vibeflow-blue border-brutal p-6 shadow-brutal hover:-translate-y-2 transition-transform">
          <div className="bg-black text-white w-12 h-12 flex items-center justify-center border-brutal mb-4 shadow-brutal-sm">
            <Frown className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black mb-2 text-white">SAD MOOD</h3>
          <p className="font-medium bg-white/50 p-2 border-2 border-black">
            Lagu Lo-fi & Hujan visual untuk menemani galaumu.
          </p>
        </div>

        {/* Angry Card */}
        <div className="bg-vibeflow-red border-brutal p-6 shadow-brutal hover:-translate-y-2 transition-transform">
          <div className="bg-black text-white w-12 h-12 flex items-center justify-center border-brutal mb-4 shadow-brutal-sm">
            <Flame className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black mb-2 text-white">INTENSE</h3>
          <p className="font-medium bg-white/50 p-2 border-2 border-black">
            Rock/Metal & Efek Glitch untuk melepaskan emosi.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center py-4 w-full">
        <p className="font-mono text-sm text-gray-600">
          © {new Date().getFullYear()} <span className="font-bold">VibeFlow</span> — Built with 💖 by <span className="font-bold">Amar</span>
        </p>
      </footer>
    </main >
  );
}
