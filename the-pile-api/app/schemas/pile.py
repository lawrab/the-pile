from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

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
    rtime_last_played: Optional[int] = (
        None  # Unix timestamp of when game was last played
    )

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

    @classmethod
    def from_pile_entry(cls, pile_entry):
        """Custom factory method to ensure effective_status is used"""
        return cls(
            id=pile_entry.id,
            status=pile_entry.effective_status,  # Use computed effective status
            playtime_minutes=pile_entry.playtime_minutes,
            purchase_date=pile_entry.purchase_date,
            purchase_price=pile_entry.purchase_price,
            completion_date=pile_entry.completion_date,
            abandon_date=pile_entry.abandon_date,
            abandon_reason=pile_entry.abandon_reason,
            amnesty_date=pile_entry.amnesty_date,
            amnesty_reason=pile_entry.amnesty_reason,
            created_at=pile_entry.created_at,
            updated_at=pile_entry.updated_at,
            steam_game=GameBase.model_validate(pile_entry.steam_game),
        )

    class Config:
        from_attributes = True


class PileFilters(BaseModel):
    status: Optional[str] = None
    genre: Optional[str] = None
    sort_by: Optional[str] = None  # playtime, rating
    sort_direction: Optional[str] = "desc"  # asc, desc
    limit: int = 100
    offset: int = 0


class AmnestyRequest(BaseModel):
    reason: str
