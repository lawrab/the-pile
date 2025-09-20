"""
Repository for statistics and analytics queries.
"""

from collections import Counter
from typing import Any, Dict, List

from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from app.models.pile_entry import GameStatus, PileEntry
from app.models.steam_game import SteamGame
from app.repositories.base import BaseRepository


class StatsRepository(BaseRepository[PileEntry]):
    """Repository for statistics and analytics operations"""

    def __init__(self, db: Session):
        super().__init__(PileEntry, db)

    def get_by_user_id(self, user_id: int) -> List[PileEntry]:
        """Get all entries for stats analysis with eager loading"""
        return (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
            .all()
        )

    def get_reality_check_data(self, user_id: int) -> Dict[str, Any]:
        """Get all data needed for reality check calculations using effective status"""
        # Get all pile entries with steam game data for effective status calculation
        all_entries = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
            .all()
        )

        # Calculate effective statuses for all entries
        unplayed_entries = []
        total_games = len(all_entries)

        for entry in all_entries:
            effective_status = entry.effective_status
            if effective_status == GameStatus.UNPLAYED:
                unplayed_entries.append(entry)

        unplayed_games = len(unplayed_entries)

        # Find oldest unplayed game (by effective status)
        oldest_entry = None
        oldest_date = None

        for entry in unplayed_entries:
            if entry.purchase_date and (
                oldest_date is None or entry.purchase_date < oldest_date
            ):
                oldest_date = entry.purchase_date
                oldest_entry = entry

        return {
            "total_games": total_games,
            "unplayed_games": unplayed_games,
            "unplayed_entries": unplayed_entries,
            "oldest_entry": oldest_entry,
        }

    def get_shame_score_data(self, user_id: int) -> Dict[str, Any]:
        """Get data needed for shame score calculation using effective status"""
        # Get all entries to calculate effective statuses
        all_entries = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
            .all()
        )

        # Count zero playtime games that are effectively unplayed (not abandoned)
        zero_playtime_count = 0
        for entry in all_entries:
            if (
                entry.playtime_minutes == 0
                and entry.effective_status == GameStatus.UNPLAYED
            ):
                zero_playtime_count += 1

        return {"zero_playtime_count": zero_playtime_count}

    def get_genre_analysis(self, user_id: int) -> Dict[str, Any]:
        """Analyze genre preferences - what they buy vs what they play"""
        pile_entries = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
            .all()
        )

        bought_genres = []
        played_genres = []

        for entry in pile_entries:
            if entry.steam_game.genres:
                bought_genres.extend(entry.steam_game.genres)
                # Use effective_status to determine what counts as "played"
                effective_status = entry.effective_status
                if entry.playtime_minutes > 60 and effective_status not in [
                    GameStatus.UNPLAYED,
                    GameStatus.ABANDONED,
                ]:
                    played_genres.extend(entry.steam_game.genres)

        bought_counter = Counter(bought_genres)
        played_counter = Counter(played_genres)

        # Calculate neglected genres
        neglected_genres = {}
        for genre in bought_counter:
            bought = bought_counter[genre]
            played = played_counter.get(genre, 0)
            if bought > 0:
                neglected_genres[genre] = (bought - played) / bought

        most_neglected_genre = (
            max(neglected_genres.items(), key=lambda x: x[1])[0]
            if neglected_genres
            else ""
        )

        return {
            "bought_genres": dict(bought_counter),
            "played_genres": dict(played_counter),
            "neglected_genres": neglected_genres,
            "most_neglected_genre": most_neglected_genre,
            "genre_preferences": dict(bought_counter.most_common(5)),
        }

    def get_completion_stats(self, user_id: int) -> Dict[str, Any]:
        """Get completion and engagement statistics using effective status"""
        # Get all entries with steam game data for effective status calculation
        pile_entries = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
            .all()
        )

        if not pile_entries:
            return {
                "completion_rate": 0,
                "played_games": 0,
                "total_games": 0,
                "indie_ratio": 0,
                "free_games": 0,
            }

        # Count games by effective status
        played_games = 0
        completed_games = 0

        for entry in pile_entries:
            if entry.playtime_minutes > 0:
                played_games += 1
            if entry.effective_status == GameStatus.COMPLETED:
                completed_games += 1

        completion_rate = (
            (completed_games / len(pile_entries)) * 100 if len(pile_entries) > 0 else 0
        )

        # Analyze purchase patterns
        indie_bought = sum(
            1
            for entry in pile_entries
            if entry.purchase_price and entry.purchase_price < 20
        )
        indie_ratio = indie_bought / len(pile_entries)

        free_games = sum(
            1
            for entry in pile_entries
            if not entry.purchase_price or entry.purchase_price == 0
        )

        return {
            "completion_rate": completion_rate,
            "played_games": played_games,
            "total_games": len(pile_entries),
            "indie_ratio": indie_ratio,
            "free_games": free_games,
        }

    def get_financial_analysis(self, user_id: int) -> Dict[str, float]:
        """Analyze financial aspects of the pile"""
        pile_entries = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
            .all()
        )

        total_spent = sum(
            (entry.purchase_price or entry.steam_game.price or 0)
            for entry in pile_entries
        )

        # Calculate unplayed value using effective_status
        unplayed_value = 0
        most_expensive_unplayed = {"game": None, "price": 0}

        for entry in pile_entries:
            effective_status = entry.effective_status
            if effective_status == GameStatus.UNPLAYED:
                price = entry.purchase_price or entry.steam_game.price or 0
                unplayed_value += price

                if price > most_expensive_unplayed["price"]:
                    most_expensive_unplayed = {
                        "game": entry.steam_game.name,
                        "price": price,
                    }

        return {
            "total_spent": total_spent,
            "unplayed_value": unplayed_value,
            "money_wasted_percentage": (
                (unplayed_value / total_spent * 100) if total_spent else 0
            ),
            "most_expensive_unplayed": most_expensive_unplayed,
        }

    def get_temporal_analysis(self, user_id: int) -> Dict[str, Any]:
        """Analyze temporal patterns in the pile"""
        pile_entries = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id, PileEntry.purchase_date.isnot(None))
            .order_by(PileEntry.purchase_date)
            .all()
        )

        if not pile_entries:
            return {"oldest_game": None, "purchase_timeline": []}

        # Group by month/year for timeline
        purchase_timeline = {}
        for entry in pile_entries:
            month_key = entry.purchase_date.strftime("%Y-%m")
            if month_key not in purchase_timeline:
                purchase_timeline[month_key] = {"count": 0, "total_value": 0}

            purchase_timeline[month_key]["count"] += 1
            purchase_timeline[month_key]["total_value"] += (
                entry.purchase_price or entry.steam_game.price or 0
            )

        return {
            "oldest_game": {
                "name": pile_entries[0].steam_game.name,
                "purchase_date": pile_entries[0].purchase_date.strftime("%Y-%m-%d"),
            },
            "purchase_timeline": purchase_timeline,
            "total_games_with_dates": len(pile_entries),
        }

    def get_top_games_by_criteria(
        self, user_id: int, criteria: str = "playtime", limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get top games by various criteria"""
        query = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
        )

        if criteria == "playtime":
            query = query.order_by(desc(PileEntry.playtime_minutes))
        elif criteria == "price":
            query = query.order_by(desc(PileEntry.purchase_price))
        elif criteria == "rating":
            query = query.join(SteamGame).order_by(desc(SteamGame.steam_rating_percent))

        entries = query.limit(limit).all()

        return [
            {
                "name": entry.steam_game.name,
                "playtime_minutes": entry.playtime_minutes,
                "purchase_price": entry.purchase_price,
                "steam_rating": entry.steam_game.steam_rating_percent,
                "status": entry.effective_status.value,  # Use effective_status
            }
            for entry in entries
        ]
