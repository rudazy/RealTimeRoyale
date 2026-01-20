import { create } from "zustand";
import type { Room, GameMode, LeaderboardEntry } from "@/types";

// Game UI State
interface GameUIState {
  // Room state
  currentRoom: Room | null;
  roomId: string | null;

  // Player state
  playerAddress: string | null;
  playerXp: number;

  // Game state
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Round state
  currentChallenge: string | null;
  currentMode: GameMode | null;
  roundNumber: number;
  timeRemaining: number;
  hasSubmitted: boolean;
  submittedAnswer: string | null;

  // Results state
  showResults: boolean;
  lastRoundResults: {
    rankings: Array<{
      player: string;
      answer: string;
      reason?: string;
    }>;
    reasoning: string;
    actualAnswer: string;
  } | null;

  // Leaderboard
  leaderboard: LeaderboardEntry[];

  // Actions
  setCurrentRoom: (room: Room | null) => void;
  setRoomId: (roomId: string | null) => void;
  setPlayerAddress: (address: string | null) => void;
  setPlayerXp: (xp: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  setCurrentChallenge: (challenge: string | null) => void;
  setCurrentMode: (mode: GameMode | null) => void;
  setRoundNumber: (round: number) => void;
  setTimeRemaining: (time: number) => void;
  setHasSubmitted: (submitted: boolean) => void;
  setSubmittedAnswer: (answer: string | null) => void;
  setShowResults: (show: boolean) => void;
  setLastRoundResults: (results: GameUIState["lastRoundResults"]) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  resetGameState: () => void;
  resetRoundState: () => void;
}

const initialState = {
  currentRoom: null,
  roomId: null,
  playerAddress: null,
  playerXp: 0,
  isLoading: false,
  error: null,
  successMessage: null,
  currentChallenge: null,
  currentMode: null,
  roundNumber: 0,
  timeRemaining: 30,
  hasSubmitted: false,
  submittedAnswer: null,
  showResults: false,
  lastRoundResults: null,
  leaderboard: [],
};

export const useGameStore = create<GameUIState>((set) => ({
  ...initialState,

  setCurrentRoom: (room) => set({ currentRoom: room }),
  setRoomId: (roomId) => set({ roomId }),
  setPlayerAddress: (address) => set({ playerAddress: address }),
  setPlayerXp: (xp) => set({ playerXp: xp }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, successMessage: null }),
  setSuccessMessage: (message) => set({ successMessage: message, error: null }),
  setCurrentChallenge: (challenge) => set({ currentChallenge: challenge }),
  setCurrentMode: (mode) => set({ currentMode: mode }),
  setRoundNumber: (round) => set({ roundNumber: round }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setHasSubmitted: (submitted) => set({ hasSubmitted: submitted }),
  setSubmittedAnswer: (answer) => set({ submittedAnswer: answer }),
  setShowResults: (show) => set({ showResults: show }),
  setLastRoundResults: (results) => set({ lastRoundResults: results }),
  setLeaderboard: (entries) => set({ leaderboard: entries }),

  resetGameState: () =>
    set({
      ...initialState,
      playerAddress: useGameStore.getState().playerAddress,
      playerXp: useGameStore.getState().playerXp,
    }),

  resetRoundState: () =>
    set({
      currentChallenge: null,
      currentMode: null,
      timeRemaining: 30,
      hasSubmitted: false,
      submittedAnswer: null,
      showResults: false,
      lastRoundResults: null,
    }),
}));

// Selector hooks for common patterns
export const useIsHost = () => {
  const { currentRoom, playerAddress } = useGameStore();
  return currentRoom?.host === playerAddress;
};

export const useIsPlaying = () => {
  const { currentRoom } = useGameStore();
  return currentRoom?.status === "playing";
};

export const useIsWaiting = () => {
  const { currentRoom } = useGameStore();
  return currentRoom?.status === "waiting";
};

export const useIsFinished = () => {
  const { currentRoom } = useGameStore();
  return currentRoom?.status === "finished";
};

export const usePlayerCount = () => {
  const { currentRoom } = useGameStore();
  return currentRoom?.players.length || 0;
};

export const usePlayerScore = () => {
  const { currentRoom, playerAddress } = useGameStore();
  if (!currentRoom || !playerAddress) return 0;
  return currentRoom.scores[playerAddress] || 0;
};