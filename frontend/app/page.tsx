"use client";

import { useState, useCallback, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Leaderboard } from "@/components/Leaderboard";
import { RoomLobby } from "@/components/RoomLobby";
import { GameRound } from "@/components/GameRound";
import { RoundResults } from "@/components/RoundResults";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { JoinRoomModal } from "@/components/JoinRoomModal";
import { useRoom } from "@/lib/hooks/useRealTimeRoyale";
import { Bitcoin, Zap, Trophy, Users, Target, Timer } from "lucide-react";

type GamePhase = "home" | "lobby" | "playing" | "results";

export default function HomePage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("home");
  const [lastRound, setLastRound] = useState(0);

  // Subscribe to room data for phase transitions
  const { data: room } = useRoom(roomId);

  // Auto-detect game phase changes based on room state
  useEffect(() => {
    if (!room) return;

    if (room.status === "waiting") {
      setGamePhase("lobby");
    } else if (room.status === "playing") {
      // Check if we should show results or playing
      if (room.current_round > lastRound && lastRound > 0) {
        setGamePhase("results");
      } else {
        setGamePhase("playing");
      }
    } else if (room.status === "finished") {
      setGamePhase("results");
    }
  }, [room?.status, room?.current_round, lastRound]);

  const handleRoomCreated = useCallback((newRoomId: string) => {
    setRoomId(newRoomId);
    setGamePhase("lobby");
    setLastRound(0);
  }, []);

  const handleRoomJoined = useCallback((joinedRoomId: string) => {
    setRoomId(joinedRoomId);
    setGamePhase("lobby");
    setLastRound(0);
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setRoomId(null);
    setGamePhase("home");
    setLastRound(0);
  }, []);

  const handleGameStart = useCallback(() => {
    setGamePhase("playing");
    setLastRound(0);
  }, []);

  const handleRoundEnd = useCallback(() => {
    setGamePhase("results");
    if (room) {
      setLastRound(room.current_round);
    }
  }, [room]);

  const handleNextRound = useCallback(() => {
    setGamePhase("playing");
  }, []);

  const handleGameEnd = useCallback(() => {
    setRoomId(null);
    setGamePhase("home");
    setLastRound(0);
  }, []);

  // Render game view based on phase
  if (gamePhase !== "home" && roomId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar showGameActions={false} />
        <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {gamePhase === "lobby" && (
              <RoomLobby
                roomId={roomId}
                onGameStart={handleGameStart}
                onLeave={handleLeaveRoom}
              />
            )}
            {gamePhase === "playing" && (
              <GameRound roomId={roomId} onRoundEnd={handleRoundEnd} />
            )}
            {gamePhase === "results" && (
              <RoundResults
                roomId={roomId}
                onNextRound={handleNextRound}
                onGameEnd={handleGameEnd}
              />
            )}
          </div>
        </main>
      </div>
    );
  }

  // Home page
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onRoomCreated={handleRoomCreated}
        onRoomJoined={handleRoomJoined}
      />

      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Powered by GenLayer AI
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-accent">Real Time</span>{" "}
              <span className="text-pink">Royale</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Compete in real-time to guess the Bitcoin price.
              <br />
              The closest guess wins! Earn XP and climb the leaderboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CreateRoomModal onRoomCreated={handleRoomCreated} />
              <JoinRoomModal onRoomJoined={handleRoomJoined} />
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - How to Play */}
            <div className="lg:col-span-8 animate-slide-up">
              <div className="brand-card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-accent" />
                  How to Play
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">1. Create or Join</h3>
                        <p className="text-sm text-muted-foreground">
                          Create a game room and share the Room ID with friends,
                          or join an existing room.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Bitcoin className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">2. Guess the Price</h3>
                        <p className="text-sm text-muted-foreground">
                          Each round, guess the live Bitcoin price. You have 30
                          seconds to submit your answer.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Timer className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">3. AI Judges</h3>
                        <p className="text-sm text-muted-foreground">
                          GenLayer AI fetches the real BTC price and determines
                          who was closest. 3 rounds total!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">4. Earn XP</h3>
                        <p className="text-sm text-muted-foreground">
                          Win points each round (1st=100, 2nd=75, 3rd=50). Total
                          XP is added to the global leaderboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points Table */}
                <div className="mt-8 p-4 bg-secondary/30 rounded-lg">
                  <h3 className="font-semibold mb-3 text-sm">Points Per Round</h3>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-yellow-500/10 rounded-lg p-3">
                      <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                      <div className="font-bold text-lg">100</div>
                      <div className="text-xs text-muted-foreground">1st Place</div>
                    </div>
                    <div className="bg-gray-500/10 rounded-lg p-3">
                      <div className="w-5 h-5 mx-auto mb-1 text-gray-400 font-bold">2</div>
                      <div className="font-bold text-lg">75</div>
                      <div className="text-xs text-muted-foreground">2nd Place</div>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-3">
                      <div className="w-5 h-5 mx-auto mb-1 text-amber-600 font-bold">3</div>
                      <div className="font-bold text-lg">50</div>
                      <div className="text-xs text-muted-foreground">3rd Place</div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="w-5 h-5 mx-auto mb-1 text-muted-foreground font-bold">4+</div>
                      <div className="font-bold text-lg">25</div>
                      <div className="text-xs text-muted-foreground">Others</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Leaderboard */}
            <div
              className="lg:col-span-4 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <Leaderboard />
            </div>
          </div>

          {/* Tech Stack Section */}
          <div
            className="mt-8 brand-card p-6 md:p-8 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="text-xl font-bold mb-4">Built on GenLayer</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Real Time Royale uses GenLayer's Intelligent Contracts to fetch
              live Bitcoin prices and verify results in a decentralized,
              trustless manner. No centralized oracle - the AI consensus
              mechanism ensures fair gameplay.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-secondary/50 rounded-full text-xs">
                GenLayer Testnet
              </span>
              <span className="px-3 py-1 bg-secondary/50 rounded-full text-xs">
                AI-Powered Oracles
              </span>
              <span className="px-3 py-1 bg-secondary/50 rounded-full text-xs">
                Real-Time Data
              </span>
              <span className="px-3 py-1 bg-secondary/50 rounded-full text-xs">
                Decentralized
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a
              href="https://genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Powered by GenLayer
            </a>
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Studio
            </a>
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
