import React from "react";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/genlayer";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { getPlacementText, getPlacementColor } from "@/lib/utils";

interface RoundResultsProps {
  rankings: Array<{
    player: string;
    answer: string;
    reason?: string;
    difference?: number;
  }>;
  reasoning: string;
  actualAnswer: string;
  currentPlayerAddress?: string;
  className?: string;
}

export function RoundResults({
  rankings,
  reasoning,
  actualAnswer,
  currentPlayerAddress,
  className,
}: RoundResultsProps) {
  return (
    <Card variant="highlighted" className={className}>
      <CardHeader>
        <CardTitle>Round Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actual Answer */}
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Actual Answer</p>
          <p className="text-lg font-bold text-game-accent">{actualAnswer}</p>
        </div>

        {/* AI Reasoning */}
        {reasoning && (
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">AI Judgment</p>
            <p className="text-white">{reasoning}</p>
          </div>
        )}

        {/* Rankings */}
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Rankings</p>
          {rankings.map((entry, index) => (
            <div
              key={entry.player}
              className={cn(
                "p-3 rounded-lg border",
                entry.player === currentPlayerAddress
                  ? "bg-game-accent/10 border-game-accent/30"
                  : "bg-white/5 border-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("font-bold", getPlacementColor(index))}
                  >
                    {getPlacementText(index)}
                  </span>
                  <span className="text-white">
                    {shortenAddress(entry.player)}
                  </span>
                  {entry.player === currentPlayerAddress && (
                    <Badge variant="info" size="sm">You</Badge>
                  )}
                </div>

                {entry.difference !== undefined && (
                  <span className="text-sm text-gray-400">
                    Diff: {entry.difference.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-gray-300 text-sm">
                Answer: {entry.answer}
              </p>

              {entry.reason && (
                <p className="text-gray-500 text-xs mt-1 italic">
                  {entry.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}