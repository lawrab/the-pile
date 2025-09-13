from pydantic import BaseModel
from typing import Dict


class ShareableStats(BaseModel):
    username: str
    shame_score: float
    total_games: int
    unplayed_games: int
    money_wasted: float
    completion_years: float
    fun_fact: str  # Generated humorous observation


class ShareResponse(BaseModel):
    share_id: str
    image_url: str  # URL to generated image
    text_stats: ShareableStats