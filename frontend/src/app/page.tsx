"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store";
import {
  useInitPlayer,
  useRoom,
  useGameFlow,
  usePublicRooms,
  useLeaderboard,
  useRoomPolling,
  useCountdown,
} from "@/hooks/useGame";
import {
  Header,
  Lobby,
  WaitingRoom,
  Challenge,
  ScoreBoard,
  FinalResults,
  RoundResults,
  Leaderboard,
  PlayerList,
} from "@/components/game";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import type { PublicRoom } from "@/types";

export default function Home() {
  // Initialize player
  useInitPlayer();

  // State from store
  const {
    currentRoom,
    roomId,
    playerAddress,
    playerXp,
    isLoading,
    error,
    successMessage,
    currentChallenge,
    currentMode,
    roundNumber,
    timeRemaining,
    hasSubmitted,
    submittedAnswer,
    showResults,
    lastRoundResults,
    setError,
    setSuccessMessage,
  } = useGameStore();

  // Hooks
  const { createRoom, joinRoom, refreshRoom, leaveRoom } = useRoom();
  const { startGame, startRound, submitAnswer, judgeRound } = useGameFlow();
  const { fetchPublicRooms } = usePublicRooms();
  const { leaderboard, fetchLeaderboard } = useLeaderboard();

  // Local state
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Polling for room updates
  useRoomPolling(3000);

  // Countdown timer
  const { startTimer, stopTimer } = useCountdown(30, () => {
    // Auto-judge when time runs out (if host)
    if (isHost && currentRoom?.status === "playing") {
      handleJudgeRound();
    }
  });

  // Computed values
  const isHost = currentRoom?.host === playerAddress;
  const isPlaying = currentRoom?.status === "playing";
  const isWaiting = currentRoom?.status === "waiting";
  const isFinished = currentRoom?.status === "finished";

  // Load public rooms and leaderboard on mount
  useEffect(() => {
    loadPublicRooms();
    fetchLeaderboard(10);
  }, []);

  // Start timer when round starts
  useEffect(() => {
    if (currentChallenge && isPlaying && !hasSubmitted) {
      startTimer();
    }
    return () => stopTimer();
  }, [currentChallenge, isPlaying]);

  // Clear messages after delay
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const loadPublicRooms = async () => {
    const rooms = await fetchPublicRooms();
    setPublicRooms(rooms);
  };

  const handleCreateRoom = async (isPrivate: boolean) => {
    await createRoom(isPrivate);
  };

  const handleJoinRoom = async (targetRoomId: string) => {
    await joinRoom(targetRoomId);
  };

  const handleStartGame = async () => {
    await startGame();
  };

  const handleStartRound = async () => {
    await startRound();
  };

  const handleSubmitAnswer = async (answer: string) => {
    await submitAnswer(answer);
  };

  const handleJudgeRound = async () => {
    stopTimer();
    await judgeRound();
  };

  const handleNextRound = () => {
    useGameStore.getState().resetRoundState();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    loadPublicRooms();
  };

  const handlePlayAgain = () => {
    leaveRoom();
    loadPublicRooms();
  };

  // Render game content based on state
  const renderGameContent = () => {
    // Show final results
    if (isFinished && currentRoom) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <FinalResults
            scores={currentRoom.scores}
            currentPlayerAddress={playerAddress || undefined}
          />
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handlePlayAgain}>
              Play Again
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleLeaveRoom}>
              Leave
            </Button>
          </div>
        </div>
      );
    }

    // Show round results
    if (showResults && lastRoundResults) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <RoundResults
            rankings={lastRoundResults.rankings}
            reasoning={lastRoundResults.reasoning}
            actualAnswer={lastRoundResults.actualAnswer}
            currentPlayerAddress={playerAddress || undefined}
          />

          {currentRoom && (
            <ScoreBoard
              scores={currentRoom.scores}
              currentPlayerAddress={playerAddress || undefined}
              title="Current Scores"
            />
          )}

          {isHost && currentRoom && currentRoom.current_round <= currentRoom.max_rounds && (
            <Button className="w-full" onClick={handleStartRound} isLoading={isLoading}>
              Start Round {currentRoom.current_round}
            </Button>
          )}

          {isHost && currentRoom && currentRoom.current_round > currentRoom.max_rounds && (
            <p className="text-center text-gray-400">Game ending...</p>
          )}

          {!isHost && (
            <p className="text-center text-gray-400">
              Waiting for host to start next round...
            </p>
          )}
        </div>
      );
    }

    // Show active challenge
    if (isPlaying && currentChallenge && currentMode) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <Challenge
            mode={currentMode}
            challenge={currentChallenge}
            roundNumber={roundNumber}
            maxRounds={currentRoom?.max_rounds || 3}
            timeRemaining={timeRemaining}
            hasSubmitted={hasSubmitted}
            submittedAnswer={submittedAnswer || undefined}
            isLoading={isLoading}
            onSubmit={handleSubmitAnswer}
          />

          {/* Player submission status */}
          {currentRoom && (
            <Card>
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerList
                  players={currentRoom.players.map((p) => ({
                    address: p,
                    hasSubmitted: !!currentRoom.submissions[p],
                    isHost: p === currentRoom.host,
                  }))}
                  currentPlayerAddress={playerAddress || undefined}
                  showSubmissionStatus={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Host judge button */}
          {isHost && Object.keys(currentRoom?.submissions || {}).length > 0 && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleJudgeRound}
              isLoading={isLoading}
            >
              Judge Round (End Early)
            </Button>
          )}
        </div>
      );
    }

    // Show playing state but waiting for round to start
    if (isPlaying && !currentChallenge) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-xl text-white mb-4">Game Started!</p>
              {isHost ? (
                <Button onClick={handleStartRound} isLoading={isLoading}>
                  Start Round 1
                </Button>
              ) : (
                <p className="text-gray-400">
                  Waiting for host to start the first round...
                </p>
              )}
            </CardContent>
          </Card>

          {currentRoom && (
            <ScoreBoard
              scores={currentRoom.scores}
              currentPlayerAddress={playerAddress || undefined}
            />
          )}
        </div>
      );
    }

    // Show waiting room
    if (isWaiting && currentRoom && roomId) {
      return (
        <WaitingRoom
          roomId={roomId}
          players={currentRoom.players}
          hostAddress={currentRoom.host}
          currentPlayerAddress={playerAddress || ""}
          isPrivate={currentRoom.is_private}
          isHost={isHost}
          isLoading={isLoading}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }

    // Show lobby
    return (
      <div className="space-y-6">
        <Lobby
          publicRooms={publicRooms}
          isLoading={isLoading}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onRefreshRooms={loadPublicRooms}
        />

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
        </Button>

        {showLeaderboard && (
          <Leaderboard
            entries={leaderboard}
            currentPlayerAddress={playerAddress || undefined}
            isLoading={isLoading}
            onRefresh={() => fetchLeaderboard(10)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header playerAddress={playerAddress} playerXp={playerXp} />

      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-game-error/20 border border-game-error/50 rounded-lg animate-fadeIn">
            <p className="text-game-error">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-game-success/20 border border-game-success/50 rounded-lg animate-fadeIn">
            <p className="text-game-success">{successMessage}</p>
          </div>
        )}

        {renderGameContent()}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500 border-t border-white/5">
        Built on{" "}
        
          href="https://genlayer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-game-accent hover:underline"
        >
          GenLayer
        </a>{" "}
        | Real Time Royale
      </footer>
    </div>
  );
}