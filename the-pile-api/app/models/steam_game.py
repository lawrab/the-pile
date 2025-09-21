from app.db.base import Base

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class SteamGame(Base):
    __tablename__ = "steam_games"

    id = Column(Integer, primary_key=True, index=True)
    steam_app_id = Column(Integer, unique=True, nullable=False, index=True)

    # Steam data that can be refreshed
    name = Column(String, nullable=False)
    description = Column(String)
    image_url = Column(String)
    price = Column(Float)  # Current price from Steam Store API
    genres = Column(JSON)  # List of genre strings
    categories = Column(JSON)  # List of category strings

    # Steam metadata
    is_free = Column(Boolean, default=False)
    release_date = Column(String)  # Steam returns this as string
    developer = Column(String)
    publisher = Column(String)
    screenshots = Column(JSON)  # List of screenshot URLs
    steam_type = Column(String)  # 'game', 'dlc', 'demo', 'advertising', 'mod', 'video'

    # Steam review/rating data
    steam_rating_percent = Column(Integer)  # 0-100 positive review percentage
    steam_review_summary = Column(String(50))  # "Very Positive", "Mixed", etc.
    steam_review_count = Column(Integer)  # Total number of reviews

    # Steam playtime data
    rtime_last_played = Column(Integer)  # Unix timestamp of when game was last played

    # Tracking
    last_updated = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    pile_entries = relationship("PileEntry", back_populates="steam_game")
