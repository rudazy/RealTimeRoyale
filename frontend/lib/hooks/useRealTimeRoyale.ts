"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import RealTimeRoyale from "../contracts/RealTimeRoyale";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { Room, LeaderboardEntry } from "../contracts/types";

/**
 * Helper function to ensure room ID has the "room_" prefix
 * Contract expects format: "room_X" (e.g., "room_8", "room_9")
 * @param id - Room ID that may or may not have the prefix
 * @returns Properly formatted room ID with "room_" prefix
 */
export function formatRoomId(id: string | null | undefined): string {
  if (!id) return "";
  const trimmed = id.trim();
  if (!trimmed) return "";

  // Already has the correct prefix
  if (trimmed.startsWith("room_")) {
    return trimmed;
  }

  // Just a number - add the prefix
  return `room_${trimmed}`;
}

/**
 * Hook to get the RealTimeRoyale contract instance
 */
export function useRealTimeRoyaleContract(): RealTimeRoyale | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file."
      );
      return null;
    }

    return new RealTimeRoyale(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

/**
 * Hook to fetch a specific room
 */
export function useRoom(roomId: string | null) {
  const contract = useRealTimeRoyaleContract();
  // Ensure room ID has proper format
  const formattedRoomId = formatRoomId(roomId);

  return useQuery<Room | null, Error>({
    queryKey: ["room", formattedRoomId],
    queryFn: async () => {
      if (!contract || !formattedRoomId) {
        console.log("useRoom: No contract or roomId", { contract: !!contract, roomId, formattedRoomId });
        return null;
      }
      console.log("useRoom: Fetching room with ID:", formattedRoomId);
      const room = await contract.getRoom(formattedRoomId);
      console.log("useRoom: Got room data:", room);
      return room;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
    staleTime: 1000,
    enabled: !!contract && !!formattedRoomId,
  });
}

/**
 * Hook to fetch player XP
 */
export function usePlayerXP(address: string | null) {
  const contract = useRealTimeRoyaleContract();

  return useQuery<number, Error>({
    queryKey: ["playerXP", address],
    queryFn: () => {
      if (!contract) {
        return Promise.resolve(0);
      }
      return contract.getPlayerXP(address);
    },
    refetchOnWindowFocus: true,
    enabled: !!address && !!contract,
    staleTime: 5000,
  });
}

/**
 * Hook to fetch the leaderboard
 */
export function useLeaderboard() {
  const contract = useRealTimeRoyaleContract();

  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ["leaderboard"],
    queryFn: () => {
      if (!contract) {
        return Promise.resolve([]);
      }
      return contract.getLeaderboard();
    },
    refetchOnWindowFocus: true,
    staleTime: 5000,
    enabled: !!contract,
  });
}

/**
 * Hook to create a new room
 */
export function useCreateRoom() {
  const contract = useRealTimeRoyaleContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }
      setIsCreating(true);
      const result = await contract.createRoom();
      console.log("Create room result:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Room created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["room"] });
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
      setIsCreating(false);
      success("Room created!", {
        description: `Room ID: ${data.roomId}`,
      });
    },
    onError: (err: any) => {
      console.error("Error creating room:", err);
      setIsCreating(false);
      error("Failed to create room", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isCreating,
    createRoom: mutation.mutate,
    createRoomAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to join an existing room
 */
export function useJoinRoom() {
  const contract = useRealTimeRoyaleContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isJoining, setIsJoining] = useState(false);

  const mutation = useMutation({
    mutationFn: async (roomId: string) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }
      // Ensure room ID has proper format
      const formattedRoomId = formatRoomId(roomId);
      console.log("useJoinRoom: Joining room:", formattedRoomId, "(input was:", roomId, ")");
      setIsJoining(true);
      const result = await contract.joinRoom(formattedRoomId);
      console.log("useJoinRoom: Join result:", result);
      return { receipt: result, roomId: formattedRoomId };
    },
    onSuccess: (data) => {
      console.log("useJoinRoom: Successfully joined room:", data.roomId);
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
      setIsJoining(false);
      success("Joined room!", {
        description: `You have joined ${data.roomId}`,
      });
    },
    onError: (err: any) => {
      console.error("Error joining room:", err);
      setIsJoining(false);
      error("Failed to join room", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isJoining,
    joinRoom: mutation.mutate,
    joinRoomAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to start a game (host only)
 */
export function useStartGame() {
  const contract = useRealTimeRoyaleContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isStarting, setIsStarting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (roomId: string) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }
      // Ensure room ID has proper format
      const formattedRoomId = formatRoomId(roomId);
      setIsStarting(true);
      const result = await contract.startGame(formattedRoomId);
      return { result, roomId: formattedRoomId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
      setIsStarting(false);
      success("Game started!", {
        description: "Get ready to play!",
      });
    },
    onError: (err: any) => {
      console.error("Error starting game:", err);
      setIsStarting(false);
      error("Failed to start game", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isStarting,
    startGame: mutation.mutate,
    startGameAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to start a new round
 */
export function useStartRound() {
  const contract = useRealTimeRoyaleContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isStartingRound, setIsStartingRound] = useState(false);

  const mutation = useMutation({
    mutationFn: async (roomId: string) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }
      // Ensure room ID has proper format
      const formattedRoomId = formatRoomId(roomId);
      setIsStartingRound(true);
      const result = await contract.startRound(formattedRoomId);
      return { result, roomId: formattedRoomId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
      setIsStartingRound(false);
      success("Round started!", {
        description: "Make your guess!",
      });
    },
    onError: (err: any) => {
      console.error("Error starting round:", err);
      setIsStartingRound(false);
      error("Failed to start round", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isStartingRound,
    startRound: mutation.mutate,
    startRoundAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to submit an answer
 */
export function useSubmitAnswer() {
  const contract = useRealTimeRoyaleContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ roomId, answer }: { roomId: string; answer: string }) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }
      // Ensure room ID has proper format
      const formattedRoomId = formatRoomId(roomId);
      setIsSubmitting(true);
      const result = await contract.submitAnswer(formattedRoomId, answer);
      return { result, roomId: formattedRoomId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
      setIsSubmitting(false);
      success("Answer submitted!", {
        description: "Waiting for other players...",
      });
    },
    onError: (err: any) => {
      console.error("Error submitting answer:", err);
      setIsSubmitting(false);
      error("Failed to submit answer", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isSubmitting,
    submitAnswer: mutation.mutate,
    submitAnswerAsync: mutation.mutateAsync,
  };
}

/**
 * Hook to judge a round
 */
export function useJudgeRound() {
  const contract = useRealTimeRoyaleContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isJudging, setIsJudging] = useState(false);

  const mutation = useMutation({
    mutationFn: async (roomId: string) => {
      if (!contract) {
        throw new Error("Contract not configured.");
      }
      if (!address) {
        throw new Error("Wallet not connected.");
      }
      // Ensure room ID has proper format
      const formattedRoomId = formatRoomId(roomId);
      setIsJudging(true);
      const result = await contract.judgeRound(formattedRoomId);
      return { result, roomId: formattedRoomId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["room", data.roomId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["playerXP"] });
      setIsJudging(false);
      success("Round judged!", {
        description: "See the results!",
      });
    },
    onError: (err: any) => {
      console.error("Error judging round:", err);
      setIsJudging(false);
      error("Failed to judge round", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isJudging,
    judgeRound: mutation.mutate,
    judgeRoundAsync: mutation.mutateAsync,
  };
}

/**
 * Combined hook for managing game state
 */
export function useGameState(roomId: string | null) {
  const { address } = useWallet();
  // formatRoomId is already called inside useRoom, but we need the formatted ID for consistency
  const formattedRoomId = formatRoomId(roomId);
  const { data: room, isLoading: isLoadingRoom, refetch: refetchRoom } = useRoom(formattedRoomId);

  const isHost = useMemo(() => {
    if (!room || !address) return false;
    return room.host.toLowerCase() === address.toLowerCase();
  }, [room, address]);

  const hasSubmitted = useMemo(() => {
    if (!room || !address) return false;
    return address.toLowerCase() in Object.fromEntries(
      Object.entries(room.submissions).map(([k, v]) => [k.toLowerCase(), v])
    );
  }, [room, address]);

  const allPlayersSubmitted = useMemo(() => {
    if (!room) return false;
    return room.players.length === Object.keys(room.submissions).length;
  }, [room]);

  const isWaiting = room?.status === "waiting";
  const isPlaying = room?.status === "playing";
  const isFinished = room?.status === "finished";
  const currentRound = room?.current_round || 0;
  const maxRounds = room?.max_rounds || 3;
  const challenge = room?.challenge || "";
  const playerCount = room?.players.length || 0;

  return {
    room,
    isLoadingRoom,
    refetchRoom,
    isHost,
    hasSubmitted,
    allPlayersSubmitted,
    isWaiting,
    isPlaying,
    isFinished,
    currentRound,
    maxRounds,
    challenge,
    playerCount,
  };
}
