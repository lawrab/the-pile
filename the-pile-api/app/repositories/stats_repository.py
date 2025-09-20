"""
Repository for statistics and analytics queries.
"""
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, desc
from collections import Counter
from app.repositories.base import BaseRepository
from app.models.pile_entry import PileEntry, GameStatus
from app.models.steam_game import SteamGame
from app.models.user import User


class StatsRepository(BaseRepository[PileEntry]):
    """Repository for statistics and analytics operations"""
    
    def __init__(self, db: Session):
        super().__init__(PileEntry, db)
    
    def get_by_user_id(self, user_id: int) -> List[PileEntry]:
        """Get all entries for stats analysis with eager loading"""
        return self.db.query(PileEntry).options(
            joinedload(PileEntry.steam_game)
        ).filter(PileEntry.user_id == user_id).all()
    
    def get_reality_check_data(self, user_id: int) -> Dict[str, Any]:
        """Get all data needed for reality check calculations"""
        # Count queries for basic stats
        total_games = self.db.query(PileEntry).filter(PileEntry.user_id == user_id).count()
        unplayed_games = self.db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.status == GameStatus.UNPLAYED
        ).count()
        
        # Get unplayed entries with game data
        unplayed_entries = self.db.query(PileEntry).options(
            joinedload(PileEntry.steam_game)
        ).filter(
            PileEntry.user_id == user_id,
            PileEntry.status == GameStatus.UNPLAYED
        ).all()
        
        # Find oldest unplayed game
        oldest_entry = self.db.query(PileEntry).options(
            joinedload(PileEntry.steam_game)
        ).filter(
            PileEntry.user_id == user_id,
            PileEntry.status == GameStatus.UNPLAYED,
            PileEntry.purchase_date.isnot(None)
        ).order_by(PileEntry.purchase_date).first()
        
        return {
            "total_games": total_games,
            "unplayed_games": unplayed_games,
            "unplayed_entries": unplayed_entries,
            "oldest_entry": oldest_entry
        }
    
    def get_shame_score_data(self, user_id: int) -> Dict[str, Any]:
        """Get data needed for shame score calculation"""
        # Get zero playtime count efficiently
        zero_playtime_count = self.db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.playtime_minutes == 0
        ).count()
        
        return {
            "zero_playtime_count": zero_playtime_count
        }
    
    def get_genre_analysis(self, user_id: int) -> Dict[str, Any]:
        """Analyze genre preferences - what they buy vs what they play"""
        pile_entries = self.get_by_user_id(user_id)
        
        bought_genres = []
        played_genres = []
        
        for entry in pile_entries:
            if entry.steam_game.genres:
                bought_genres.extend(entry.steam_game.genres)
                if entry.playtime_minutes > 60:  # Played for more than 1 hour
                    played_genres.extend(entry.steam_game.genres)
        
        bought_counter = Counter(bought_genres)
        played_counter = Counter(played_genres)
        
        # Calculate neglected genres
        neglected_genres = {}
        for genre in bought_counter:
            bought = bought_counter[genre]
            played = played_counter.get(genre, 0)
            if bought > 0:
                neglected_genres[genre] = (bought - played) / bought
        
        most_neglected_genre = max(neglected_genres.items(), key=lambda x: x[1])[0] if neglected_genres else ""
        
        return {
            "bought_genres": dict(bought_counter),
            "played_genres": dict(played_counter),
            "neglected_genres": neglected_genres,
            "most_neglected_genre": most_neglected_genre,
            "genre_preferences": dict(bought_counter.most_common(5))
        }
    
    def get_completion_stats(self, user_id: int) -> Dict[str, Any]:
        """Get completion and engagement statistics"""
        pile_entries = self.get_by_user_id(user_id)
        
        if not pile_entries:
            return {
                "completion_rate": 0,
                "played_games": 0,
                "total_games": 0,
                "indie_ratio": 0,
                "free_games": 0
            }
        
        played_games = sum(1 for entry in pile_entries if entry.playtime_minutes > 0)
        completion_rate = (played_games / len(pile_entries)) * 100
        
        # Analyze purchase patterns
        indie_bought = sum(1 for entry in pile_entries if entry.purchase_price and entry.purchase_price < 20)
        indie_ratio = indie_bought / len(pile_entries)
        
        free_games = sum(1 for entry in pile_entries if not entry.purchase_price or entry.purchase_price == 0)
        
        return {
            "completion_rate": completion_rate,
            "played_games": played_games,
            "total_games": len(pile_entries),
            "indie_ratio": indie_ratio,
            "free_games": free_games
        }
    
    def get_financial_analysis(self, user_id: int) -> Dict[str, float]:
        """Analyze financial aspects of the pile"""
        pile_entries = self.get_by_user_id(user_id)
        
        total_spent = sum((entry.purchase_price or entry.steam_game.price or 0) for entry in pile_entries)
        unplayed_value = sum(
            (entry.purchase_price or entry.steam_game.price or 0) 
            for entry in pile_entries 
            if entry.playtime_minutes == 0
        )
        
        # Find most expensive unplayed
        most_expensive_unplayed = {"game": None, "price": 0}
        for entry in pile_entries:
            if entry.playtime_minutes == 0:
                # Handle None values explicitly
                purchase_price = entry.purchase_price if entry.purchase_price is not None else 0
                steam_price = entry.steam_game.price if entry.steam_game.price is not None else 0
                price = purchase_price or steam_price
                
                if price > most_expensive_unplayed["price"]:
                    most_expensive_unplayed = {
                        "game": entry.steam_game.name,
                        "price": price
                    }
        
        return {
            "total_spent": total_spent,
            "unplayed_value": unplayed_value,
            "money_wasted_percentage": (unplayed_value / total_spent * 100) if total_spent else 0,
            "most_expensive_unplayed": most_expensive_unplayed
        }
    
    def get_temporal_analysis(self, user_id: int) -> Dict[str, Any]:
        """Analyze temporal patterns in the pile"""
        pile_entries = self.db.query(PileEntry).options(
            joinedload(PileEntry.steam_game)
        ).filter(
            PileEntry.user_id == user_id,
            PileEntry.purchase_date.isnot(None)
        ).order_by(PileEntry.purchase_date).all()
        
        if not pile_entries:
            return {"oldest_game": None, "purchase_timeline": []}
        
        # Group by month/year for timeline
        purchase_timeline = {}
        for entry in pile_entries:
            month_key = entry.purchase_date.strftime("%Y-%m")
            if month_key not in purchase_timeline:
                purchase_timeline[month_key] = {"count": 0, "total_value": 0}
            
            purchase_timeline[month_key]["count"] += 1
            purchase_timeline[month_key]["total_value"] += entry.purchase_price or entry.steam_game.price or 0
        
        return {
            "oldest_game": {
                "name": pile_entries[0].steam_game.name,
                "purchase_date": pile_entries[0].purchase_date.strftime("%Y-%m-%d")
            },
            "purchase_timeline": purchase_timeline,
            "total_games_with_dates": len(pile_entries)
        }
    
    def get_top_games_by_criteria(self, user_id: int, criteria: str = "playtime", limit: int = 10) -> List[Dict[str, Any]]:
        """Get top games by various criteria"""
        query = self.db.query(PileEntry).options(
            joinedload(PileEntry.steam_game)
        ).filter(PileEntry.user_id == user_id)
        
        if criteria == "playtime":
            query = query.order_by(desc(PileEntry.playtime_minutes))
        elif criteria == "price":
            query = query.order_by(desc(PileEntry.purchase_price))
        elif criteria == "rating":
            query = query.join(SteamGame).order_by(desc(SteamGame.steam_rating_percent))
        
        entries = query.limit(limit).all()
        
        return [
            {
                "name": entry.steam_game.name,
                "playtime_minutes": entry.playtime_minutes,
                "purchase_price": entry.purchase_price,
                "steam_rating": entry.steam_game.steam_rating_percent,
                "status": entry.status.value
            }
            for entry in entries
        ]