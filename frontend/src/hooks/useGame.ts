import { useCallback, useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";
import * as genlayer from "@/lib/genlayer";
import type { Room, RoundStartResponse, JudgeResponse } from "@/types";

// Hook for initializing player account
export function useInitPlayer() {
  const { setPlayerAddress, setPlayerXp, setLoading, setError } = useGameStore();

  useEffect(() => {
    const init = async () => {
      try {
        const address = genlayer.getAccountAddress();
        setPlayerAddress(address);

        const xp = await genlayer.getPlayerXp(address);
        setPlayerXp(xp);
      } catch (err) {
        console.error("Failed to initialize player:", err);
      }
    };

    init();
  }, [setPlayerAddress, setPlayerXp]);
}

// Hook for room management
export function useRoom() {
  const {
    setCurrentRoom,
    setRoomId,
    setLoading,
    setError,
    setSuccessMessage,
    roomId,
  } = useGameStore();

  const createRoom = useCallback(
    async (isPrivate: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const newRoomId = await genlayer.createRoom(isPrivate);
        setRoomId(newRoomId);

        const room = await genlayer.getRoom(newRoomId);
        setCurrentRoom(room);

        setSuccessMessage(`Room ${newRoomId} created!`);
        return newRoomId;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create room";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentRoom, setRoomId, setLoading, setError, setSuccessMessage]
  );

  const joinRoom = useCallback(
    async (targetRoomId: string) => {
      setLoading(true);
      setError(null);

      try {
        await genlayer.joinRoom(targetRoomId);
        setRoomId(targetRoomId);

        const room = await genlayer.getRoom(targetRoomId);
        setCurrentRoom(room);

        setSuccessMessage(`Joined room ${targetRoomId}!`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to join room";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentRoom, setRoomId, setLoading, setError, setSuccessMessage]
  );

  const refreshRoom = useCallback(async () => {
    if (!roomId) return null;

    try {
      const room = await genlayer.getRoom(roomId);
      setCurrentRoom(room);
      return room;
    } catch (err) {
      console.error("Failed to refresh room:", err);
      return null;
    }
  }, [roomId, setCurrentRoom]);

  const leaveRoom = useCallback(() => {
    setCurrentRoom(null);
    setRoomId(null);
  }, [setCurrentRoom, setRoomId]);

  return { createRoom, joinRoom, refreshRoom, leaveRoom };
}

// Hook for game flow
export function useGameFlow() {
  const {
    roomId,
    setLoading,
    setError,
    setSuccessMessage,
    setCurrentChallenge,
    setCurrentMode,
    setRoundNumber,
    setShowResults,
    setLastRoundResults,
    setHasSubmitted,
    setSubmittedAnswer,
    resetRoundState,
  } = useGameStore();

  const { refreshRoom } = useRoom();

  const startGame = useCallback(async () => {
    if (!roomId) {
      setError("No room selected");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await genlayer.startGame(roomId);
      await refreshRoom();
      setSuccessMessage("Game started!");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start game";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [roomId, refreshRoom, setLoading, setError, setSuccessMessage]);

  const startRound = useCallback(async () => {
    if (!roomId) {
      setError("No room selected");
      return null;
    }

    setLoading(true);
    setError(null);
    resetRoundState();

    try {
      const result: RoundStartResponse = await genlayer.startRound(roomId);

      setCurrentChallenge(result.challenge);
      setCurrentMode(result.mode);
      setRoundNumber(result.round);

      await refreshRoom();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start round";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [
    roomId,
    refreshRoom,
    resetRoundState,
    setLoading,
    setError,
    setCurrentChallenge,
    setCurrentMode,
    setRoundNumber,
  ]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!roomId) {
        setError("No room selected");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        await genlayer.submitAnswer(roomId, answer);
        setHasSubmitted(true);
        setSubmittedAnswer(answer);
        setSuccessMessage("Answer submitted!");
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit answer";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [roomId, setLoading, setError, setSuccessMessage, setHasSubmitted, setSubmittedAnswer]
  );

  const judgeRound = useCallback(async () => {
    if (!roomId) {
      setError("No room selected");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result: JudgeResponse = await genlayer.judgeRound(roomId);

      setLastRoundResults({
        rankings: result.rankings,
        reasoning: result.reasoning,
        actualAnswer: result.actual_answer,
      });
      setShowResults(true);

      await refreshRoom();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to judge round";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [roomId, refreshRoom, setLoading, setError, setLastRoundResults, setShowResults]);

  return { startGame, startRound, submitAnswer, judgeRound };
}

// Hook for leaderboard
export function useLeaderboard() {
  const { setLeaderboard, setLoading, setError, leaderboard } = useGameStore();

  const fetchLeaderboard = useCallback(
    async (limit: number = 10) => {
      setLoading(true);

      try {
        const entries = await genlayer.getLeaderboard(limit);
        setLeaderboard(entries);
        return entries;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch leaderboard";
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [setLeaderboard, setLoading, setError]
  );

  return { leaderboard, fetchLeaderboard };
}

// Hook for public rooms
export function usePublicRooms() {
  const { setLoading, setError } = useGameStore();

  const fetchPublicRooms = useCallback(async () => {
    setLoading(true);

    try {
      const rooms = await genlayer.getPublicRooms();
      return rooms;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch rooms";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return { fetchPublicRooms };
}

// Hook for countdown timer
export function useCountdown(initialTime: number, onComplete?: () => void) {
  const { timeRemaining, setTimeRemaining } = useGameStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Update ref when callback changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const startTimer = useCallback(() => {
    setTimeRemaining(initialTime);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(useGameStore.getState().timeRemaining - 1);

      if (useGameStore.getState().timeRemaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        onCompleteRef.current?.();
      }
    }, 1000);
  }, [initialTime, setTimeRemaining]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeRemaining(initialTime);
  }, [initialTime, stopTimer, setTimeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return { timeRemaining, startTimer, stopTimer, resetTimer };
}

// Hook for polling room updates
export function useRoomPolling(intervalMs: number = 3000) {
  const { roomId, currentRoom } = useGameStore();
  const { refreshRoom } = useRoom();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      if (roomId) {
        refreshRoom();
      }
    }, intervalMs);
  }, [roomId, refreshRoom, intervalMs]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Start polling when room exists, stop when it doesn't
  useEffect(() => {
    if (roomId && currentRoom?.status !== "finished") {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [roomId, currentRoom?.status, startPolling, stopPolling]);

  return { startPolling, stopPolling };
}