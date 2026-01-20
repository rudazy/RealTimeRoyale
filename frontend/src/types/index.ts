// Room Types
export interface Room {
  room_id: string;
  host: string;
  players: string[];
  status: "waiting" | "playing" | "finished";
  is_private: boolean;
  current_round: number;
  max_rounds: number;
  scores: Record<string, number>;
  submissions: Record<string, Submission>;
  current_mode: GameMode | "";
  current_challenge: string;
  hidden_data: string;
  round_results: RoundResult[];
}

export interface Submission {
  answer: string;
  timestamp: string;
}

export interface RoundResult {
  round: number;
  mode: GameMode;
  challenge: string;
  hidden_answer: string;
  rankings: PlayerRanking[];
  ai_reasoning: string;
}

export interface PlayerRanking {
  player: string;
  answer: string;
  difference?: number;
  reason?: string;
}

// Game Types
export type GameMode = "crypto" | "news" | "weather" | "sports" | "trending";

export interface RoundStartResponse {
  round: number;
  mode: GameMode;
  challenge: string;
}

export interface JudgeResponse {
  rankings: PlayerRanking[];
  reasoning: string;
  actual_answer: string;
  game_finished: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  player: string;
  xp: number;
}

// Public Room Listing
export interface PublicRoom {
  room_id: string;
  players: number;
  host: string;
}

// UI State Types
export interface GameState {
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  playerAddress: string | null;
  roundTimeRemaining: number;
  hasSubmitted: boolean;
}

// Contract Method Params
export interface CreateRoomParams {
  is_private: boolean;
}

export interface JoinRoomParams {
  room_id: string;
}

export interface SubmitAnswerParams {
  room_id: string;
  answer: string;
}

export interface StartGameParams {
  room_id: string;
}

export interface StartRoundParams {
  room_id: string;
}

export interface JudgeRoundParams {
  room_id: string;
}

// Transaction Result
export interface TransactionResult {
  transactionHash: string;
  status: "pending" | "success" | "failed";
  result?: unknown;
}