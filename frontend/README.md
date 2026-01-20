# Real Time Royale - Frontend

Next.js frontend for the Real Time Royale game built on GenLayer.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Zustand (State Management)
- TanStack Query
- genlayer-js SDK

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
copy .env.example .env
```

3. Update `.env` with your configuration:
```
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure
```
frontend/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main page
│   │   └── providers.tsx    # React providers
│   ├── components/
│   │   ├── ui/              # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   └── game/            # Game-specific components
│   │       ├── Challenge.tsx
│   │       ├── GameModeCard.tsx
│   │       ├── Header.tsx
│   │       ├── Leaderboard.tsx
│   │       ├── Lobby.tsx
│   │       ├── PlayerList.tsx
│   │       ├── RoundResults.tsx
│   │       ├── ScoreBoard.tsx
│   │       ├── Timer.tsx
│   │       └── WaitingRoom.tsx
│   ├── hooks/
│   │   └── useGame.ts       # Game logic hooks
│   ├── lib/
│   │   ├── genlayer.ts      # GenLayer client
│   │   ├── store.ts         # Zustand store
│   │   └── utils.ts         # Utility functions
│   └── types/
│       └── index.ts         # TypeScript types
├── public/                  # Static assets
├── .env.example             # Environment template
├── next.config.js           # Next.js config
├── tailwind.config.js       # Tailwind config
├── tsconfig.json            # TypeScript config
└── package.json
```

## Features

- Create public or private game rooms
- Join existing rooms
- Real-time player list updates
- Multiple game modes (Crypto, Weather, News, Sports, Trending)
- Live countdown timer
- AI-powered judging for subjective answers
- Persistent global leaderboard
- Responsive design

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_GENLAYER_RPC_URL | GenLayer RPC endpoint | https://studio.genlayer.com/api |
| NEXT_PUBLIC_CONTRACT_ADDRESS | Deployed contract address | (required) |