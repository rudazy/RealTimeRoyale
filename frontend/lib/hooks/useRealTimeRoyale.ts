"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import RealTimeRoyale from "../contracts/RealTimeRoyale";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type { Room, LeaderboardEntry } from "../contracts/types";

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

  return useQuery<Room | null, Error>({
    queryKey: ["room", roomId],
    queryFn: () => {
      if (!contract || !roomId) {
        return Promise.resolve(null);
      }
      return contract.getRoom(roomId);
    },
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
    staleTime: 1000,
    enabled: !!contract && !!roomId,
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
      return contract.createRoom();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["room"] });
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
      setIsJoining(true);
      return contract.joinRoom(roomId);
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setIsJoining(false);
      success("Joined room!", {
        description: "You have joined the game room.",
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
      setIsStarting(true);
      return contract.startGame(roomId);
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
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
      setIsStartingRound(true);
      return contract.startRound(roomId);
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
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
      setIsSubmitting(true);
      return contract.submitAnswer(roomId, answer);
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
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
      setIsJudging(true);
      return contract.judgeRound(roomId);
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
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
  const { data: room, isLoading: isLoadingRoom, refetch: refetchRoom } = useRoom(roomId);

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
