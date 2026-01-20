import React from "react";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/genlayer";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui";

interface HeaderProps {
  playerAddress?: string | null;
  playerXp?: number;
  className?: string;
}

export function Header({
  playerAddress,
  playerXp = 0,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between p-4 border-b border-white/10",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-game-accent to-cyan-600 flex items-center justify-center">
          <span className="text-game-dark font-bold text-lg">R</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Real Time Royale</h1>
          <p className="text-xs text-gray-500">Powered by GenLayer</p>
        </div>
      </div>

      {/* Player Info */}
      {playerAddress && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Your XP</p>
            <p className="text-white font-bold">{formatNumber(playerXp)}</p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-game-accent to-cyan-600 flex items-center justify-center text-sm font-bold text-game-dark">
              {playerAddress.slice(2, 4).toUpperCase()}
            </div>
            <span className="text-white text-sm font-mono">
              {shortenAddress(playerAddress)}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}