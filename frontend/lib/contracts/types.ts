/**
 * TypeScript types for Real Time Royale contract
 */

export interface Room {
  room_id: string;
  host: string;
  players: string[];
  status: "waiting" | "playing" | "finished";
  scores: Record<string, number>;
  current_round: number;
  max_rounds: number;
  challenge: string;
  answer: string;
  submissions: Record<string, string>;
}

export interface LeaderboardEntry {
  address: string;
  xp: number;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}

export interface RoundResult {
  player: string;
  guess: string;
  diff: number;
  points: number;
  rank: number;
}

export interface GameState {
  room: Room | null;
  isHost: boolean;
  hasSubmitted: boolean;
  roundResults: RoundResult[];
}
