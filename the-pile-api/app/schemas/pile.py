from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.pile_entry import GameStatus


class GameBase(BaseModel):
    name: str
    steam_app_id: int
    image_url: Optional[str] = None
    genres: Optional[List[str]] = None


class PileEntryResponse(BaseModel):
    id: int
    status: GameStatus
    playtime_minutes: int
    purchase_date: Optional[datetime]
    purchase_price: Optional[float]
    amnesty_date: Optional[datetime]
    amnesty_reason: Optional[str]
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