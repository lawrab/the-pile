from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, validator

from app.models.pile_entry import GameStatus
from app.services.validation_service import InputValidationService


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
    sort_by: Optional[str] = Field(default="playtime", description="Field to sort by")
    sort_direction: Optional[str] = Field(
        default="asc", description="Sort direction (asc/desc)"
    )
    limit: int = Field(
        default=100, ge=1, le=1000, description="Number of results to return"
    )
    offset: int = Field(default=0, ge=0, description="Number of results to skip")

    @validator("sort_by")
    def validate_sort_field(cls, v):
        if v is None:
            return "playtime"
        allowed_fields = ["playtime", "rating", "purchase_date", "name", "release_date"]
        return InputValidationService.validate_sort_field(v, allowed_fields)

    @validator("sort_direction")
    def validate_sort_direction(cls, v):
        if v is None:
            return "asc"
        return InputValidationService.validate_sort_order(v)

    @validator("status")
    def validate_status(cls, v):
        if v is None:
            return None
        allowed_statuses = [
            "unplayed",
            "playing",
            "completed",
            "abandoned",
            "amnesty_granted",
        ]
        if v not in allowed_statuses:
            raise ValueError(
                f"Invalid status. Allowed values: {', '.join(allowed_statuses)}"
            )
        return v

    @validator("genre")
    def validate_genre(cls, v):
        if v is None:
            return None
        return InputValidationService.sanitize_text_input(v, max_length=100)


class AmnestyRequest(BaseModel):
    reason: str = Field(description="Reason for granting amnesty", max_length=500)

    @validator("reason")
    def validate_reason(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Amnesty reason cannot be empty")
        return InputValidationService.validate_amnesty_reason(v)
