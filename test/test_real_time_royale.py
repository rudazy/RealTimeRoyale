import pytest
from genlayer_test import get_contract_factory

@pytest.fixture
def contract():
    """Deploy a fresh contract instance for each test."""
    factory = get_contract_factory("contracts/real_time_royale.py")
    contract = factory.deploy()
    return contract


class TestRoomManagement:
    """Test room creation and joining."""
    
    def test_create_public_room(self, contract):
        """Test creating a public room."""
        result = contract.create_room(False)  # is_private = False
        assert result.startswith("room_")
        assert result == "room_1"
    
    def test_create_private_room(self, contract):
        """Test creating a private room."""
        result = contract.create_room(True)  # is_private = True
        assert result == "room_1"
    
    def test_create_multiple_rooms(self, contract):
        """Test creating multiple rooms."""
        room1 = contract.create_room(False)
        room2 = contract.create_room(True)
        room3 = contract.create_room(False)
        
        assert room1 == "room_1"
        assert room2 == "room_2"
        assert room3 == "room_3"
    
    def test_get_room(self, contract):
        """Test getting room details."""
        room_id = contract.create_room(False)
        room = contract.get_room(room_id)
        
        assert room is not None
        assert room["room_id"] == room_id
        assert room["status"] == "waiting"
        assert len(room["players"]) == 1
    
    def test_get_nonexistent_room(self, contract):
        """Test getting a room that does not exist."""
        room = contract.get_room("room_999")
        assert room is None
    
    def test_get_public_rooms(self, contract):
        """Test listing public rooms."""
        # Create some rooms
        contract.create_room(False)  # Public
        contract.create_room(True)   # Private
        contract.create_room(False)  # Public
        
        public_rooms = contract.get_public_rooms()
        
        # Should only show public waiting rooms
        assert len(public_rooms) == 2


class TestJoinRoom:
    """Test joining rooms."""
    
    def test_join_room_success(self, contract, second_account):
        """Test successfully joining a room."""
        room_id = contract.create_room(False)
        
        # Switch to second account and join
        contract.set_sender(second_account)
        result = contract.join_room(room_id)
        
        assert "Joined room" in result
        assert "2/8" in result
    
    def test_join_nonexistent_room(self, contract, second_account):
        """Test joining a room that does not exist."""
        contract.set_sender(second_account)
        
        with pytest.raises(Exception) as exc_info:
            contract.join_room("room_999")
        
        assert "Room not found" in str(exc_info.value)
    
    def test_join_room_already_in(self, contract):
        """Test joining a room you are already in."""
        room_id = contract.create_room(False)
        
        with pytest.raises(Exception) as exc_info:
            contract.join_room(room_id)
        
        assert "Already in room" in str(exc_info.value)


class TestGameStart:
    """Test game start functionality."""
    
    def test_start_game_success(self, contract, second_account):
        """Test successfully starting a game."""
        room_id = contract.create_room(False)
        
        # Second player joins
        contract.set_sender(second_account)
        contract.join_room(room_id)
        
        # Host starts game
        contract.reset_sender()  # Back to host
        result = contract.start_game(room_id)
        
        assert "Game started" in result
        
        # Verify room status
        room = contract.get_room(room_id)
        assert room["status"] == "playing"
        assert room["current_round"] == 1
    
    def test_start_game_not_host(self, contract, second_account):
        """Test that only host can start game."""
        room_id = contract.create_room(False)
        
        contract.set_sender(second_account)
        contract.join_room(room_id)
        
        # Try to start as non-host
        with pytest.raises(Exception) as exc_info:
            contract.start_game(room_id)
        
        assert "Only host can start" in str(exc_info.value)
    
    def test_start_game_not_enough_players(self, contract):
        """Test starting game with only 1 player."""
        room_id = contract.create_room(False)
        
        with pytest.raises(Exception) as exc_info:
            contract.start_game(room_id)
        
        assert "Need at least 2 players" in str(exc_info.value)


class TestSubmitAnswer:
    """Test answer submission."""
    
    def test_submit_answer_success(self, contract, second_account):
        """Test successfully submitting an answer."""
        # Setup game
        room_id = contract.create_room(False)
        contract.set_sender(second_account)
        contract.join_room(room_id)
        contract.reset_sender()
        contract.start_game(room_id)
        contract.start_round(room_id)
        
        # Submit answer
        result = contract.submit_answer(room_id, "50000")
        assert "Answer submitted" in result
    
    def test_submit_answer_not_player(self, contract, second_account, third_account):
        """Test submitting answer when not a player."""
        # Setup game
        room_id = contract.create_room(False)
        contract.set_sender(second_account)
        contract.join_room(room_id)
        contract.reset_sender()
        contract.start_game(room_id)
        contract.start_round(room_id)
        
        # Try to submit as non-player
        contract.set_sender(third_account)
        
        with pytest.raises(Exception) as exc_info:
            contract.submit_answer(room_id, "50000")
        
        assert "Not a player" in str(exc_info.value)
    
    def test_submit_answer_twice(self, contract, second_account):
        """Test submitting answer twice."""
        # Setup game
        room_id = contract.create_room(False)
        contract.set_sender(second_account)
        contract.join_room(room_id)
        contract.reset_sender()
        contract.start_game(room_id)
        contract.start_round(room_id)
        
        # Submit first answer
        contract.submit_answer(room_id, "50000")
        
        # Try to submit again
        with pytest.raises(Exception) as exc_info:
            contract.submit_answer(room_id, "60000")
        
        assert "Already submitted" in str(exc_info.value)


class TestLeaderboard:
    """Test leaderboard functionality."""
    
    def test_get_empty_leaderboard(self, contract):
        """Test getting leaderboard when empty."""
        leaderboard = contract.get_leaderboard(10)
        assert leaderboard == []
    
    def test_get_player_xp_new_player(self, contract):
        """Test getting XP for a player with no games."""
        xp = contract.get_player_xp("0x1234567890123456789012345678901234567890")
        assert xp == 0


class TestGameResults:
    """Test game results functionality."""
    
    def test_get_game_results_nonexistent(self, contract):
        """Test getting results for nonexistent room."""
        results = contract.get_game_results("room_999")
        assert results is None
    
    def test_get_game_results_waiting(self, contract):
        """Test getting results for waiting room."""
        room_id = contract.create_room(False)
        results = contract.get_game_results(room_id)
        
        assert results is not None
        assert results["status"] == "waiting"
        assert results["scores"] == {}


# Fixtures for multiple accounts
@pytest.fixture
def second_account():
    """Create a second test account."""
    from genlayer_test import create_test_account
    return create_test_account()


@pytest.fixture
def third_account():
    """Create a third test account."""
    from genlayer_test import create_test_account
    return create_test_account()