import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/genlayer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
} from "@/components/ui";
import type { PublicRoom } from "@/types";

interface LobbyProps {
  publicRooms: PublicRoom[];
  isLoading?: boolean;
  onCreateRoom: (isPrivate: boolean) => void;
  onJoinRoom: (roomId: string) => void;
  onRefreshRooms: () => void;
  className?: string;
}

export function Lobby({
  publicRooms,
  isLoading = false,
  onCreateRoom,
  onJoinRoom,
  onRefreshRooms,
  className,
}: LobbyProps) {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");

  const handleJoinByCode = () => {
    if (joinRoomId.trim()) {
      onJoinRoom(joinRoomId.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoinByCode();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Create Room Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create a Room</CardTitle>
          <CardDescription>
            Start a new game and invite your friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={() => onCreateRoom(false)}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Public Room
            </Button>
            <Button
              variant="secondary"
              onClick={() => onCreateRoom(true)}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Private Room
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Public rooms are visible to everyone. Private rooms require an invite code.
          </p>
        </CardContent>
      </Card>

      {/* Join Room Section */}
      <Card>
        <CardHeader>
          <CardTitle>Join a Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                activeTab === "public"
                  ? "text-game-accent border-b-2 border-game-accent"
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => setActiveTab("public")}
            >
              Public Rooms
            </button>
            <button
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                activeTab === "private"
                  ? "text-game-accent border-b-2 border-game-accent"
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => setActiveTab("private")}
            >
              Join by Code
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "public" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {publicRooms.length} room{publicRooms.length !== 1 ? "s" : ""} available
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefreshRooms}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </div>

              {publicRooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No public rooms available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Create one to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {publicRooms.map((room) => (
                    <div
                      key={room.room_id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div>
                        <p className="text-white font-medium">{room.room_id}</p>
                        <p className="text-xs text-gray-500">
                          Host: {shortenAddress(room.host)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {room.players}/8
                        </span>
                        <Button
                          size="sm"
                          onClick={() => onJoinRoom(room.room_id)}
                          disabled={isLoading || room.players >= 8}
                        >
                          {room.players >= 8 ? "Full" : "Join"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="Room Code"
                placeholder="Enter room code (e.g. room_1)"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                className="w-full"
                onClick={handleJoinByCode}
                disabled={!joinRoomId.trim() || isLoading}
                isLoading={isLoading}
              >
                Join Room
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}