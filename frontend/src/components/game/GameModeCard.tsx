import React from "react";
import { cn } from "@/lib/utils";
import {
  getModeDisplayName,
  getModeDescription,
  getModeColor,
  getModeBgColor,
} from "@/lib/utils";
import type { GameMode } from "@/types";

interface GameModeCardProps {
  mode: GameMode;
  isActive?: boolean;
  isCompleted?: boolean;
  className?: string;
}

export function GameModeCard({
  mode,
  isActive = false,
  isCompleted = false,
  className,
}: GameModeCardProps) {
  const icons: Record<GameMode, string> = {
    crypto: "B",
    weather: "W",
    news: "N",
    sports: "S",
    trending: "T",
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all duration-300",
        isActive
          ? cn(getModeBgColor(mode), "scale-105")
          : isCompleted
          ? "bg-white/5 border-white/10 opacity-50"
          : "bg-white/5 border-white/10",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
            isActive ? getModeColor(mode) : "text-gray-400",
            isActive ? "bg-white/20" : "bg-white/5"
          )}
        >
          {icons[mode]}
        </div>

        <div>
          <p
            className={cn(
              "font-medium",
              isActive ? getModeColor(mode) : "text-white"
            )}
          >
            {getModeDisplayName(mode)}
          </p>
          <p className="text-xs text-gray-500">
            {getModeDescription(mode)}
          </p>
        </div>
      </div>

      {isActive && (
        <div className="mt-2 flex items-center gap-1">
          <span className="w-2 h-2 bg-game-accent rounded-full animate-pulse" />
          <span className="text-xs text-game-accent">Active</span>
        </div>
      )}

      {isCompleted && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-gray-500">Completed</span>
        </div>
      )}
    </div>
  );
}

interface GameModesListProps {
  currentMode?: GameMode | null;
  completedModes?: GameMode[];
  className?: string;
}

export function GameModesList({
  currentMode,
  completedModes = [],
  className,
}: GameModesListProps) {
  const allModes: GameMode[] = ["crypto", "weather", "news", "sports", "trending"];

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-gray-400 mb-3">Game Modes</p>
      <div className="grid gap-2">
        {allModes.map((mode) => (
          <GameModeCard
            key={mode}
            mode={mode}
            isActive={mode === currentMode}
            isCompleted={completedModes.includes(mode)}
          />
        ))}
      </div>
    </div>
  );
}