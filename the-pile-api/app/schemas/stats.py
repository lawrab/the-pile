from pydantic import BaseModel
from typing import Dict, List, Optional


class RealityCheck(BaseModel):
    total_games: int
    unplayed_games: int
    completion_years: float
    money_wasted: float
    most_expensive_unplayed: Dict[str, float]  # {game_name: price}
    oldest_unplayed: Dict[str, str]  # {game_name: purchase_date}


class ShameScore(BaseModel):
    score: float
    breakdown: Dict[str, float]  # {category: points}
    rank: str  # "Casual Collector", "Serial Buyer", "The Pile Master"
    message: str  # Humorous message based on score


class BehavioralInsights(BaseModel):
    buying_patterns: List[str]  # ["You buy RPGs but only play shooters"]
    genre_preferences: Dict[str, int]  # {genre: purchase_count}
    completion_rate: float  # Percentage of games actually played
    most_neglected_genre: str
    recommendations: List[str]  # Actionable suggestions