import enum
from datetime import datetime, timedelta, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class GameStatus(str, enum.Enum):
    UNPLAYED = "unplayed"
    PLAYING = "playing"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    AMNESTY_GRANTED = "amnesty_granted"


class PileEntry(Base):
    __tablename__ = "pile_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    steam_game_id = Column(Integer, ForeignKey("steam_games.id"), nullable=False)

    status = Column(Enum(GameStatus), default=GameStatus.UNPLAYED)
    playtime_minutes = Column(Integer, default=0)
    purchase_date = Column(DateTime(timezone=True))
    purchase_price = Column(Float)  # What they actually paid
    completion_date = Column(DateTime(timezone=True))
    abandon_date = Column(DateTime(timezone=True))
    abandon_reason = Column(String)
    amnesty_date = Column(DateTime(timezone=True))
    amnesty_reason = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="pile_entries")
    steam_game = relationship("SteamGame", back_populates="pile_entries")

    @hybrid_property
    def effective_status(self):
        """
        Compute the effective status with automatic abandoned detection.
        This is the domain logic that determines the true status of a game.
        """
        # Completed, amnesty granted, and manually abandoned games keep their status
        if self.status in [GameStatus.COMPLETED, GameStatus.AMNESTY_GRANTED]:
            return self.status

        # If manually marked as abandoned, respect that
        if (
            self.status == GameStatus.ABANDONED
            and self.abandon_reason
            and not self.abandon_reason.startswith("Automatically detected")
        ):
            return self.status

        # Apply automatic abandoned detection for unplayed and playing games
        if self.status in [
            GameStatus.UNPLAYED,
            GameStatus.PLAYING,
            GameStatus.ABANDONED,
        ]:
            current_time = datetime.now(timezone.utc)
            three_months_ago = current_time - timedelta(days=90)

            # Determine the most recent activity date
            activity_date = None

            # Prefer Steam's last played time if available and recent
            if (
                hasattr(self, "steam_game")
                and self.steam_game
                and hasattr(self.steam_game, "rtime_last_played")
                and self.steam_game.rtime_last_played
            ):
                try:
                    if isinstance(self.steam_game.rtime_last_played, int):
                        activity_date = datetime.fromtimestamp(
                            self.steam_game.rtime_last_played, tz=timezone.utc
                        )
                    elif isinstance(self.steam_game.rtime_last_played, datetime):
                        activity_date = self.steam_game.rtime_last_played
                        if activity_date.tzinfo is None:
                            activity_date = activity_date.replace(tzinfo=timezone.utc)
                except (ValueError, TypeError, OSError):
                    activity_date = None

            # Fallback to database timestamps
            if not activity_date:
                activity_date = self.updated_at or self.created_at
                if activity_date and activity_date.tzinfo is None:
                    activity_date = activity_date.replace(tzinfo=timezone.utc)

            # If still no activity date, assume very old
            if not activity_date:
                activity_date = three_months_ago - timedelta(days=365)

            # Apply abandonment criteria
            # 1. Unplayed games older than 3 months
            if (
                self.status == GameStatus.UNPLAYED
                and self.playtime_minutes == 0
                and activity_date < three_months_ago
            ):
                return GameStatus.ABANDONED

            # 2. Games with playtime but no activity in 3+ months
            if self.playtime_minutes > 0 and activity_date < three_months_ago:
                return GameStatus.ABANDONED

        # Return stored status if no abandonment criteria met
        return self.status
