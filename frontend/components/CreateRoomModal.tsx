"use client";

import { useState } from "react";
import { Plus, Loader2, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWallet } from "@/lib/genlayer/wallet";
import { useCreateRoom } from "@/lib/hooks/useRealTimeRoyale";

interface CreateRoomModalProps {
  onRoomCreated?: (roomId: string) => void;
}

export function CreateRoomModal({ onRoomCreated }: CreateRoomModalProps) {
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useWallet();
  const { createRoomAsync, isCreating } = useCreateRoom();

  const handleCreateRoom = async () => {
    try {
      const result = await createRoomAsync();
      if (result?.roomId) {
        setOpen(false);
        onRoomCreated?.(result.roomId);
      }
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Room</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-accent" />
            Create Game Room
          </DialogTitle>
          <DialogDescription>
            Create a new Real Time Royale room and invite friends to join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="brand-card p-4 space-y-3">
            <h3 className="font-semibold text-sm">Game Rules</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-accent">1.</span>
                <span>Players guess the live Bitcoin price</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">2.</span>
                <span>Closest guess wins the round</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">3.</span>
                <span>3 rounds total, earn XP based on placement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">4.</span>
                <span>Points: 1st=100, 2nd=75, 3rd=50, others=25</span>
              </li>
            </ul>
          </div>

          {!isConnected ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to create a room
              </p>
            </div>
          ) : (
            <Button
              onClick={handleCreateRoom}
              disabled={isCreating}
              variant="gradient"
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  <Gamepad2 className="w-4 h-4" />
                  Create Room
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
