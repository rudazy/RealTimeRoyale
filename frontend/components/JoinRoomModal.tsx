"use client";

import { useState } from "react";
import { Users, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWallet } from "@/lib/genlayer/wallet";
import { useJoinRoom } from "@/lib/hooks/useRealTimeRoyale";

interface JoinRoomModalProps {
  onRoomJoined?: (roomId: string) => void;
}

export function JoinRoomModal({ onRoomJoined }: JoinRoomModalProps) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const { isConnected } = useWallet();
  const { joinRoomAsync, isJoining } = useJoinRoom();

  const handleJoinRoom = async () => {
    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId) return;

    try {
      console.log("JoinRoomModal: Attempting to join room:", trimmedRoomId);
      const result = await joinRoomAsync(trimmedRoomId);
      console.log("JoinRoomModal: Join successful, result:", result);
      setOpen(false);
      setRoomId("");
      // Pass the room ID from the result to ensure consistency
      onRoomJoined?.(result.roomId || trimmedRoomId);
    } catch (err) {
      console.error("Error joining room:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Join Room</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-accent" />
            Join Game Room
          </DialogTitle>
          <DialogDescription>
            Enter a room ID to join an existing game.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Room ID</label>
            <Input
              placeholder="e.g., room_1"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isJoining}
            />
            <p className="text-xs text-muted-foreground">
              Ask the host for the room ID
            </p>
          </div>

          {!isConnected ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to join a room
              </p>
            </div>
          ) : (
            <Button
              onClick={handleJoinRoom}
              disabled={isJoining || !roomId.trim()}
              variant="gradient"
              className="w-full"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Join Room
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
