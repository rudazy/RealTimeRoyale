import React from "react";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/genlayer";
import { Badge } from "@/components/ui";

interface Player {
  address: string;
  score?: number;
  hasSubmitted?: boolean;
  isHost?: boolean;
}

interface PlayerListProps {
  players: Player[];
  currentPlayerAddress?: string;
  showScores?: boolean;
  showSubmissionStatus?: boolean;
  className?: string;
}

export function PlayerList({
  players,
  currentPlayerAddress,
  showScores = false,
  showSubmissionStatus = false,
  className,
}: PlayerListProps) {
  // Sort players by score if showing scores
  const sortedPlayers = showScores
    ? [...players].sort((a, b) => (b.score || 0) - (a.score || 0))
    : players;

  return (
    <div className={cn("space-y-2", className)}>
      {sortedPlayers.map((player, index) => (
        <div
          key={player.address}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            "bg-white/5 border border-white/10",
            player.address === currentPlayerAddress && "border-game-accent/50 bg-game-accent/10"
          )}
        >
          <div className="flex items-center gap-3">
            {showScores && (
              <span
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold",
                  index === 0 && "bg-yellow-400 text-black",
                  index === 1 && "bg-gray-300 text-black",
                  index === 2 && "bg-amber-600 text-white",
                  index > 2 && "bg-white/10 text-gray-400"
                )}
              >
                {index + 1}
              </span>
            )}

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  "bg-gradient-to-br from-game-accent to-cyan-600"
                )}
              >
                {player.address.slice(2, 4).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {shortenAddress(player.address)}
                  </span>
                  {player.address === currentPlayerAddress && (
                    <Badge variant="info" size="sm">
                      You
                    </Badge>
                  )}
                  {player.isHost && (
                    <Badge variant="warning" size="sm">
                      Host
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showSubmissionStatus && (
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  player.hasSubmitted ? "bg-game-success" : "bg-gray-600"
                )}
                title={player.hasSubmitted ? "Submitted" : "Waiting"}
              />
            )}

            {showScores && (
              <span className="text-white font-bold">
                {player.score || 0} pts
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}