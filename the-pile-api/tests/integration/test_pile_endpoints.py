"""
Integration tests for Pile API endpoints.
"""

from unittest.mock import patch

from app.models.pile_entry import GameStatus


class TestPileEndpoints:
    """Integration tests for /api/v1/pile endpoints."""

    def test_get_pile_unauthorized(self, client):
        """Test getting pile without authentication."""
        response = client.get("/api/v1/pile/")
        assert response.status_code == 403  # FastAPI returns 403 for missing auth

    def test_get_pile_empty(self, client, auth_headers, mock_jwt_decode):
        """Test getting empty pile."""
        response = client.get("/api/v1/pile/", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_get_pile_with_entries(
        self, client, auth_headers, sample_pile_entry, mock_jwt_decode
    ):
        """Test getting pile with entries."""
        response = client.get("/api/v1/pile/", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == sample_pile_entry.id
        assert data[0]["status"] == "unplayed"
        assert data[0]["playtime_minutes"] == 0

        # Verify steam_game data is included
        assert "steam_game" in data[0]
        steam_game = data[0]["steam_game"]
        assert steam_game["name"] == "Portal"
        assert steam_game["steam_app_id"] == 400
        assert "screenshots" in steam_game

    def test_get_pile_with_status_filter(
        self,
        client,
        auth_headers,
        db_session,
        sample_user,
        sample_steam_game,
        mock_jwt_decode,
    ):
        """Test getting pile with status filter."""
        # Create entries with different statuses
        from app.models.pile_entry import PileEntry

        playing_entry = PileEntry(
            user_id=sample_user.id,
            steam_game_id=sample_steam_game.id,
            status=GameStatus.PLAYING,
            playtime_minutes=120,
            purchase_price=9.99,
        )
        db_session.add(playing_entry)
        db_session.commit()

        # Test filtering by playing status
        response = client.get("/api/v1/pile/?status=playing", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "playing"

    def test_get_pile_with_pagination(
        self, client, auth_headers, db_session, sample_user, mock_jwt_decode
    ):
        """Test pile pagination."""
        # Create multiple entries
        from app.models.pile_entry import PileEntry
        from app.models.steam_game import SteamGame

        for i in range(5):
            steam_game = SteamGame(
                steam_app_id=500 + i, name=f"Test Game {i}", price=19.99
            )
            db_session.add(steam_game)
            db_session.commit()
            db_session.refresh(steam_game)

            pile_entry = PileEntry(
                user_id=sample_user.id,
                steam_game_id=steam_game.id,
                status=GameStatus.UNPLAYED,
                playtime_minutes=0,
            )
            db_session.add(pile_entry)

        db_session.commit()

        # Test limit
        response = client.get("/api/v1/pile/?limit=2", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 2

        # Test offset
        response = client.get("/api/v1/pile/?limit=2&offset=2", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 2

    @patch("app.services.pile_service.PileService.import_steam_library")
    def test_import_steam_library_success(
        self, mock_import, client, auth_headers, mock_jwt_decode
    ):
        """Test successful Steam library import."""
        mock_import.return_value = None

        response = client.post("/api/v1/pile/import", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert data["message"] == "Steam library import started"
        assert data["status"] == "processing"

        # Verify the service method was called
        mock_import.assert_called_once()

    @patch("app.services.pile_service.PileService.sync_playtime")
    def test_sync_playtime_success(
        self, mock_sync, client, auth_headers, mock_jwt_decode
    ):
        """Test successful playtime sync."""
        mock_sync.return_value = None

        response = client.post("/api/v1/pile/sync", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert data["message"] == "Playtime sync started"
        assert data["status"] == "processing"

    def test_grant_amnesty_success(
        self, client, auth_headers, sample_pile_entry, db_session, mock_jwt_decode
    ):
        """Test successful amnesty granting."""
        amnesty_data = {"reason": "Game is too difficult for my current skill level"}

        response = client.post(
            f"/api/v1/pile/amnesty/{sample_pile_entry.steam_game_id}",
            json=amnesty_data,
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()
        assert data["message"] == "Amnesty granted"
        assert data["game_id"] == sample_pile_entry.steam_game_id

        # Verify the pile entry was updated
        db_session.refresh(sample_pile_entry)
        assert sample_pile_entry.status == GameStatus.AMNESTY_GRANTED
        assert (
            sample_pile_entry.amnesty_reason
            == "Game is too difficult for my current skill level"
        )

    def test_grant_amnesty_nonexistent_game(
        self, client, auth_headers, mock_jwt_decode
    ):
        """Test amnesty granting for non-existent game."""
        amnesty_data = {"reason": "Test reason"}

        response = client.post(
            "/api/v1/pile/amnesty/99999", json=amnesty_data, headers=auth_headers
        )
        assert response.status_code == 404
        assert "Game not found" in response.json()["detail"]

    def test_start_playing_success(
        self, client, auth_headers, sample_pile_entry, db_session, mock_jwt_decode
    ):
        """Test successfully marking game as playing."""
        response = client.post(
            f"/api/v1/pile/start-playing/{sample_pile_entry.steam_game_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()
        assert data["message"] == "Game marked as playing"

        # Verify status change
        db_session.refresh(sample_pile_entry)
        assert sample_pile_entry.status == GameStatus.PLAYING

    def test_mark_completed_success(
        self, client, auth_headers, sample_pile_entry, db_session, mock_jwt_decode
    ):
        """Test successfully marking game as completed."""
        response = client.post(
            f"/api/v1/pile/complete/{sample_pile_entry.steam_game_id}",
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()
        assert data["message"] == "Game marked as completed"

        # Verify status change and completion date
        db_session.refresh(sample_pile_entry)
        assert sample_pile_entry.status == GameStatus.COMPLETED
        assert sample_pile_entry.completion_date is not None

    def test_mark_abandoned_success(
        self, client, auth_headers, sample_pile_entry, db_session, mock_jwt_decode
    ):
        """Test successfully marking game as abandoned."""
        abandon_data = {"reason": "Lost interest in the story"}

        response = client.post(
            f"/api/v1/pile/abandon/{sample_pile_entry.steam_game_id}",
            json=abandon_data,
            headers=auth_headers,
        )
        assert response.status_code == 200

        # Verify status change
        db_session.refresh(sample_pile_entry)
        assert sample_pile_entry.status == GameStatus.ABANDONED
        assert sample_pile_entry.abandon_reason == "Lost interest in the story"

    def test_update_status_direct_success(
        self, client, auth_headers, sample_pile_entry, db_session, mock_jwt_decode
    ):
        """Test directly updating game status."""
        status_data = {"status": "completed"}

        response = client.post(
            f"/api/v1/pile/status/{sample_pile_entry.steam_game_id}",
            json=status_data,
            headers=auth_headers,
        )
        assert response.status_code == 200

        data = response.json()
        assert "completed" in data["message"]

        # Verify status change
        db_session.refresh(sample_pile_entry)
        assert sample_pile_entry.status == GameStatus.COMPLETED

    def test_update_status_invalid_status(
        self, client, auth_headers, sample_pile_entry, mock_jwt_decode
    ):
        """Test updating to invalid status."""
        status_data = {"status": "invalid_status"}

        response = client.post(
            f"/api/v1/pile/status/{sample_pile_entry.steam_game_id}",
            json=status_data,
            headers=auth_headers,
        )
        assert response.status_code == 400
        assert "Invalid status" in response.json()["detail"]

    def test_update_status_missing_status_field(
        self, client, auth_headers, sample_pile_entry, mock_jwt_decode
    ):
        """Test updating without status field."""
        status_data = {"wrong_field": "completed"}

        response = client.post(
            f"/api/v1/pile/status/{sample_pile_entry.steam_game_id}",
            json=status_data,
            headers=auth_headers,
        )
        assert response.status_code == 400
        assert (
            "Status field is required" in response.json()["detail"]
        )  # Match actual API message

    def test_all_endpoints_require_auth(self, client, sample_pile_entry):
        """Test that all endpoints require authentication."""
        endpoints = [
            ("GET", "/api/v1/pile/"),
            ("POST", "/api/v1/pile/import"),
            ("POST", "/api/v1/pile/sync"),
            ("POST", f"/api/v1/pile/amnesty/{sample_pile_entry.steam_game_id}"),
            ("POST", f"/api/v1/pile/start-playing/{sample_pile_entry.steam_game_id}"),
            ("POST", f"/api/v1/pile/complete/{sample_pile_entry.steam_game_id}"),
            ("POST", f"/api/v1/pile/abandon/{sample_pile_entry.steam_game_id}"),
            ("POST", f"/api/v1/pile/status/{sample_pile_entry.steam_game_id}"),
        ]

        for method, endpoint in endpoints:
            if method == "GET":
                response = client.get(endpoint)
            else:
                response = client.post(endpoint, json={})

            assert (
                response.status_code == 403
            ), f"Endpoint {method} {endpoint} should require auth"  # FastAPI: 403

    def test_cross_user_access_protection(
        self, client, auth_headers, db_session, mock_jwt_decode
    ):
        """Test that users can't access other users' pile entries."""
        # Create another user and their pile entry
        from app.models.pile_entry import PileEntry
        from app.models.steam_game import SteamGame
        from app.models.user import User

        other_user = User(steam_id="76561197960435531", username="otheruser")
        db_session.add(other_user)
        db_session.commit()
        db_session.refresh(other_user)

        other_game = SteamGame(steam_app_id=999, name="Other User Game", price=29.99)
        db_session.add(other_game)
        db_session.commit()
        db_session.refresh(other_game)

        other_entry = PileEntry(
            user_id=other_user.id,
            steam_game_id=other_game.id,
            status=GameStatus.UNPLAYED,
            playtime_minutes=0,
        )
        db_session.add(other_entry)
        db_session.commit()

        # Try to grant amnesty to other user's game - should fail
        response = client.post(
            f"/api/v1/pile/amnesty/{other_game.id}",
            json={"reason": "Test"},
            headers=auth_headers,
        )
        assert response.status_code == 404
