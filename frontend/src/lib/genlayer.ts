import { createClient, createAccount } from "genlayer-js";
import type {
  Room,
  PublicRoom,
  LeaderboardEntry,
  RoundStartResponse,
  JudgeResponse,
} from "@/types";

// Configuration
const RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Create client instance
export const client = createClient({
  endpoint: RPC_URL,
});

// Account management
let currentAccount: ReturnType<typeof createAccount> | null = null;

export function getAccount() {
  if (!currentAccount) {
    // Check localStorage for existing account
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("genlayer_private_key");
      if (savedKey) {
        currentAccount = createAccount(savedKey);
      } else {
        currentAccount = createAccount();
        localStorage.setItem("genlayer_private_key", currentAccount.privateKey);
      }
    } else {
      currentAccount = createAccount();
    }
  }
  return currentAccount;
}

export function getAccountAddress(): string {
  return getAccount().address;
}

export function clearAccount() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("genlayer_private_key");
  }
  currentAccount = null;
}

// Contract interaction helpers
async function callViewMethod<T>(method: string, args: unknown[] = []): Promise<T> {
  const result = await client.callContract({
    address: CONTRACT_ADDRESS,
    method,
    args,
  });
  return result as T;
}

async function callWriteMethod<T>(method: string, args: unknown[] = []): Promise<T> {
  const account = getAccount();
  const result = await client.sendTransaction({
    account,
    address: CONTRACT_ADDRESS,
    method,
    args,
  });
  return result as T;
}

// Room Management Methods
export async function createRoom(isPrivate: boolean): Promise<string> {
  return callWriteMethod<string>("create_room", [isPrivate]);
}

export async function joinRoom(roomId: string): Promise<string> {
  return callWriteMethod<string>("join_room", [roomId]);
}

export async function getRoom(roomId: string): Promise<Room | null> {
  return callViewMethod<Room | null>("get_room", [roomId]);
}

export async function getPublicRooms(): Promise<PublicRoom[]> {
  return callViewMethod<PublicRoom[]>("get_public_rooms", []);
}

// Game Flow Methods
export async function startGame(roomId: string): Promise<string> {
  return callWriteMethod<string>("start_game", [roomId]);
}

export async function startRound(roomId: string): Promise<RoundStartResponse> {
  return callWriteMethod<RoundStartResponse>("start_round", [roomId]);
}

export async function submitAnswer(roomId: string, answer: string): Promise<string> {
  return callWriteMethod<string>("submit_answer", [roomId, answer]);
}

export async function judgeRound(roomId: string): Promise<JudgeResponse> {
  return callWriteMethod<JudgeResponse>("judge_round", [roomId]);
}

// Leaderboard Methods
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  return callViewMethod<LeaderboardEntry[]>("get_leaderboard", [limit]);
}

export async function getPlayerXp(player: string): Promise<number> {
  return callViewMethod<number>("get_player_xp", [player]);
}

export async function getGameResults(roomId: string): Promise<{
  status: string;
  scores: Record<string, number>;
  round_results: unknown[];
} | null> {
  return callViewMethod("get_game_results", [roomId]);
}

// Utility functions
export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getContractAddress(): string {
  return CONTRACT_ADDRESS;
}

export function getRpcUrl(): string {
  return RPC_URL;
}