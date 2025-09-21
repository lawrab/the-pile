from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class PileSnapshot(Base):
    __tablename__ = "pile_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Snapshot metrics
    total_games = Column(Integer, nullable=False)
    unplayed_games = Column(Integer, nullable=False)
    total_value = Column(Float, nullable=False)  # Total money spent
    unplayed_value = Column(Float, nullable=False)  # Money wasted
    shame_score = Column(Float, nullable=False)
    completion_years = Column(Float)  # Years to complete at current rate

    # Genre/tag breakdown
    genre_breakdown = Column(JSON)  # {genre: count}
    buying_patterns = Column(JSON)  # Analysis of purchase behavior

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="pile_snapshots")
