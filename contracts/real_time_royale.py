# { "Depends": "py-genlayer:test" }

from genlayer import *
import json

class RealTimeRoyale(gl.Contract):
    room_counter: u32
    rooms: TreeMap[str, str]
    leaderboard: TreeMap[str, u32]

    def __init__(self):
        self.room_counter = u32(0)

    @gl.public.write
    def create_room(self) -> str:
        self.room_counter = u32(self.room_counter + 1)
        room_id = "room_" + str(self.room_counter)
        host = str(gl.message.sender_address)
        room_data = {"room_id": room_id, "host": host, "players": [host], "status": "waiting", "scores": {}, "current_round": 0, "max_rounds": 3, "challenge": "", "answer": "", "submissions": {}}
        self.rooms[room_id] = json.dumps(room_data)
        return room_id

    @gl.public.write
    def join_room(self, room_id: str) -> str:
        room_json = self.rooms.get(room_id, "")
        if room_json == "":
            return "Room not found"
        room = json.loads(room_json)
        if room["status"] != "waiting":
            return "Game already started"
        player = str(gl.message.sender_address)
        if player in room["players"]:
            return "Already in room"
        room["players"].append(player)
        self.rooms[room_id] = json.dumps(room)
        return "Joined"

    @gl.public.write
    def start_game(self, room_id: str) -> str:
        room_json = self.rooms.get(room_id, "")
        if room_json == "":
            return "Room not found"
        room = json.loads(room_json)
        if str(gl.message.sender_address) != room["host"]:
            return "Only host can start"
        if len(room["players"]) < 2:
            return "Need at least 2 players"
        room["status"] = "playing"
        room["current_round"] = 1
        for player in room["players"]:
            room["scores"][player] = 0
        self.rooms[room_id] = json.dumps(room)
        return "Game started"

    @gl.public.write
    def start_round(self, room_id: str) -> str:
        room_json = self.rooms.get(room_id, "")
        if room_json == "":
            return "Room not found"
        room = json.loads(room_json)
        if room["status"] != "playing":
            return "Game not in progress"
        
        def fetch_btc_price():
            url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
            data = gl.get_webpage(url, mode="text")
            return data
        
        price_data = gl.eq_principle_strict_eq(fetch_btc_price)
        
        try:
            parsed = json.loads(price_data)
            btc_price = str(parsed["bitcoin"]["usd"])
        except:
            btc_price = "50000"
        
        room["challenge"] = "Guess the Bitcoin price in USD"
        room["answer"] = btc_price
        room["submissions"] = {}
        self.rooms[room_id] = json.dumps(room)
        return "Round started: " + room["challenge"]

    @gl.public.write
    def submit_answer(self, room_id: str, answer: str) -> str:
        room_json = self.rooms.get(room_id, "")
        if room_json == "":
            return "Room not found"
        room = json.loads(room_json)
        if room["status"] != "playing":
            return "Game not in progress"
        player = str(gl.message.sender_address)
        if player not in room["players"]:
            return "Not a player"
        if player in room["submissions"]:
            return "Already submitted"
        room["submissions"][player] = answer
        self.rooms[room_id] = json.dumps(room)
        return "Answer submitted"

    @gl.public.write
    def judge_round(self, room_id: str) -> str:
        room_json = self.rooms.get(room_id, "")
        if room_json == "":
            return "Room not found"
        room = json.loads(room_json)
        if room["status"] != "playing":
            return "Game not in progress"
        
        actual = room["answer"]
        try:
            actual_num = float(actual)
        except:
            actual_num = 0
        
        rankings = []
        for player, guess in room["submissions"].items():
            try:
                guess_num = float(guess)
                diff = abs(guess_num - actual_num)
            except:
                diff = 999999999
            rankings.append({"player": player, "diff": diff})
        
        rankings.sort(key=lambda x: x["diff"])
        
        points = [100, 75, 50, 25]
        for i, entry in enumerate(rankings):
            player = entry["player"]
            pts = points[i] if i < 4 else 25
            room["scores"][player] = room["scores"].get(player, 0) + pts
        
        room["current_round"] = room["current_round"] + 1
        
        if room["current_round"] > room["max_rounds"]:
            room["status"] = "finished"
            for player, score in room["scores"].items():
                current_xp = self.leaderboard.get(player, u32(0))
                self.leaderboard[player] = u32(current_xp + score)
        
        self.rooms[room_id] = json.dumps(room)
        
        winner = rankings[0]["player"] if rankings else "none"
        return "Round ended. Winner: " + winner + ". Actual: " + actual

    @gl.public.view
    def get_room(self, room_id: str) -> str:
        return self.rooms.get(room_id, "{}")

    @gl.public.view
    def get_player_xp(self, player: str) -> u32:
        return self.leaderboard.get(player, u32(0))

    @gl.public.view
    def get_leaderboard(self) -> str:
        return "{}"