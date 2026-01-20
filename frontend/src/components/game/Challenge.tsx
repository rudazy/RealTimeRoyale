import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  getModeDisplayName,
  getModeDescription,
  getModeColor,
  getModeBgColor,
  validateAnswer,
} from "@/lib/utils";
import { Card, CardContent, Button, Input, TextArea } from "@/components/ui";
import { LinearTimer } from "./Timer";
import type { GameMode } from "@/types";

interface ChallengeProps {
  mode: GameMode;
  challenge: string;
  roundNumber: number;
  maxRounds: number;
  timeRemaining: number;
  hasSubmitted: boolean;
  submittedAnswer?: string;
  isLoading?: boolean;
  onSubmit: (answer: string) => void;
  className?: string;
}

export function Challenge({
  mode,
  challenge,
  roundNumber,
  maxRounds,
  timeRemaining,
  hasSubmitted,
  submittedAnswer,
  isLoading = false,
  onSubmit,
  className,
}: ChallengeProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const validationError = validateAnswer(mode, answer);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onSubmit(answer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !hasSubmitted) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isObjectiveMode = mode === "crypto" || mode === "weather" || mode === "sports";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Round indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Round</span>
          <span className="text-white font-bold">
            {roundNumber} / {maxRounds}
          </span>
        </div>

        <div
          className={cn(
            "px-3 py-1 rounded-full border text-sm font-medium",
            getModeBgColor(mode),
            getModeColor(mode)
          )}
        >
          {getModeDisplayName(mode)}
        </div>
      </div>

      {/* Timer */}
      <LinearTimer seconds={timeRemaining} maxSeconds={30} />

      {/* Challenge Card */}
      <Card variant="highlighted" padding="lg">
        <CardContent>
          <p className="text-sm text-gray-400 mb-2">
            {getModeDescription(mode)}
          </p>
          <p className="text-xl text-white font-medium">{challenge}</p>
        </CardContent>
      </Card>

      {/* Answer Input */}
      {hasSubmitted ? (
        <Card className="bg-game-success/10 border-game-success/30">
          <CardContent>
            <p className="text-game-success font-medium mb-1">
              Answer Submitted!
            </p>
            <p className="text-white">Your answer: {submittedAnswer}</p>
            <p className="text-gray-400 text-sm mt-2">
              Waiting for other players...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {isObjectiveMode ? (
            <Input
              label="Your Answer"
              type="number"
              placeholder={
                mode === "crypto"
                  ? "e.g. 45000"
                  : mode === "weather"
                  ? "e.g. 25"
                  : "Enter your guess"
              }
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              error={error || undefined}
              disabled={isLoading}
            />
          ) : (
            <TextArea
              label="Your Answer"
              placeholder="Explain your reasoning..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              error={error || undefined}
              disabled={isLoading}
            />
          )}

          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!answer.trim() || isLoading}
            className="w-full"
          >
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  );
}