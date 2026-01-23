"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bitcoin,
  Send,
  Loader2,
  Clock,
  Check,
  Users,
  Zap,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/lib/genlayer/wallet";
import {
  useGameState,
  useStartRound,
  useSubmitAnswer,
  useJudgeRound,
} from "@/lib/hooks/useRealTimeRoyale";
import { AddressDisplay } from "./AddressDisplay";

interface GameRoundProps {
  roomId: string;
  onRoundEnd?: () => void;
}

export function GameRound({ roomId, onRoundEnd }: GameRoundProps) {
  const { address } = useWallet();
  const {
    room,
    isHost,
    hasSubmitted,
    allPlayersSubmitted,
    currentRound,
    maxRounds,
    challenge,
    isLoadingRoom,
  } = useGameState(roomId);
  const { startRoundAsync, isStartingRound } = useStartRound();
  const { submitAnswerAsync, isSubmitting } = useSubmitAnswer();
  const { judgeRoundAsync, isJudging } = useJudgeRound();

  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundStarted, setRoundStarted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!roundStarted || hasSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundStarted, hasSubmitted]);

  // Check if challenge is set (round has started)
  useEffect(() => {
    if (challenge && challenge.length > 0) {
      setRoundStarted(true);
      setTimeLeft(30);
    }
  }, [challenge]);

  const handleStartRound = async () => {
    try {
      await startRoundAsync(roomId);
      setRoundStarted(true);
      setTimeLeft(30);
    } catch (err) {
      console.error("Error starting round:", err);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    try {
      await submitAnswerAsync({ roomId, answer: answer.trim() });
      setAnswer("");
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  const handleJudgeRound = async () => {
    try {
      await judgeRoundAsync(roomId);
      setRoundStarted(false);
      onRoundEnd?.();
    } catch (err) {
      console.error("Error judging round:", err);
    }
  };

  if (isLoadingRoom) {
    return (
      <div className="brand-card p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
        <p className="mt-4 text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="brand-card p-8 text-center">
        <p className="text-destructive">Room not found</p>
      </div>
    );
  }

  // Waiting for host to start round
  if (!roundStarted && !challenge) {
    return (
      <div className="brand-card p-6 space-y-6 max-w-2xl mx-auto">
        {/* Round Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-semibold text-accent">
              Round {currentRound} of {maxRounds}
            </span>
          </div>
          <h2 className="text-2xl font-bold">Get Ready!</h2>
          <p className="text-muted-foreground mt-2">
            {isHost
              ? "Start the round when all players are ready"
              : "Waiting for host to start the round..."}
          </p>
        </div>

        {/* Players Status */}
        <div className="bg-secondary/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Players Ready</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {room.players.map((player) => (
              <div
                key={player}
                className="px-3 py-1.5 bg-secondary/50 rounded-full text-xs"
              >
                <AddressDisplay address={player} maxLength={8} />
              </div>
            ))}
          </div>
        </div>

        {/* Start Round Button (Host Only) */}
        {isHost && (
          <Button
            onClick={handleStartRound}
            disabled={isStartingRound}
            variant="gradient"
            className="w-full h-12 text-lg"
          >
            {isStartingRound ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting Round...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Round {currentRound}
              </>
            )}
          </Button>
        )}

        {!isHost && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for host...</span>
          </div>
        )}
      </div>
    );
  }

  // Active round - show challenge and input
  return (
    <div className="brand-card p-6 space-y-6 max-w-2xl mx-auto">
      {/* Round Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-semibold text-accent">
            Round {currentRound} of {maxRounds}
          </span>
        </div>

        {/* Timer */}
        {!hasSubmitted && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg ${
              timeLeft <= 10
                ? "bg-destructive/20 text-destructive animate-pulse"
                : "bg-secondary"
            }`}
          >
            <Clock className="w-5 h-5" />
            {timeLeft}s
          </div>
        )}
      </div>

      {/* Challenge */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-3 mb-4">
          <Bitcoin className="w-10 h-10 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{challenge || "Guess the Bitcoin Price!"}</h2>
        <p className="text-muted-foreground">
          Enter your best guess for the current BTC price in USD
        </p>
      </div>

      {/* Answer Input */}
      {!hasSubmitted ? (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
              $
            </span>
            <Input
              type="number"
              placeholder="e.g., 95000"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="pl-8 h-14 text-xl font-mono text-center"
              disabled={isSubmitting}
            />
          </div>

          <Button
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || !answer.trim() || timeLeft === 0}
            variant="gradient"
            className="w-full h-12 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 rounded-full text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-semibold">Answer Submitted!</span>
          </div>
          <p className="text-muted-foreground mt-4">
            Waiting for other players...
          </p>
        </div>
      )}

      {/* Submissions Status */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Submissions</span>
          <span className="text-sm text-muted-foreground">
            {Object.keys(room.submissions).length} / {room.players.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {room.players.map((player) => {
            const hasPlayerSubmitted = player in room.submissions;
            return (
              <div
                key={player}
                className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 ${
                  hasPlayerSubmitted
                    ? "bg-green-500/20 text-green-400"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {hasPlayerSubmitted && <Check className="w-3 h-3" />}
                <AddressDisplay address={player} maxLength={6} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Judge Round Button (Host Only, when all submitted) */}
      {isHost && allPlayersSubmitted && (
        <Button
          onClick={handleJudgeRound}
          disabled={isJudging}
          variant="gradient"
          className="w-full h-12 text-lg"
        >
          {isJudging ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Judging Round...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Judge Round
            </>
          )}
        </Button>
      )}
    </div>
  );
}
