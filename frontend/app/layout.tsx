import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Font for body text and UI (Switzer alternative per brand guidelines)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Font for titles (Lineca alternative per brand guidelines)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://realtimeroyale.vercel.app"),
  title: "Real Time Royale - Live Blockchain Gaming",
  description: "Compete in real-time multiplayer challenges on GenLayer. Guess live crypto prices, earn XP, climb the leaderboard!",
  manifest: "/site.webmanifest",
  keywords: ["blockchain", "gaming", "GenLayer", "multiplayer", "crypto", "Bitcoin", "price prediction", "XP", "leaderboard"],
  authors: [{ name: "Real Time Royale" }],
  creator: "Real Time Royale",
  publisher: "GenLayer",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://realtimeroyale.vercel.app",
    siteName: "Real Time Royale",
    title: "Real Time Royale - Live Blockchain Gaming",
    description: "Compete in real-time multiplayer challenges on GenLayer. Guess live crypto prices, earn XP, climb the leaderboard!",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Real Time Royale - Compete in Real-Time on GenLayer Blockchain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Time Royale - Live Blockchain Gaming",
    description: "Compete in real-time multiplayer challenges on GenLayer. Guess live crypto prices, earn XP, climb the leaderboard!",
    images: ["/og-image.svg"],
    creator: "@genlayer",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#8B5CF6", // Purple brand color
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
