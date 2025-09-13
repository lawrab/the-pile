from sqlalchemy import Column, String, Integer, DateTime, Float, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


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
    amnesty_date = Column(DateTime(timezone=True))
    amnesty_reason = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="pile_entries")
    steam_game = relationship("SteamGame", back_populates="pile_entries")