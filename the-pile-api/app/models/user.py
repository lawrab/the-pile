from app.db.base import Base

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    steam_id = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    avatar_url = Column(String)
    shame_score = Column(Float, default=0.0)
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_sync_at = Column(DateTime(timezone=True))
    deletion_requested_at = Column(DateTime(timezone=True), nullable=True)
    deletion_scheduled_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    pile_entries = relationship("PileEntry", back_populates="user")
    pile_snapshots = relationship("PileSnapshot", back_populates="user")
