"use client";

import { Users, Crown, Play, Loader2, Copy, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressDisplay } from "./AddressDisplay";
import { useWallet } from "@/lib/genlayer/wallet";
import { useGameState, useStartGame } from "@/lib/hooks/useRealTimeRoyale";
import { useState } from "react";

interface RoomLobbyProps {
  roomId: string;
  onGameStart?: () => void;
  onLeave?: () => void;
}

export function RoomLobby({ roomId, onGameStart, onLeave }: RoomLobbyProps) {
  const { address } = useWallet();
  const { room, isHost, playerCount, isLoadingRoom } = useGameState(roomId);
  const { startGameAsync, isStarting } = useStartGame();
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    try {
      await startGameAsync(roomId);
      onGameStart?.();
    } catch (err) {
      console.error("Error starting game:", err);
    }
  };

  if (isLoadingRoom) {
    return (
      <div className="brand-card p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
        <p className="mt-4 text-muted-foreground">Loading room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="brand-card p-8 text-center">
        <p className="text-destructive">Room not found</p>
        <Button variant="outline" className="mt-4" onClick={onLeave}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="brand-card p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Game Lobby
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Waiting for players to join...
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave
        </Button>
      </div>

      {/* Room ID Section */}
      <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Room ID</p>
          <p className="text-xl font-mono font-bold text-accent">{roomId}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyRoomId}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Share Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        Share this Room ID with friends to invite them
      </div>

      {/* Players List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Players ({playerCount})</h3>
          <span className="text-xs text-muted-foreground">
            Min 2 players to start
          </span>
        </div>

        <div className="space-y-2">
          {room.players.map((player, index) => {
            const isCurrentPlayer = player.toLowerCase() === address?.toLowerCase();
            const isPlayerHost = player.toLowerCase() === room.host.toLowerCase();

            return (
              <div
                key={player}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all
                  ${isCurrentPlayer ? "bg-accent/20 border border-accent/50" : "bg-secondary/30"}
                `}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-pink flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <AddressDisplay
                      address={player}
                      maxLength={12}
                      className="text-sm font-medium"
                      showCopy={true}
                    />
                    {isCurrentPlayer && (
                      <span className="text-xs bg-accent/30 text-accent px-2 py-0.5 rounded-full font-semibold">
                        You
                      </span>
                    )}
                  </div>
                </div>

                {isPlayerHost && (
                  <Crown className="w-5 h-5 text-yellow-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Game Button (Host Only) */}
      {isHost && (
        <div className="pt-4 border-t border-white/10">
          <Button
            onClick={handleStartGame}
            disabled={isStarting || playerCount < 2}
            variant="gradient"
            className="w-full h-12 text-lg"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting Game...
              </>
            ) : playerCount < 2 ? (
              <>
                <Users className="w-5 h-5" />
                Waiting for Players...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Game
              </>
            )}
          </Button>
          {playerCount < 2 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Need at least 2 players to start
            </p>
          )}
        </div>
      )}

      {/* Non-Host Waiting Message */}
      {!isHost && (
        <div className="pt-4 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for host to start the game...</span>
          </div>
        </div>
      )}
    </div>
  );
}
