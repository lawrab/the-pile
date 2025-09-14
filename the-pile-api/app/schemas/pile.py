from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.pile_entry import GameStatus


class GameBase(BaseModel):
    name: str
    steam_app_id: int
    image_url: Optional[str] = None
    price: Optional[float] = None
    genres: Optional[List[str]] = None
    description: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    release_date: Optional[str] = None
    tags: Optional[List[str]] = None
    screenshots: Optional[List[str]] = None
    achievements_total: Optional[int] = None
    metacritic_score: Optional[int] = None
    positive_reviews: Optional[int] = None
    negative_reviews: Optional[int] = None
    steam_rating_percent: Optional[int] = None
    steam_review_summary: Optional[str] = None
    steam_review_count: Optional[int] = None
    steam_type: Optional[str] = None
    categories: Optional[List[str]] = None
    
    class Config:
        from_attributes = True


class PileEntryResponse(BaseModel):
    id: int
    status: GameStatus
    playtime_minutes: int
    purchase_date: Optional[datetime]
    purchase_price: Optional[float]
    completion_date: Optional[datetime]
    abandon_date: Optional[datetime]
    abandon_reason: Optional[str]
    amnesty_date: Optional[datetime]
    amnesty_reason: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    steam_game: GameBase
    
    class Config:
        from_attributes = True


class PileFilters(BaseModel):
    status: Optional[str] = None
    genre: Optional[str] = None
    limit: int = 100
    offset: int = 0


class AmnestyRequest(BaseModel):
    reason: str