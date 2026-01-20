# Real Time Royale

A multiplayer game where players compete by reacting to LIVE real-world data fetched on-chain. Built on GenLayer using Intelligent Contracts.

## What Makes It Unique

- **Live Web Data as Core Mechanic**: The blockchain literally fetches current prices, news, weather, and trends mid-game
- **AI-Powered Judging**: Validators reach consensus on subjective answers using GenLayer's Optimistic Democracy
- **Every Game is Different**: Because data is live, no two games are the same
- **No Other Blockchain Can Do This**: Showcases GenLayer's `gl.get_webpage()` and AI consensus capabilities

## Game Overview

### How It Works

1. **Create or Join a Room**: 2-8 players per game
2. **3 Rounds Per Game**: Each round is a different challenge type
3. **Live Data Challenges**: Answer questions about real-time crypto prices, weather, news, and trends
4. **AI Judges Responses**: For subjective questions, AI validators determine the best answers
5. **Earn XP**: Points are added to a persistent global leaderboard

### Game Modes

| Mode | Data Source | Example Challenge | Judging |
|------|-------------|-------------------|---------|
| Crypto | CoinGecko API | "Guess the current BTC price" | Closest number wins |
| Weather | wttr.in API | "What's the temperature in Tokyo?" | Exact or closest match |
| News | Hacker News | "Rate this headline's market impact" | AI judges reasoning |
| Trending | Google Trends | "Why is #topic trending?" | AI judges explanation |
| Sports | Live scores | "Guess the score of X vs Y" | Closest or AI decides |

### Scoring System

- 1st Place: 100 points
- 2nd Place: 75 points
- 3rd Place: 50 points
- 4th Place+: 25 points
- Speed Bonus: +10 points for fastest correct answer

## Technical Stack

### Smart Contract (Intelligent Contract)

- Written in Python using GenLayer SDK
- Uses `gl.get_webpage()` for live data fetching
- Uses `gl.exec_prompt()` for AI-powered judging
- Implements multiple Equivalence Principles for consensus

### Key GenLayer Features Used
```python
# Fetch live web data
gl.get_webpage(url, mode="text")

# Strict equality consensus (for objective data)
gl.eq_principle_strict_eq(fetch_function)

# AI-powered consensus (for subjective judging)
gl.eq_principle_prompt_non_comparative(
    judge_function,
    task="Rank player submissions",
    criteria="Rankings reflect quality and accuracy"
)

# LLM execution
gl.exec_prompt(task)
```

## Project Structure
```
RealTimeRoyale/
├── contracts/
│   └── real_time_royale.py    # Main intelligent contract
├── deploy/
│   └── deployScript.ts        # Deployment script
├── test/
│   └── test_real_time_royale.py  # Contract tests
├── frontend/                   # Next.js frontend (coming soon)
├── config/
│   └── genlayer.config.ts     # GenLayer configuration
├── deployments/               # Deployment records
├── package.json
├── requirements.txt
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- GenLayer CLI: `npm install -g genlayer`
- Docker (for local development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rudazy/RealTimeRoyale.git
cd RealTimeRoyale
```

2. Install dependencies:
```bash
npm install
pip install -r requirements.txt
```

3. Configure your network:
```bash
genlayer network
```

### Deploy the Contract

Deploy to testnet:
```bash
genlayer deploy
```

Or use npm scripts:
```bash
npm run deploy:testnet
```

### Run Tests

Make sure GenLayer Studio is running, then:
```bash
gltest
```

Or:
```bash
npm test
```

## Contract API

### Room Management
```python
# Create a new room (returns room_id)
create_room(is_private: bool) -> str

# Join an existing room
join_room(room_id: str) -> str

# Get room details
get_room(room_id: str) -> dict

# List public waiting rooms
get_public_rooms() -> list
```

### Game Flow
```python
# Host starts the game
start_game(room_id: str) -> str

# Start a new round (fetches live data)
start_round(room_id: str) -> dict

# Player submits answer
submit_answer(room_id: str, answer: str) -> str

# Judge all submissions for current round
judge_round(room_id: str) -> dict
```

### Leaderboard
```python
# Get top players
get_leaderboard(limit: int) -> list

# Get specific player's XP
get_player_xp(player: str) -> int

# Get completed game results
get_game_results(room_id: str) -> dict
```

## Game Flow Diagram
```
1. CREATE ROOM
   Host calls create_room() -> returns room_id

2. JOIN PHASE
   Players call join_room(room_id)
   Wait for 2-8 players

3. START GAME
   Host calls start_game(room_id)
   Game status changes to "playing"

4. FOR EACH ROUND (x3):
   a. Host calls start_round(room_id)
      - Random mode selected
      - Live data fetched from web
      - Challenge presented to players
   
   b. Players call submit_answer(room_id, answer)
      - 30 second window
      - Timestamp recorded for speed bonus
   
   c. Host calls judge_round(room_id)
      - AI validators evaluate answers
      - Points awarded
      - Rankings revealed

5. GAME END
   After 3 rounds, game status = "finished"
   Points added to global leaderboard
```

## Equivalence Principles Explained

GenLayer uses Equivalence Principles to reach consensus on non-deterministic operations:

### Strict Equality (Objective Modes)
Used for crypto prices, weather data where validators must get exactly the same result:
```python
result = gl.eq_principle_strict_eq(fetch_btc_price)
```

### Non-Comparative (Subjective Modes)
Used for AI judging where validators verify the leader's judgment is reasonable:
```python
result = gl.eq_principle_prompt_non_comparative(
    judge_function,
    task="description of what we're doing",
    criteria="how to verify correctness"
)
```

## Roadmap

- [x] Core smart contract
- [x] Room management
- [x] Game flow logic
- [x] Crypto price challenges
- [x] Weather challenges
- [x] News/Trending challenges (AI judged)
- [x] Leaderboard system
- [ ] Frontend (Next.js)
- [ ] Real-time updates (WebSocket)
- [ ] Weekly challenge rotation
- [ ] Seasonal events
- [ ] Tournament mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Links

- [GenLayer Documentation](https://docs.genlayer.com/)
- [GenLayer Studio](https://studio.genlayer.com/)
- [GenLayer Discord](https://discord.gg/8Jm4v89VAu)

