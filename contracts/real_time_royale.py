# { "Depends": "py-genlayer:test" }

from genlayer import *
import json
import typing
from datetime import datetime


class RealTimeRoyale(gl.Contract):
    """
    Real Time Royale - A multiplayer game where players compete by reacting 
    to LIVE real-world data fetched on-chain.
    """
    
    # Persistent leaderboard (never resets)
    leaderboard: TreeMap[str, int]  # player_address -> total XP
    
    # Room management
    rooms: TreeMap[str, str]  # room_id -> room_data (JSON string)
    room_counter: int
    
    # Game modes
    MODES: list[str] = ["crypto", "news", "weather", "sports", "trending"]
    
    # Scoring
    POINTS_1ST: int = 100
    POINTS_2ND: int = 75
    POINTS_3RD: int = 50
    POINTS_OTHER: int = 25
    SPEED_BONUS: int = 10
    NO_WINNER_PENALTY: int = 10

    def __init__(self):
        """Initialize the contract with empty state."""
        self.room_counter = 0

    # ==================== ROOM MANAGEMENT ====================
    
    @gl.public.write
    def create_room(self, is_private: bool) -> str:
        """
        Create a new game room.
        Returns room_id.
        """
        self.room_counter += 1
        room_id = f"room_{self.room_counter}"
        
        room_data = {
            "room_id": room_id,
            "host": str(gl.message.sender_address),
            "players": [str(gl.message.sender_address)],
            "status": "waiting",  # waiting, playing, finished
            "is_private": is_private,
            "current_round": 0,
            "max_rounds": 3,
            "scores": {},
            "submissions": {},
            "current_mode": "",
            "current_challenge": "",
            "hidden_data": "",
            "round_results": []
        }
        
        self.rooms[room_id] = json.dumps(room_data)
        return room_id

    @gl.public.write
    def join_room(self, room_id: str) -> str:
        """Join an existing room. Returns status message."""
        room_json = self.rooms.get(room_id, None)
        if room_json is None:
            raise Exception("Room not found")
        
        room = json.loads(room_json)
        
        if room["status"] != "waiting":
            raise Exception("Game already in progress")
        
        if len(room["players"]) >= 8:
            raise Exception("Room is full (max 8 players)")
        
        player = str(gl.message.sender_address)
        if player in room["players"]:
            raise Exception("Already in room")
        
        room["players"].append(player)
        self.rooms[room_id] = json.dumps(room)
        
        return f"Joined room {room_id}. Players: {len(room['players'])}/8"

    @gl.public.view
    def get_room(self, room_id: str) -> typing.Any:
        """Get room details."""
        room_json = self.rooms.get(room_id, None)
        if room_json is None:
            return None
        return json.loads(room_json)

    @gl.public.view
    def get_public_rooms(self) -> list:
        """Get all public rooms that are waiting for players."""
        public_rooms = []
        # Note: In production, you'd want pagination here
        for i in range(1, self.room_counter + 1):
            room_id = f"room_{i}"
            room_json = self.rooms.get(room_id, None)
            if room_json:
                room = json.loads(room_json)
                if not room["is_private"] and room["status"] == "waiting":
                    public_rooms.append({
                        "room_id": room_id,
                        "players": len(room["players"]),
                        "host": room["host"]
                    })
        return public_rooms

    # ==================== GAME FLOW ====================

    @gl.public.write
    def start_game(self, room_id: str) -> str:
        """Host starts the game. Requires at least 2 players."""
        room_json = self.rooms.get(room_id, None)
        if room_json is None:
            raise Exception("Room not found")
        
        room = json.loads(room_json)
        
        if str(gl.message.sender_address) != room["host"]:
            raise Exception("Only host can start the game")
        
        if len(room["players"]) < 2:
            raise Exception("Need at least 2 players to start")
        
        if room["status"] != "waiting":
            raise Exception("Game already started")
        
        # Initialize scores for all players
        for player in room["players"]:
            room["scores"][player] = 0
        
        room["status"] = "playing"
        room["current_round"] = 1
        
        self.rooms[room_id] = json.dumps(room)
        
        return "Game started! Waiting for round to begin..."

    @gl.public.write
    def start_round(self, room_id: str) -> typing.Any:
        """
        Start a new round - fetches live data and creates challenge.
        This is where GenLayer's magic happens!
        """
        room_json = self.rooms.get(room_id, None)
        if room_json is None:
            raise Exception("Room not found")
        
        room = json.loads(room_json)
        
        if room["status"] != "playing":
            raise Exception("Game not in progress")
        
        if room["current_round"] > room["max_rounds"]:
            raise Exception("Game already finished")
        
        # Clear previous submissions
        room["submissions"] = {}
        
        # Select random mode based on round number (deterministic for testing)
        mode_index = room["current_round"] % len(self.MODES)
        mode = self.MODES[mode_index]
        room["current_mode"] = mode
        
        # Fetch live data based on mode
        challenge_data = self._fetch_challenge_data(mode)
        
        room["current_challenge"] = challenge_data["challenge"]
        room["hidden_data"] = challenge_data["answer"]
        
        self.rooms[room_id] = json.dumps(room)
        
        return {
            "round": room["current_round"],
            "mode": mode,
            "challenge": challenge_data["challenge"]
        }

    def _fetch_challenge_data(self, mode: str) -> dict:
        """
        Fetch live data from the web based on game mode.
        Uses GenLayer's gl.get_webpage() capability.
        """
        
        if mode == "crypto":
            return self._fetch_crypto_challenge()
        elif mode == "weather":
            return self._fetch_weather_challenge()
        elif mode == "news":
            return self._fetch_news_challenge()
        elif mode == "trending":
            return self._fetch_trending_challenge()
        else:  # sports
            return self._fetch_sports_challenge()

    def _fetch_crypto_challenge(self) -> dict:
        """Fetch live crypto price."""
        
        def fetch_btc_price() -> str:
            # Fetch from CoinGecko API
            url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
            web_data = gl.get_webpage(url, mode="text")
            return web_data
        
        price_data = gl.eq_principle_strict_eq(fetch_btc_price)
        
        try:
            data = json.loads(price_data)
            btc_price = int(data["bitcoin"]["usd"])
        except:
            btc_price = 50000  # Fallback
        
        return {
            "challenge": "Guess the current Bitcoin price in USD (whole number)",
            "answer": str(btc_price)
        }

    def _fetch_weather_challenge(self) -> dict:
        """Fetch live weather data."""
        
        def fetch_weather() -> str:
            # Using wttr.in for simple weather API (no key needed)
            url = "https://wttr.in/Tokyo?format=%t"
            web_data = gl.get_webpage(url, mode="text")
            return web_data
        
        weather_data = gl.eq_principle_strict_eq(fetch_weather)
        
        # Parse temperature (format: "+15°C" or similar)
        try:
            temp = weather_data.strip().replace("°C", "").replace("+", "")
            temp = int(float(temp))
        except:
            temp = 20  # Fallback
        
        return {
            "challenge": "What is the current temperature in Tokyo? (Celsius, whole number)",
            "answer": str(temp)
        }

    def _fetch_news_challenge(self) -> dict:
        """Fetch a news headline for analysis."""
        
        def fetch_headline() -> str:
            # Fetch from a news source
            url = "https://news.ycombinator.com/"
            web_data = gl.get_webpage(url, mode="text")
            return web_data
        
        news_data = gl.eq_principle_strict_eq(fetch_headline)
        
        # Use LLM to extract a headline
        def extract_headline() -> str:
            task = f"""From the following webpage content, extract the FIRST news headline you find.
            Return ONLY the headline text, nothing else.
            
            Content:
            {news_data[:2000]}
            """
            result = gl.exec_prompt(task)
            return result.strip()
        
        headline = gl.eq_principle_prompt_non_comparative(
            extract_headline,
            task="Extract the first headline from webpage content",
            criteria="The headline must be a real headline from the provided content"
        )
        
        return {
            "challenge": f"Rate this headline's impact on tech stocks (1-10) and explain why: '{headline}'",
            "answer": headline  # The headline itself for reference
        }

    def _fetch_trending_challenge(self) -> dict:
        """Fetch trending topic."""
        
        def fetch_trends() -> str:
            # Google Trends or similar
            url = "https://trends.google.com/trending?geo=US"
            web_data = gl.get_webpage(url, mode="text")
            return web_data
        
        trends_data = gl.eq_principle_strict_eq(fetch_trends)
        
        # Use LLM to extract a trending topic
        def extract_trend() -> str:
            task = f"""From the following webpage content about trends, extract ONE trending topic.
            Return ONLY the topic name, nothing else.
            
            Content:
            {trends_data[:2000]}
            """
            result = gl.exec_prompt(task)
            return result.strip()
        
        topic = gl.eq_principle_prompt_non_comparative(
            extract_trend,
            task="Extract a trending topic from webpage",
            criteria="Must be a real trending topic from the provided content"
        )
        
        return {
            "challenge": f"Why is '{topic}' trending? Give your best explanation.",
            "answer": topic
        }

    def _fetch_sports_challenge(self) -> dict:
        """Fetch sports data - simplified version."""
        
        return {
            "challenge": "How many goals were scored in the last Premier League matchday? (total across all games)",
            "answer": "unknown"  # Will be judged by AI
        }

    # ==================== PLAYER SUBMISSIONS ====================

    @gl.public.write
    def submit_answer(self, room_id: str, answer: str) -> str:
        """Player submits their answer for the current round."""
        room_json = self.rooms.get(room_id, None)
        if room_json is None:
            raise Exception("Room not found")
        
        room = json.loads(room_json)
        
        if room["status"] != "playing":
            raise Exception("Game not in progress")
        
        player = str(gl.message.sender_address)
        if player not in room["players"]:
            raise Exception("Not a player in this room")
        
        if player in room["submissions"]:
            raise Exception("Already submitted answer")
        
        room["submissions"][player] = {
            "answer": answer,
            "timestamp": str(gl.message.datetime)
        }
        
        self.rooms[room_id] = json.dumps(room)
        
        return "Answer submitted!"

    # ==================== JUDGING ====================

    @gl.public.write
    def judge_round(self, room_id: str) -> typing.Any:
        """
        Judge all submissions for the current round.
        Uses AI consensus for subjective modes.
        """
        room_json = self.rooms.get(room_id, None)
        if room_json is None:
            raise Exception("Room not found")
        
        room = json.loads(room_json)
        
        if room["status"] != "playing":
            raise Exception("Game not in progress")
        
        mode = room["current_mode"]
        submissions = room["submissions"]
        hidden_answer = room["hidden_data"]
        challenge = room["current_challenge"]
        
        if len(submissions) == 0:
            raise Exception("No submissions to judge")
        
        # Judge based on mode type
        if mode in ["crypto", "weather"]:
            # Objective - closest number wins
            results = self._judge_objective(submissions, hidden_answer)
        else:
            # Subjective - AI judges reasoning
            results = self._judge_subjective(submissions, challenge, hidden_answer)
        
        # Award points
        rankings = results["rankings"]
        first_player = rankings[0]["player"] if len(rankings) > 0 else None
        
        for i, entry in enumerate(rankings):
            player = entry["player"]
            if i == 0:
                room["scores"][player] = room["scores"].get(player, 0) + self.POINTS_1ST
                # Speed bonus for first submission
                room["scores"][player] += self.SPEED_BONUS
            elif i == 1:
                room["scores"][player] = room["scores"].get(player, 0) + self.POINTS_2ND
            elif i == 2:
                room["scores"][player] = room["scores"].get(player, 0) + self.POINTS_3RD
            else:
                room["scores"][player] = room["scores"].get(player, 0) + self.POINTS_OTHER
        
        # Store round results
        room["round_results"].append({
            "round": room["current_round"],
            "mode": mode,
            "challenge": challenge,
            "hidden_answer": hidden_answer,
            "rankings": rankings,
            "ai_reasoning": results.get("reasoning", "")
        })
        
        # Move to next round
        room["current_round"] += 1
        
        if room["current_round"] > room["max_rounds"]:
            room["status"] = "finished"
            # Update global leaderboard
            for player, score in room["scores"].items():
                current_xp = self.leaderboard.get(player, 0)
                self.leaderboard[player] = current_xp + score
        
        self.rooms[room_id] = json.dumps(room)
        
        return {
            "rankings": rankings,
            "reasoning": results.get("reasoning", ""),
            "actual_answer": hidden_answer,
            "game_finished": room["status"] == "finished"
        }

    def _judge_objective(self, submissions: dict, correct_answer: str) -> dict:
        """Judge objective answers (closest number wins)."""
        try:
            correct_num = float(correct_answer)
        except:
            correct_num = 0
        
        results = []
        for player, sub in submissions.items():
            try:
                player_num = float(sub["answer"])
                diff = abs(player_num - correct_num)
            except:
                diff = float('inf')
            
            results.append({
                "player": player,
                "answer": sub["answer"],
                "difference": diff
            })
        
        # Sort by difference (closest first)
        results.sort(key=lambda x: x["difference"])
        
        return {
            "rankings": results,
            "reasoning": f"Correct answer was {correct_answer}. Ranked by closest guess."
        }

    def _judge_subjective(self, submissions: dict, challenge: str, context: str) -> dict:
        """Use AI to judge subjective answers."""
        
        submissions_text = ""
        for player, sub in submissions.items():
            submissions_text += f"\nPlayer {player[-8:]}: {sub['answer']}"
        
        def judge_answers() -> str:
            task = f"""You are judging a game where players answer challenges about real-world data.

Challenge: {challenge}
Context: {context}

Player Submissions:
{submissions_text}

Rank these submissions from BEST to WORST based on:
1. Accuracy and relevance
2. Quality of reasoning
3. Creativity and insight

Return a JSON object with this format:
{{
    "rankings": [
        {{"player": "player_address", "score": 10, "reason": "brief reason"}},
        ...
    ],
    "overall_reasoning": "1-2 sentence summary of judging"
}}

Only return valid JSON, nothing else.
"""
            result = gl.exec_prompt(task)
            result = result.replace("```json", "").replace("```", "").strip()
            return result
        
        result_str = gl.eq_principle_prompt_non_comparative(
            judge_answers,
            task="Rank player submissions by quality",
            criteria="Rankings should reflect answer quality, accuracy, and reasoning"
        )
        
        try:
            result = json.loads(result_str)
            # Convert short addresses back to full
            rankings = []
            for r in result["rankings"]:
                # Find full player address
                for player in submissions.keys():
                    if player[-8:] == r["player"] or player == r["player"]:
                        rankings.append({
                            "player": player,
                            "answer": submissions[player]["answer"],
                            "reason": r.get("reason", "")
                        })
                        break
            
            return {
                "rankings": rankings,
                "reasoning": result.get("overall_reasoning", "")
            }
        except:
            # Fallback: random order
            return {
                "rankings": [{"player": p, "answer": s["answer"]} for p, s in submissions.items()],
                "reasoning": "Judging failed, using submission order."
            }

    # ==================== LEADERBOARD ====================

    @gl.public.view
    def get_leaderboard(self, limit: int = 10) -> list:
        """Get top players from global leaderboard."""
        # Convert TreeMap to list for sorting
        entries = []
        # Note: In production, you'd want a more efficient approach
        for player in self.leaderboard.keys():
            xp = self.leaderboard.get(player, 0)
            entries.append({"player": player, "xp": xp})
        
        # Sort by XP descending
        entries.sort(key=lambda x: x["xp"], reverse=True)
        
        return entries[:limit]

    @gl.public.view
    def get_player_xp(self, player: str) -> int:
        """Get XP for a specific player."""
        return self.leaderboard.get(player, 0)

    @gl.public.view
    def get_game_results(self, room_id: str) -> typing.Any:
        """Get final results for a completed game."""
        room_json = self.rooms.get(room_id, None)
        if room_json is None:
            return None
        
        room = json.loads(room_json)
        
        return {
            "status": room["status"],
            "scores": room["scores"],
            "round_results": room["round_results"]
        }