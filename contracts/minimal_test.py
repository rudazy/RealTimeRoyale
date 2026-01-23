# { "Depends": "py-genlayer:test" }

from genlayer import *
import json
import typing


class RealTimeRoyale(gl.Contract):
    room_counter: int
    rooms: TreeMap[str, str]
    leaderboard: TreeMap[str, int]

    def __init__(self):
        self.room_counter = 0

    @gl.public.write
    def create_room(self, is_private: bool) -> str:
        self.room_counter = self.room_counter + 1
        room_id = "room_" + str(self.room_counter)
        
        room_data = {
            "room_id": room_id,
            "host": str(gl.message.sender_address),
            "players": [str(gl.message.sender_address)],
            "status": "waiting",
            "is_private": is_private
        }
        
        self.rooms[room_id] = json.dumps(room_data)
        return room_id

    @gl.public.view
    def get_room(self, room_id: str) -> typing.Any:
        room_json = self.rooms.get(room_id, None)
        if room_json is None:
            return None
        return json.loads(room_json)

    @gl.public.view
    def get_player_xp(self, player: str) -> int:
        return self.leaderboard.get(player, 0)