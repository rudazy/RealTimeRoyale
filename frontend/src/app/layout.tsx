import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Real Time Royale | GenLayer Game",
  description:
    "A multiplayer game where players compete by reacting to LIVE real-world data fetched on-chain.",
  keywords: ["GenLayer", "blockchain", "game", "multiplayer", "web3"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-game-darker min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}