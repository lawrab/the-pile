"""
Unit tests for StatsService - Shame score calculation and behavioral insights.
"""

from datetime import datetime, timedelta, timezone

import pytest

from app.models.pile_entry import GameStatus, PileEntry
from app.models.steam_game import SteamGame
from app.services.stats_service import StatsService


class TestStatsService:
    """Test suite for StatsService shame score and insights."""

    @pytest.fixture
    def stats_service(self):
        """Create a StatsService instance for testing."""
        return StatsService()

    @pytest.fixture
    def pile_with_varied_games(self, db_session, sample_user):
        """Create a pile with games in different states for testing."""
        games_data = [
            # Unplayed expensive game (high shame)
            {
                "name": "Cyberpunk 2077",
                "price": 59.99,
                "playtime": 0,
                "status": GameStatus.UNPLAYED,
                "purchase_days_ago": 365,
                "app_id": 1000,
            },
            # Playing game (medium shame)
            {
                "name": "The Witcher 3",
                "price": 39.99,
                "playtime": 1200,
                "status": GameStatus.PLAYING,
                "purchase_days_ago": 180,
                "app_id": 1001,
            },
            # Completed game (no shame)
            {
                "name": "Portal 2",
                "price": 19.99,
                "playtime": 480,
                "status": GameStatus.COMPLETED,
                "purchase_days_ago": 90,
                "app_id": 1002,
            },
            # Abandoned game (high shame)
            {
                "name": "Dark Souls III",
                "price": 49.99,
                "playtime": 30,
                "status": GameStatus.ABANDONED,
                "purchase_days_ago": 200,
                "app_id": 1003,
            },
            # Amnesty granted (reduced shame)
            {
                "name": "Flight Simulator",
                "price": 69.99,
                "playtime": 5,
                "status": GameStatus.AMNESTY_GRANTED,
                "purchase_days_ago": 400,
                "app_id": 1004,
            },
        ]

        pile_entries = []
        for game_data in games_data:
            # Create Steam game
            steam_game = SteamGame(
                steam_app_id=game_data["app_id"],
                name=game_data["name"],
                price=game_data["price"],
                genres=["RPG", "Action"] if "RPG" in game_data["name"] else ["Action"],
                description=f"Description for {game_data['name']}",
            )
            db_session.add(steam_game)
            db_session.commit()
            db_session.refresh(steam_game)

            # Create pile entry
            purchase_date = datetime.now(timezone.utc) - timedelta(
                days=game_data["purchase_days_ago"]
            )
            pile_entry = PileEntry(
                user_id=sample_user.id,
                steam_game_id=steam_game.id,
                status=game_data["status"],
                playtime_minutes=game_data["playtime"],
                purchase_price=game_data["price"],
                purchase_date=purchase_date,
            )

            # Set status-specific dates
            if game_data["status"] == GameStatus.COMPLETED:
                pile_entry.completion_date = datetime.now(timezone.utc) - timedelta(
                    days=30
                )
            elif game_data["status"] == GameStatus.ABANDONED:
                pile_entry.abandon_date = datetime.now(timezone.utc) - timedelta(
                    days=50
                )
            elif game_data["status"] == GameStatus.AMNESTY_GRANTED:
                pile_entry.amnesty_date = datetime.now(timezone.utc) - timedelta(
                    days=10
                )

            db_session.add(pile_entry)
            pile_entries.append(pile_entry)

        db_session.commit()
        return pile_entries

    @pytest.mark.asyncio
    async def test_calculate_basic_shame_score(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test basic shame score calculation algorithm."""
        result = await stats_service.calculate_shame_score(sample_user.id, db_session)

        # Verify the shame score structure
        assert hasattr(result, "score")
        assert hasattr(result, "breakdown")
        assert hasattr(result, "rank")
        assert hasattr(result, "message")

        # Should be positive score due to unplayed games
        assert result.score > 0

        # Verify breakdown components
        assert "unplayed_games" in result.breakdown
        assert "money_wasted" in result.breakdown
        assert "time_to_complete" in result.breakdown
        assert "never_played" in result.breakdown

    @pytest.mark.asyncio
    async def test_shame_score_components(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test individual components of shame score calculation."""
        result = await stats_service.calculate_shame_score(sample_user.id, db_session)

        # Should have breakdown of different penalty types
        breakdown = result.breakdown

        # Unplayed games penalty (should be > 0 since we have unplayed games)
        assert breakdown["unplayed_games"] > 0

        # Money wasted penalty (should be > 0 since we have expensive unplayed games)
        assert breakdown["money_wasted"] > 0

        # Never played penalty (should be > 0 since we have 0 playtime games)
        assert breakdown["never_played"] > 0

        # Time penalty should be present
        assert breakdown["time_to_complete"] >= 0

    @pytest.mark.asyncio
    async def test_shame_score_time_penalty(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test time-based penalty calculation."""
        result = await stats_service.calculate_shame_score(sample_user.id, db_session)

        # Time penalty should be calculated based on completion years
        # Should be capped at 100 points max
        assert result.breakdown["time_to_complete"] <= 100
        assert result.breakdown["time_to_complete"] >= 0

    @pytest.mark.asyncio
    async def test_shame_score_ranking(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test shame score ranking system."""
        result = await stats_service.calculate_shame_score(sample_user.id, db_session)

        # Should have a rank assigned
        expected_ranks = [
            "Casual Collector",
            "Sale Victim",
            "Serial Buyer",
            "Pile Builder",
            "The Pile Master",
        ]

        assert result.rank in expected_ranks
        assert len(result.message) > 0

    @pytest.mark.asyncio
    async def test_reality_check_calculations(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test reality check engine calculations."""
        reality_check = await stats_service.calculate_reality_check(
            sample_user.id, db_session
        )

        # Verify structure
        assert hasattr(reality_check, "total_games")
        assert hasattr(reality_check, "unplayed_games")
        assert hasattr(reality_check, "completion_years")
        assert hasattr(reality_check, "money_wasted")
        assert hasattr(reality_check, "most_expensive_unplayed")
        assert hasattr(reality_check, "oldest_unplayed")

        # Should have games from our fixture
        assert reality_check.total_games == 5
        assert reality_check.unplayed_games >= 1  # At least one unplayed game
        assert (
            reality_check.money_wasted > 0
        )  # Should have money wasted on unplayed games
        assert reality_check.completion_years > 0  # Should take time to complete

    @pytest.mark.asyncio
    async def test_reality_check_money_calculation(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test money wasted calculation in reality check."""
        reality_check = await stats_service.calculate_reality_check(
            sample_user.id, db_session
        )

        # Should calculate money wasted on unplayed games
        # We have Cyberpunk 2077 ($59.99) as unplayed in our fixture
        assert reality_check.money_wasted >= 59.99

    @pytest.mark.asyncio
    async def test_reality_check_most_expensive(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test most expensive unplayed game tracking."""
        reality_check = await stats_service.calculate_reality_check(
            sample_user.id, db_session
        )

        # Should identify most expensive unplayed game
        if reality_check.most_expensive_unplayed:
            # Should have at least one entry
            assert len(reality_check.most_expensive_unplayed) > 0
            # Should have a positive price
            game_name, price = next(iter(reality_check.most_expensive_unplayed.items()))
            assert price > 0
            assert len(game_name) > 0

    @pytest.mark.asyncio
    async def test_progressive_shame_calculation(
        self, stats_service, db_session, sample_user
    ):
        """Test that shame score increases appropriately with more unplayed games."""
        scores = []

        # Test with increasing numbers of unplayed games
        for game_count in [1, 5, 10]:
            # Clear previous test data
            db_session.query(PileEntry).filter(
                PileEntry.user_id == sample_user.id
            ).delete()
            db_session.commit()

            # Create new test games
            for i in range(game_count):
                steam_game = SteamGame(
                    steam_app_id=2000 + i + (game_count * 100),  # Ensure unique app_ids
                    name=f"Test Game {game_count}-{i}",
                    price=19.99,
                )
                db_session.add(steam_game)
                db_session.commit()
                db_session.refresh(steam_game)

                pile_entry = PileEntry(
                    user_id=sample_user.id,
                    steam_game_id=steam_game.id,
                    status=GameStatus.UNPLAYED,
                    playtime_minutes=0,
                    purchase_price=19.99,
                )
                db_session.add(pile_entry)

            db_session.commit()

            # Calculate shame score
            score_result = await stats_service.calculate_shame_score(
                sample_user.id, db_session
            )
            scores.append(score_result.score)

        # Scores should generally increase with more unplayed games
        assert scores[1] > scores[0]  # 5 games > 1 game
        assert scores[2] > scores[1]  # 10 games > 5 games

    @pytest.mark.asyncio
    async def test_edge_cases(self, stats_service, db_session, sample_user):
        """Test edge cases in shame score calculation."""
        # Clear any existing pile entries
        db_session.query(PileEntry).filter(PileEntry.user_id == sample_user.id).delete()
        db_session.commit()

        # Empty pile should return minimal score
        empty_result = await stats_service.calculate_shame_score(
            sample_user.id, db_session
        )
        assert empty_result.score >= 0
        assert empty_result.breakdown["unplayed_games"] == 0
        assert empty_result.breakdown["money_wasted"] == 0
        assert empty_result.breakdown["never_played"] == 0

    @pytest.mark.asyncio
    async def test_user_score_update(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test that user's shame score is updated in database."""
        original_score = sample_user.shame_score

        # Calculate new shame score
        result = await stats_service.calculate_shame_score(sample_user.id, db_session)

        # Refresh user from database
        db_session.refresh(sample_user)

        # User's shame score should be updated
        assert sample_user.shame_score == result.score
        assert sample_user.shame_score != original_score  # Should have changed

    @pytest.mark.asyncio
    async def test_generate_insights(
        self, stats_service, pile_with_varied_games, sample_user, db_session
    ):
        """Test insights generation."""
        insights = await stats_service.generate_insights(sample_user.id, db_session)

        # Should return BehavioralInsights data structure with correct attributes
        assert hasattr(insights, "buying_patterns")
        assert hasattr(insights, "genre_preferences")
        assert hasattr(insights, "completion_rate")
        assert hasattr(insights, "most_neglected_genre")
        assert hasattr(insights, "recommendations")

        # Verify data types
        assert isinstance(insights.buying_patterns, list)
        assert isinstance(insights.genre_preferences, dict)
        assert isinstance(insights.completion_rate, float)
        assert isinstance(insights.most_neglected_genre, str)
        assert isinstance(insights.recommendations, list)
