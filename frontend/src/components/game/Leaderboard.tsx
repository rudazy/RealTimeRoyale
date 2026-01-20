import React from "react";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/genlayer";
import { formatNumber, getPlacementText, getPlacementColor } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerAddress?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function Leaderboard({
  entries,
  currentPlayerAddress,
  isLoading = false,
  onRefresh,
  className,
}: LeaderboardProps) {
  // Find current player's rank
  const currentPlayerRank = entries.findIndex(
    (e) => e.player === currentPlayerAddress
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Global Leaderboard</CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No players yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Be the first to play and get on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Top 3 Podium */}
            {entries.length >= 3 && (
              <div className="flex justify-center items-end gap-2 mb-6 pt-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mb-2",
                      "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800"
                    )}
                  >
                    {entries[1].player.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="bg-gray-300/20 rounded-t-lg w-20 h-16 flex flex-col items-center justify-center">
                    <span className="text-gray-300 font-bold">2nd</span>
                    <span className="text-white text-sm">
                      {formatNumber(entries[1].xp)}
                    </span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold mb-2",
                      "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900"
                    )}
                  >
                    {entries[0].player.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="bg-yellow-400/20 rounded-t-lg w-24 h-20 flex flex-col items-center justify-center">
                    <span className="text-yellow-400 font-bold">1st</span>
                    <span className="text-white">
                      {formatNumber(entries[0].xp)}
                    </span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-base font-bold mb-2",
                      "bg-gradient-to-br from-amber-600 to-amber-700 text-amber-100"
                    )}
                  >
                    {entries[2].player.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="bg-amber-600/20 rounded-t-lg w-18 h-12 flex flex-col items-center justify-center">
                    <span className="text-amber-600 font-bold">3rd</span>
                    <span className="text-white text-sm">
                      {formatNumber(entries[2].xp)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Full List */}
            <div className="space-y-1">
              {entries.map((entry, index) => (
                <div
                  key={entry.player}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    entry.player === currentPlayerAddress
                      ? "bg-game-accent/10 border border-game-accent/30"
                      : "bg-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "w-8 text-center font-bold",
                        getPlacementColor(index)
                      )}
                    >
                      {index + 1}
                    </span>

                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 && "bg-yellow-400 text-yellow-900",
                        index === 1 && "bg-gray-300 text-gray-800",
                        index === 2 && "bg-amber-600 text-amber-100",
                        index > 2 && "bg-white/10 text-white"
                      )}
                    >
                      {entry.player.slice(2, 4).toUpperCase()}
                    </div>

                    <span className="text-white">
                      {shortenAddress(entry.player)}
                      {entry.player === currentPlayerAddress && (
                        <span className="text-game-accent ml-2">(You)</span>
                      )}
                    </span>
                  </div>

                  <span className="text-white font-bold">
                    {formatNumber(entry.xp)} XP
                  </span>
                </div>
              ))}
            </div>

            {/* Current Player Rank (if not in top entries) */}
            {currentPlayerAddress && currentPlayerRank === -1 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 text-center">
                  You haven&apos;t played yet. Join a game to get on the leaderboard!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}