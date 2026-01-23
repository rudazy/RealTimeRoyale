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
      console.log("getRoom: Calling contract with roomId:", roomId);
      const roomJson: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_room",
        args: [roomId],
      });

      console.log("getRoom: Raw response:", roomJson);

      if (!roomJson || roomJson === "{}" || roomJson === "") {
        console.log("getRoom: Room not found or empty");
        return null;
      }

      const room = JSON.parse(roomJson) as Room;
      console.log("getRoom: Parsed room:", room);
      return room;
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

      // Log the full receipt for debugging
      console.log("Create room receipt:", JSON.stringify(receipt, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      , 2));

      // Extract room_id from receipt
      // GenLayer SDK returns the execution result in the receipt
      let roomId = "";
      const receiptData = receipt as any;

      // Helper function to extract room_id from various formats
      const extractRoomId = (value: any): string => {
        if (!value) return "";
        if (typeof value === "string") {
          // Direct string like "room_7"
          if (value.startsWith("room_")) return value;
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === "string" && parsed.startsWith("room_")) return parsed;
            if (parsed?.room_id) return parsed.room_id;
          } catch {
            // Not JSON, return as-is if it looks like a room ID
          }
          return value;
        }
        if (typeof value === "object") {
          if (value.room_id) return value.room_id;
          if (value.result) return extractRoomId(value.result);
        }
        return String(value);
      };

      // Try different possible locations for the return value
      // The GenLayer SDK may return the result in different fields depending on version
      const possibleSources = [
        receiptData.result,
        receiptData.data?.result,
        receiptData.decoded_data,
        receiptData.execution_result,
        receiptData.return_value,
        receiptData.output,
        receiptData.data?.decoded_data,
        receiptData.data?.execution_result,
      ];

      for (const source of possibleSources) {
        const extracted = extractRoomId(source);
        if (extracted && extracted.startsWith("room_")) {
          roomId = extracted;
          break;
        }
      }

      // If we still don't have a valid room ID, check if there's any string starting with "room_"
      // in the stringified receipt
      if (!roomId || !roomId.startsWith("room_")) {
        const receiptStr = JSON.stringify(receipt);
        const match = receiptStr.match(/"(room_\d+)"/);
        if (match) {
          roomId = match[1];
          console.log("Extracted room ID from receipt string:", roomId);
        }
      }

      // Validate room ID format (should be like "room_7")
      if (!roomId || !roomId.startsWith("room_")) {
        console.error("Could not extract valid room ID from receipt:", receipt);
        throw new Error("Failed to get room ID from contract response");
      }

      console.log("Final room ID:", roomId);

      return {
        receipt: receipt as TransactionReceipt,
        roomId: roomId
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
