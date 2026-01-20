import React from "react";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/genlayer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { getPlacementText, getPlacementColor } from "@/lib/utils";

interface ScoreBoardEntry {
  player: string;
  score: number;
}

interface ScoreBoardProps {
  scores: Record<string, number>;
  currentPlayerAddress?: string;
  title?: string;
  className?: string;
}

export function ScoreBoard({
  scores,
  currentPlayerAddress,
  title = "Scores",
  className,
}: ScoreBoardProps) {
  // Convert to array and sort by score
  const sortedEntries: ScoreBoardEntry[] = Object.entries(scores)
    .map(([player, score]) => ({ player, score }))
    .sort((a, b) => b.score - a.score);

  if (sortedEntries.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedEntries.map((entry, index) => (
            <div
              key={entry.player}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                "bg-white/5",
                entry.player === currentPlayerAddress && "ring-1 ring-game-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-lg font-bold",
                    getPlacementColor(index)
                  )}
                >
                  {getPlacementText(index)}
                </span>

                <span className="text-white">
                  {shortenAddress(entry.player)}
                  {entry.player === currentPlayerAddress && (
                    <span className="text-game-accent ml-2">(You)</span>
                  )}
                </span>
              </div>

              <span className="text-xl font-bold text-white">
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface FinalResultsProps {
  scores: Record<string, number>;
  currentPlayerAddress?: string;
  className?: string;
}

export function FinalResults({
  scores,
  currentPlayerAddress,
  className,
}: FinalResultsProps) {
  const sortedEntries: ScoreBoardEntry[] = Object.entries(scores)
    .map(([player, score]) => ({ player, score }))
    .sort((a, b) => b.score - a.score);

  const winner = sortedEntries[0];
  const isWinner = winner?.player === currentPlayerAddress;

  return (
    <div className={cn("text-center", className)}>
      <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>

      {isWinner ? (
        <p className="text-xl text-game-success mb-6">
          Congratulations! You won!
        </p>
      ) : (
        <p className="text-xl text-gray-400 mb-6">
          Winner: {shortenAddress(winner?.player || "")}
        </p>
      )}

      <div className="flex justify-center gap-4 mb-8">
        {sortedEntries.slice(0, 3).map((entry, index) => (
          <div
            key={entry.player}
            className={cn(
              "flex flex-col items-center p-4 rounded-xl",
              index === 0 && "bg-yellow-400/20 border border-yellow-400/50",
              index === 1 && "bg-gray-300/20 border border-gray-300/50",
              index === 2 && "bg-amber-600/20 border border-amber-600/50"
            )}
          >
            <span
              className={cn(
                "text-4xl font-bold mb-2",
                getPlacementColor(index)
              )}
            >
              {getPlacementText(index)}
            </span>
            <span className="text-white font-medium">
              {shortenAddress(entry.player)}
            </span>
            <span className="text-2xl font-bold text-white mt-1">
              {entry.score} pts
            </span>
          </div>
        ))}
      </div>

      {sortedEntries.length > 3 && (
        <div className="space-y-2">
          {sortedEntries.slice(3).map((entry, index) => (
            <div
              key={entry.player}
              className="flex justify-between items-center p-2 bg-white/5 rounded-lg"
            >
              <span className="text-gray-400">
                {getPlacementText(index + 3)} - {shortenAddress(entry.player)}
              </span>
              <span className="text-white font-bold">{entry.score} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}