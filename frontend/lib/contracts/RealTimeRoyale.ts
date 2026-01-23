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

      console.log("Create room txHash:", txHash);

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      // Log the full receipt for debugging - use custom replacer for BigInt
      const safeStringify = (obj: any): string => {
        try {
          return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'bigint') return value.toString();
            return value;
          }, 2);
        } catch {
          return String(obj);
        }
      };

      console.log("=== CREATE ROOM RECEIPT DEBUG ===");
      console.log("Receipt type:", typeof receipt);
      console.log("Receipt keys:", receipt ? Object.keys(receipt) : "null");
      console.log("Full receipt:", safeStringify(receipt));

      // Deep search function to find room_id pattern anywhere in the object
      const findRoomId = (obj: any, path: string = ""): string | null => {
        if (!obj) return null;

        // Check if this value is a room ID string
        if (typeof obj === "string") {
          // Direct match: "room_X"
          if (obj.match(/^room_\d+$/)) {
            console.log(`Found room ID at ${path}:`, obj);
            return obj;
          }
          // Try parsing as JSON
          try {
            const parsed = JSON.parse(obj);
            const result = findRoomId(parsed, `${path}[parsed]`);
            if (result) return result;
          } catch {
            // Not JSON, check if it contains room_X pattern
            const match = obj.match(/room_\d+/);
            if (match) {
              console.log(`Found room ID in string at ${path}:`, match[0]);
              return match[0];
            }
          }
          return null;
        }

        // Check arrays
        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            const result = findRoomId(obj[i], `${path}[${i}]`);
            if (result) return result;
          }
          return null;
        }

        // Check objects
        if (typeof obj === "object") {
          // Priority keys to check first
          const priorityKeys = [
            "result", "data", "decoded_data", "execution_result",
            "return_value", "output", "value", "room_id", "roomId"
          ];

          // Check priority keys first
          for (const key of priorityKeys) {
            if (key in obj) {
              const result = findRoomId(obj[key], `${path}.${key}`);
              if (result) return result;
            }
          }

          // Check all other keys
          for (const key of Object.keys(obj)) {
            if (!priorityKeys.includes(key)) {
              const result = findRoomId(obj[key], `${path}.${key}`);
              if (result) return result;
            }
          }
        }

        return null;
      };

      // Try to find room ID in the receipt
      let roomId = findRoomId(receipt, "receipt");

      // If not found in receipt structure, try the stringified version as last resort
      if (!roomId) {
        const receiptStr = safeStringify(receipt);
        const match = receiptStr.match(/room_\d+/);
        if (match) {
          roomId = match[0];
          console.log("Found room ID via string search:", roomId);
        }
      }

      // If still no room ID, check if the txHash itself can help us get the result
      if (!roomId) {
        console.warn("Could not find room ID in receipt, attempting fallback...");

        // Try to get transaction result directly if available
        try {
          const txResult = await (this.client as any).getTransactionResult?.({ hash: txHash });
          if (txResult) {
            console.log("Transaction result:", safeStringify(txResult));
            const fallbackId = findRoomId(txResult, "txResult");
            if (fallbackId) {
              roomId = fallbackId;
            }
          }
        } catch (e) {
          console.log("getTransactionResult not available or failed:", e);
        }
      }

      // Final validation - be more lenient
      if (!roomId) {
        console.error("=== ROOM ID EXTRACTION FAILED ===");
        console.error("Receipt structure:", safeStringify(receipt));
        throw new Error(
          "Could not extract room ID from transaction. " +
          "Please check the console for the receipt structure."
        );
      }

      console.log("=== ROOM ID EXTRACTED SUCCESSFULLY ===");
      console.log("Room ID:", roomId);

      return {
        receipt: receipt as TransactionReceipt,
        roomId: roomId
      };
    } catch (error: any) {
      console.error("Error creating room:", error);
      throw new Error(error?.message || "Failed to create room");
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
