import type { Metadata } from "next";
import { Outfit, Public_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeFlow",
  description: "Mood-Based Visualizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${publicSans.variable} antialiased bg-[#FFFDF5] text-black`}
      >
        {children}
      </body>
    </html>
  );
}
