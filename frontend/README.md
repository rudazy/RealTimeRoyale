# Real Time Royale

Next.js frontend for Real Time Royale - a multiplayer game where players compete to guess the live Bitcoin price. Powered by GenLayer's AI-powered Intelligent Contracts.

## Game Overview

Real Time Royale is a real-time multiplayer guessing game:
1. Create or join a game room
2. Each round, players guess the current Bitcoin price
3. GenLayer AI fetches the live price and judges the closest guess
4. Earn XP based on placement (1st=100, 2nd=75, 3rd=50, others=25)
5. Compete on the global leaderboard!

## Deployed Contract

- **Contract Address**: `0xD67767459a095DDbC11F72c4295Ce3736ad14Ff1`
- **Network**: GenLayer Testnet Asimov
- **RPC URL**: `https://studio.genlayer.com/api`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

The `.env.example` is pre-configured with the deployed contract address.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with gaming theme
- **genlayer-js** - GenLayer blockchain SDK
- **TanStack Query** - Data fetching and caching
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built UI components

## Contract Methods

### Read Methods
- `get_room(room_id)` - Get room data
- `get_player_xp(player)` - Get player's XP
- `get_leaderboard()` - Get global leaderboard

### Write Methods
- `create_room()` - Create a new game room
- `join_room(room_id)` - Join an existing room
- `start_game(room_id)` - Start the game (host only)
- `start_round(room_id)` - Fetch live BTC price, start round
- `submit_answer(room_id, answer)` - Submit your guess
- `judge_round(room_id)` - AI judges answers, awards points

## Features

- **Create Rooms**: Host game rooms and invite friends via Room ID
- **Join Rooms**: Enter a Room ID to join an existing game
- **Real-Time Gameplay**: 30-second rounds with live updates
- **AI Judging**: GenLayer AI fetches live Bitcoin price and determines winner
- **XP System**: Earn XP based on placement each round
- **Global Leaderboard**: Compete for the top spot
- **Wallet Integration**: Connect via MetaMask to GenLayer testnet

## Game Flow

1. Connect your MetaMask wallet
2. Create a room (you become the host) or join with a Room ID
3. Host starts the game when 2+ players are ready
4. Each round:
   - Host starts the round
   - Players have 30 seconds to guess the BTC price
   - Once all players submit, host judges the round
   - AI reveals the actual price and awards points
5. After 3 rounds, final scores are added to the global leaderboard
