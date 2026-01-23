import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Room, LeaderboardEntry, TransactionReceipt } from "./types";

/**
 * RealTimeRoyale contract class for interacting with the GenLayer Real Time Royale contract
 */
class RealTimeRoyale {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;

    const config: any = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (studioUrl) {
      config.endpoint = studioUrl;
    }

    this.client = createClient(config);
  }

  /**
   * Update the address used for transactions
   */
  updateAccount(address: string): void {
    const config: any = {
      chain: studionet,
      account: address as `0x${string}`,
    };

    this.client = createClient(config);
  }

  /**
   * Get room data by room ID
   * @param roomId - The room ID to fetch
   * @returns Room data or null if not found
   */
  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const roomJson: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_room",
        args: [roomId],
      });

      if (!roomJson || roomJson === "{}") {
        return null;
      }

      return JSON.parse(roomJson) as Room;
    } catch (error) {
      console.error("Error fetching room:", error);
      return null;
    }
  }

  /**
   * Get XP for a specific player
   * @param address - Player's address
   * @returns Number of XP
   */
  async getPlayerXP(address: string | null): Promise<number> {
    if (!address) {
      return 0;
    }

    try {
      const xp = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_player_xp",
        args: [address],
      });

      return Number(xp) || 0;
    } catch (error) {
      console.error("Error fetching player XP:", error);
      return 0;
    }
  }

  /**
   * Get the leaderboard with all players and their XP
   * @returns Sorted array of leaderboard entries (highest to lowest)
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const leaderboardJson: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_leaderboard",
        args: [],
      });

      // The contract returns a JSON string or Map
      if (typeof leaderboardJson === "string") {
        const parsed = JSON.parse(leaderboardJson);
        if (typeof parsed === "object" && parsed !== null) {
          return Object.entries(parsed)
            .map(([address, xp]: [string, any]) => ({
              address,
              xp: Number(xp),
            }))
            .sort((a, b) => b.xp - a.xp);
        }
      }

      if (leaderboardJson instanceof Map) {
        return Array.from(leaderboardJson.entries())
          .map(([address, xp]: any) => ({
            address,
            xp: Number(xp),
          }))
          .sort((a, b) => b.xp - a.xp);
      }

      return [];
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  }

  /**
   * Create a new room
   * @returns Room ID
   */
  async createRoom(): Promise<{ receipt: TransactionReceipt; roomId: string }> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "create_room",
        args: [],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      // Extract room_id from receipt or decode from transaction
      // The contract returns the room_id string
      const roomId = (receipt as any).result || (receipt as any).decoded_data || "";

      return {
        receipt: receipt as TransactionReceipt,
        roomId: typeof roomId === "string" ? roomId : String(roomId)
      };
    } catch (error) {
      console.error("Error creating room:", error);
      throw new Error("Failed to create room");
    }
  }

  /**
   * Join an existing room
   * @param roomId - The room ID to join
   * @returns Status message
   */
  async joinRoom(roomId: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "join_room",
        args: [roomId],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error joining room:", error);
      throw new Error("Failed to join room");
    }
  }

  /**
   * Start the game (host only)
   * @param roomId - The room ID
   * @returns Transaction receipt
   */
  async startGame(roomId: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "start_game",
        args: [roomId],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error starting game:", error);
      throw new Error("Failed to start game");
    }
  }

  /**
   * Start a new round (fetches live BTC price)
   * @param roomId - The room ID
   * @returns Transaction receipt with challenge
   */
  async startRound(roomId: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "start_round",
        args: [roomId],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 30,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error starting round:", error);
      throw new Error("Failed to start round");
    }
  }

  /**
   * Submit an answer for the current round
   * @param roomId - The room ID
   * @param answer - The player's answer/guess
   * @returns Transaction receipt
   */
  async submitAnswer(roomId: string, answer: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "submit_answer",
        args: [roomId, answer],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw new Error("Failed to submit answer");
    }
  }

  /**
   * Judge the current round (determines winner)
   * @param roomId - The room ID
   * @returns Transaction receipt with results
   */
  async judgeRound(roomId: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "judge_round",
        args: [roomId],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error) {
      console.error("Error judging round:", error);
      throw new Error("Failed to judge round");
    }
  }
}

export default RealTimeRoyale;
