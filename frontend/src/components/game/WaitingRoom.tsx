import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { copyToClipboard, generateInviteLink } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import { PlayerList } from "./PlayerList";

interface WaitingRoomProps {
  roomId: string;
  players: string[];
  hostAddress: string;
  currentPlayerAddress: string;
  isPrivate: boolean;
  isHost: boolean;
  isLoading?: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  className?: string;
}

export function WaitingRoom({
  roomId,
  players,
  hostAddress,
  currentPlayerAddress,
  isPrivate,
  isHost,
  isLoading = false,
  onStartGame,
  onLeaveRoom,
  className,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = async () => {
    const link = generateInviteLink(roomId);
    const success = await copyToClipboard(link);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyRoomId = async () => {
    const success = await copyToClipboard(roomId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canStartGame = players.length >= 2;

  // Convert players to PlayerList format
  const playerList = players.map((address) => ({
    address,
    isHost: address === hostAddress,
  }));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Room Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Waiting Room</CardTitle>
            <Badge variant={isPrivate ? "warning" : "success"}>
              {isPrivate ? "Private" : "Public"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Room ID */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-sm text-gray-400">Room ID</p>
              <p className="text-white font-mono">{roomId}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyRoomId}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {/* Player Count */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Players</span>
            <span className="text-white font-bold">
              {players.length} / 8
            </span>
          </div>

          {/* Progress bar for players */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                players.length >= 2 ? "bg-game-success" : "bg-game-warning"
              )}
              style={{ width: `${(players.length / 8) * 100}%` }}
            />
          </div>

          {players.length < 2 && (
            <p className="text-sm text-game-warning">
              Need at least 2 players to start
            </p>
          )}
        </CardContent>
      </Card>

      {/* Player List */}
      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerList
            players={playerList}
            currentPlayerAddress={currentPlayerAddress}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        {isPrivate && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleCopyInvite}
          >
            {copied ? "Link Copied!" : "Copy Invite Link"}
          </Button>
        )}

        {isHost ? (
          <Button
            className="w-full"
            onClick={onStartGame}
            disabled={!canStartGame || isLoading}
            isLoading={isLoading}
          >
            {canStartGame ? "Start Game" : "Waiting for Players..."}
          </Button>
        ) : (
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-gray-400">
              Waiting for host to start the game...
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full text-gray-400 hover:text-white"
          onClick={onLeaveRoom}
        >
          Leave Room
        </Button>
      </div>
    </div>
  );
}