"use client";

import { Trophy, Medal, Award, ArrowRight, Home, Zap, Bitcoin, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressDisplay } from "./AddressDisplay";
import { useWallet } from "@/lib/genlayer/wallet";
import { useGameState } from "@/lib/hooks/useRealTimeRoyale";
import type { Room } from "@/lib/contracts/types";

interface RoundResultsProps {
  roomId: string;
  onNextRound?: () => void;
  onGameEnd?: () => void;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  }
}

function getPointsForRank(rank: number): number {
  const points = [100, 75, 50, 25];
  return points[rank - 1] || 25;
}

export function RoundResults({ roomId, onNextRound, onGameEnd }: RoundResultsProps) {
  const { address } = useWallet();
  const { room, isHost, currentRound, maxRounds, isFinished } = useGameState(roomId);

  if (!room) {
    return (
      <div className="brand-card p-8 text-center">
        <p className="text-destructive">Room not found</p>
      </div>
    );
  }

  // Sort players by score for this room
  const sortedPlayers = Object.entries(room.scores)
    .map(([player, score]) => ({ player, score }))
    .sort((a, b) => b.score - a.score);

  const actualPrice = room.answer;
  const isGameOver = isFinished || currentRound > maxRounds;

  return (
    <div className="brand-card p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
          {isGameOver ? (
            <>
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-accent">Game Over!</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-accent" />
              <span className="font-semibold text-accent">
                Round {currentRound - 1} Results
              </span>
            </>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {isGameOver ? "Final Standings" : "Round Complete!"}
        </h2>
      </div>

      {/* Actual Price Reveal */}
      {actualPrice && (
        <div className="bg-gradient-to-r from-accent/20 to-pink/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bitcoin className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Actual BTC Price</span>
          </div>
          <p className="text-3xl font-bold font-mono text-accent">
            ${Number(actualPrice).toLocaleString()}
          </p>
        </div>
      )}

      {/* Results Table */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          {isGameOver ? "Final Scores" : "Current Standings"}
        </h3>

        <div className="space-y-2">
          {sortedPlayers.map((entry, index) => {
            const rank = index + 1;
            const isCurrentPlayer =
              entry.player.toLowerCase() === address?.toLowerCase();
            const pointsEarned = getPointsForRank(rank);

            return (
              <div
                key={entry.player}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all
                  ${
                    isCurrentPlayer
                      ? "bg-accent/20 border-2 border-accent/50"
                      : rank === 1
                      ? "bg-yellow-500/10 border border-yellow-500/30"
                      : "bg-secondary/30"
                  }
                `}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-10 flex items-center justify-center">
                  {getRankIcon(rank)}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <AddressDisplay
                      address={entry.player}
                      maxLength={12}
                      className="font-medium"
                      showCopy={true}
                    />
                    {isCurrentPlayer && (
                      <span className="text-xs bg-accent/30 text-accent px-2 py-0.5 rounded-full font-semibold">
                        You
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-xl font-bold text-accent">
                    {entry.score}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {!isGameOver && `+${pointsEarned} this round`}
                    {isGameOver && "XP"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Legend */}
      {!isGameOver && (
        <div className="bg-secondary/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2">Points Awarded</h4>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-yellow-500/10 rounded p-2">
              <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="font-bold">100</div>
              <div className="text-muted-foreground">1st</div>
            </div>
            <div className="bg-gray-500/10 rounded p-2">
              <Medal className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="font-bold">75</div>
              <div className="text-muted-foreground">2nd</div>
            </div>
            <div className="bg-amber-500/10 rounded p-2">
              <Award className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <div className="font-bold">50</div>
              <div className="text-muted-foreground">3rd</div>
            </div>
            <div className="bg-secondary/50 rounded p-2">
              <span className="text-muted-foreground block mb-1">#4+</span>
              <div className="font-bold">25</div>
              <div className="text-muted-foreground">Others</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10">
        {isGameOver ? (
          <div className="space-y-3">
            <div className="text-center text-sm text-muted-foreground mb-4">
              Scores have been added to the global leaderboard!
            </div>
            <Button
              onClick={onGameEnd}
              variant="gradient"
              className="w-full h-12 text-lg"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
          </div>
        ) : isHost ? (
          <Button
            onClick={onNextRound}
            variant="gradient"
            className="w-full h-12 text-lg"
          >
            <ArrowRight className="w-5 h-5" />
            Next Round ({currentRound} of {maxRounds})
          </Button>
        ) : (
          <div className="text-center text-muted-foreground">
            Waiting for host to start next round...
          </div>
        )}
      </div>
    </div>
  );
}
