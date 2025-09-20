"""
Repository for pile-related database operations.
"""

from typing import Any, Dict, List, Optional

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload

from app.models.pile_entry import GameStatus, PileEntry
from app.models.steam_game import SteamGame
from app.repositories.base import BaseRepository
from app.schemas.pile import PileFilters


class PileRepository(BaseRepository[PileEntry]):
    """Repository for pile entry operations with domain-specific queries"""

    def __init__(self, db: Session):
        super().__init__(PileEntry, db)

    def get_by_user_id(self, user_id: int) -> List[PileEntry]:
        """Get all pile entries for a user with eager loading"""
        return (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
            .all()
        )

    def get_filtered_pile(self, user_id: int, filters: PileFilters) -> List[PileEntry]:
        """Get user's pile with filtering and sorting - optimized with eager loading"""
        query = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
        )

        # Apply filters
        if filters.status:
            query = query.filter(PileEntry.status == filters.status)

        if filters.genre:
            query = query.join(SteamGame).filter(
                SteamGame.genres.contains([filters.genre])
            )

        # Apply sorting
        if filters.sort_by:
            if filters.sort_by == "playtime":
                if filters.sort_direction == "asc":
                    query = query.order_by(PileEntry.playtime_minutes.asc())
                else:
                    query = query.order_by(PileEntry.playtime_minutes.desc())
            elif filters.sort_by == "rating":
                # Join with SteamGame if not already joined
                if not filters.genre:
                    query = query.join(SteamGame)

                if filters.sort_direction == "asc":
                    query = query.order_by(
                        SteamGame.steam_rating_percent.asc().nulls_last()
                    )
                else:
                    query = query.order_by(
                        SteamGame.steam_rating_percent.desc().nulls_last()
                    )
        else:
            # Default sorting by creation date (newest first)
            query = query.order_by(PileEntry.created_at.desc())

        return query.offset(filters.offset).limit(filters.limit).all()

    def get_by_user_and_game(
        self, user_id: int, steam_game_id: int
    ) -> Optional[PileEntry]:
        """Get a specific pile entry by user and game"""
        return (
            self.db.query(PileEntry)
            .filter(
                and_(
                    PileEntry.user_id == user_id,
                    PileEntry.steam_game_id == steam_game_id,
                )
            )
            .first()
        )

    def get_by_status(self, user_id: int, status: GameStatus) -> List[PileEntry]:
        """Get pile entries by status with eager loading"""
        return (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(and_(PileEntry.user_id == user_id, PileEntry.status == status))
            .all()
        )

    def get_unplayed_entries(self, user_id: int) -> List[PileEntry]:
        """Get all unplayed entries for a user"""
        return self.get_by_status(user_id, GameStatus.UNPLAYED)

    def get_playtime_stats(self, user_id: int) -> Dict[str, Any]:
        """Get playtime statistics for a user"""
        entries = self.get_by_user_id(user_id)

        total_games = len(entries)
        played_games = sum(1 for entry in entries if entry.playtime_minutes > 0)
        zero_playtime_games = sum(1 for entry in entries if entry.playtime_minutes == 0)
        total_playtime = sum(entry.playtime_minutes or 0 for entry in entries)

        return {
            "total_games": total_games,
            "played_games": played_games,
            "zero_playtime_games": zero_playtime_games,
            "total_playtime_minutes": total_playtime,
            "total_playtime_hours": (
                round(total_playtime / 60, 2) if total_playtime else 0
            ),
            "completion_rate": (played_games / total_games * 100) if total_games else 0,
        }

    def get_money_wasted(self, user_id: int) -> float:
        """Calculate money wasted on unplayed games"""
        unplayed_entries = self.get_unplayed_entries(user_id)

        return sum(
            (entry.purchase_price or entry.steam_game.price or 0)
            for entry in unplayed_entries
        )

    def update_status(
        self, user_id: int, steam_game_id: int, status: GameStatus, **kwargs
    ) -> Optional[PileEntry]:
        """Update the status of a pile entry with additional fields"""
        entry = self.get_by_user_and_game(user_id, steam_game_id)
        if entry:
            entry.status = status

            # Update additional fields based on status
            for field, value in kwargs.items():
                if hasattr(entry, field):
                    setattr(entry, field, value)

            self.db.commit()
            self.db.refresh(entry)

        return entry

    def bulk_update_playtime(self, user_id: int, playtime_map: Dict[int, int]) -> int:
        """Bulk update playtime for multiple games - optimized for Steam sync"""
        entries = (
            self.db.query(PileEntry)
            .options(joinedload(PileEntry.steam_game))
            .filter(PileEntry.user_id == user_id)
            .all()
        )

        updated_count = 0
        for entry in entries:
            app_id = entry.steam_game.steam_app_id
            if app_id in playtime_map:
                new_playtime = playtime_map[app_id]
                if entry.playtime_minutes != new_playtime:
                    entry.playtime_minutes = new_playtime

                    # Auto-update status based on playtime
                    if new_playtime == 0 and entry.status not in [
                        GameStatus.AMNESTY_GRANTED,
                        GameStatus.COMPLETED,
                    ]:
                        entry.status = GameStatus.UNPLAYED
                    elif new_playtime > 0 and entry.status == GameStatus.UNPLAYED:
                        entry.status = GameStatus.PLAYING

                    updated_count += 1

        if updated_count > 0:
            self.db.commit()

        return updated_count

    def count_by_status(self, user_id: int) -> Dict[GameStatus, int]:
        """Get count of games by status"""
        from sqlalchemy import func

        results = (
            self.db.query(PileEntry.status, func.count(PileEntry.id).label("count"))
            .filter(PileEntry.user_id == user_id)
            .group_by(PileEntry.status)
            .all()
        )

        # Convert to dict with all statuses represented
        status_counts = {status: 0 for status in GameStatus}
        for status, count in results:
            status_counts[status] = count

        return status_counts

    def get_pile_count(self, user_id: int) -> int:
        """Get total count of pile entries for a user"""
        return self.db.query(PileEntry).filter(PileEntry.user_id == user_id).count()

    def clear_user_pile(self, user_id: int) -> int:
        """Clear all pile entries for a user and return count of deleted entries"""
        # Get count before deletion
        count = self.get_pile_count(user_id)

        # Delete all entries
        self.db.query(PileEntry).filter(PileEntry.user_id == user_id).delete()

        self.db.commit()
        return count
