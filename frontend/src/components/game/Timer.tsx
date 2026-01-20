import React from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

interface TimerProps {
  seconds: number;
  maxSeconds?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function Timer({
  seconds,
  maxSeconds = 30,
  size = "md",
  showLabel = true,
  className,
}: TimerProps) {
  const percentage = (seconds / maxSeconds) * 100;

  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  const sizes = {
    sm: {
      container: "w-16 h-16",
      text: "text-lg",
      label: "text-xs",
    },
    md: {
      container: "w-24 h-24",
      text: "text-2xl",
      label: "text-sm",
    },
    lg: {
      container: "w-32 h-32",
      text: "text-4xl",
      label: "text-base",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          sizeConfig.container,
          isCritical && "animate-pulse"
        )}
      >
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/10"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.83} 283`}
            className={cn(
              "transition-all duration-1000",
              isCritical
                ? "text-game-error"
                : isLow
                ? "text-game-warning"
                : "text-game-accent"
            )}
          />
        </svg>

        {/* Time display */}
        <span
          className={cn(
            "font-bold font-mono",
            sizeConfig.text,
            isCritical
              ? "text-game-error"
              : isLow
              ? "text-game-warning"
              : "text-white"
          )}
        >
          {seconds}
        </span>
      </div>

      {showLabel && (
        <span className={cn("text-gray-400", sizeConfig.label)}>
          {isCritical ? "Hurry!" : isLow ? "Time running out" : "seconds left"}
        </span>
      )}
    </div>
  );
}

interface LinearTimerProps {
  seconds: number;
  maxSeconds?: number;
  className?: string;
}

export function LinearTimer({
  seconds,
  maxSeconds = 30,
  className,
}: LinearTimerProps) {
  const percentage = (seconds / maxSeconds) * 100;

  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-400">Time Remaining</span>
        <span
          className={cn(
            "text-sm font-bold font-mono",
            isCritical
              ? "text-game-error"
              : isLow
              ? "text-game-warning"
              : "text-white"
          )}
        >
          {formatTime(seconds)}
        </span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isCritical
              ? "bg-game-error"
              : isLow
              ? "bg-game-warning"
              : "bg-game-accent"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}