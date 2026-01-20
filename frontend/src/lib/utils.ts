import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// Format time remaining
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Get mode display name
export function getModeDisplayName(mode: string): string {
  const names: Record<string, string> = {
    crypto: "Crypto Price",
    weather: "Weather",
    news: "News Impact",
    sports: "Sports",
    trending: "Trending Topics",
  };
  return names[mode] || mode;
}

// Get mode description
export function getModeDescription(mode: string): string {
  const descriptions: Record<string, string> = {
    crypto: "Guess the live cryptocurrency price",
    weather: "Guess the current temperature",
    news: "Rate a headline's market impact",
    sports: "Predict live sports scores",
    trending: "Explain why something is trending",
  };
  return descriptions[mode] || "";
}

// Get mode color
export function getModeColor(mode: string): string {
  const colors: Record<string, string> = {
    crypto: "text-yellow-400",
    weather: "text-blue-400",
    news: "text-purple-400",
    sports: "text-green-400",
    trending: "text-pink-400",
  };
  return colors[mode] || "text-white";
}

// Get mode background color
export function getModeBgColor(mode: string): string {
  const colors: Record<string, string> = {
    crypto: "bg-yellow-400/10 border-yellow-400/30",
    weather: "bg-blue-400/10 border-blue-400/30",
    news: "bg-purple-400/10 border-purple-400/30",
    sports: "bg-green-400/10 border-green-400/30",
    trending: "bg-pink-400/10 border-pink-400/30",
  };
  return colors[mode] || "bg-white/10 border-white/30";
}

// Calculate placement text
export function getPlacementText(position: number): string {
  if (position === 0) return "1st";
  if (position === 1) return "2nd";
  if (position === 2) return "3rd";
  return `${position + 1}th`;
}

// Get placement color
export function getPlacementColor(position: number): string {
  if (position === 0) return "text-yellow-400";
  if (position === 1) return "text-gray-300";
  if (position === 2) return "text-amber-600";
  return "text-gray-400";
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Generate room invite link
export function generateInviteLink(roomId: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/room/${roomId}`;
}

// Validate answer based on mode
export function validateAnswer(mode: string, answer: string): string | null {
  if (!answer.trim()) {
    return "Please enter an answer";
  }

  if (mode === "crypto" || mode === "weather") {
    const num = parseFloat(answer);
    if (isNaN(num)) {
      return "Please enter a valid number";
    }
    if (num < 0) {
      return "Please enter a positive number";
    }
  }

  if (mode === "news" || mode === "trending") {
    if (answer.length < 10) {
      return "Please provide a more detailed answer";
    }
  }

  return null;
}