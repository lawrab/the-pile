from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List
from collections import Counter
from app.models.user import User
from app.models.steam_game import SteamGame
from app.models.pile_entry import PileEntry, GameStatus
from app.schemas.stats import RealityCheck, ShameScore, BehavioralInsights
import random


class StatsService:
    async def calculate_reality_check(self, user_id: int, db: Session) -> RealityCheck:
        """Calculate brutal reality check statistics"""
        # Get pile stats
        total_games = db.query(PileEntry).filter(PileEntry.user_id == user_id).count()
        unplayed_games = db.query(PileEntry).filter(
            PileEntry.user_id == user_id,
            PileEntry.status == GameStatus.UNPLAYED
        ).count()
        
        # Calculate money wasted on unplayed games
        unplayed_entries = db.query(PileEntry).join(SteamGame).filter(
            PileEntry.user_id == user_id,
            PileEntry.status == GameStatus.UNPLAYED
        ).all()
        
        money_wasted = sum(
            (entry.purchase_price or entry.steam_game.price or 0) 
            for entry in unplayed_entries
        )
        
        # Find most expensive unplayed game
        most_expensive = None
        max_price = 0
        for entry in unplayed_entries:
            price = entry.purchase_price or entry.steam_game.price or 0
            if price > max_price:
                max_price = price
                most_expensive = entry.steam_game.name
        
        most_expensive_unplayed = {most_expensive: max_price} if most_expensive else {}
        
        # Find oldest unplayed game
        oldest_entry = db.query(PileEntry).join(SteamGame).filter(
            PileEntry.user_id == user_id,
            PileEntry.status == GameStatus.UNPLAYED,
            PileEntry.purchase_date.isnot(None)
        ).order_by(PileEntry.purchase_date).first()
        
        oldest_unplayed = {}
        if oldest_entry:
            oldest_unplayed[oldest_entry.steam_game.name] = oldest_entry.purchase_date.strftime("%Y-%m-%d")
        
        # Calculate completion years (assuming 2 hours per week gaming)
        hours_per_week = 2
        average_game_hours = 20  # Rough estimate
        total_hours_needed = unplayed_games * average_game_hours
        completion_years = total_hours_needed / (hours_per_week * 52) if hours_per_week > 0 else float('inf')
        
        return RealityCheck(
            total_games=total_games,
            unplayed_games=unplayed_games,
            completion_years=completion_years,
            money_wasted=money_wasted,
            most_expensive_unplayed=most_expensive_unplayed,
            oldest_unplayed=oldest_unplayed
        )
    
    async def calculate_shame_score(self, user_id: int, db: Session) -> ShameScore:
        """Calculate user's shame score with breakdown"""
        reality_check = await self.calculate_reality_check(user_id, db)
        
        # Score components
        unplayed_penalty = reality_check.unplayed_games * 2  # 2 points per unplayed game
        money_penalty = reality_check.money_wasted * 0.5     # 0.5 points per dollar wasted
        time_penalty = min(reality_check.completion_years * 10, 100)  # Max 100 points for time
        
        # Bonus penalties
        pile_entries = db.query(PileEntry).filter(PileEntry.user_id == user_id).all()
        zero_playtime_games = sum(1 for entry in pile_entries if entry.playtime_minutes == 0)
        zero_playtime_penalty = zero_playtime_games * 3  # Extra penalty for never played
        
        total_score = unplayed_penalty + money_penalty + time_penalty + zero_playtime_penalty
        
        breakdown = {
            "unplayed_games": unplayed_penalty,
            "money_wasted": money_penalty,
            "time_to_complete": time_penalty,
            "never_played": zero_playtime_penalty
        }
        
        # Determine rank and message
        if total_score < 50:
            rank = "Casual Collector"
            message = "You have a reasonable relationship with your backlog"
        elif total_score < 100:
            rank = "Sale Victim"
            message = "Steam sales got the better of you"
        elif total_score < 200:
            rank = "Serial Buyer"
            message = "You collect games like Pokemon cards"
        elif total_score < 400:
            rank = "Pile Builder"
            message = "Your backlog has structural integrity"
        else:
            rank = "The Pile Master"
            message = "Your pile of shame is visible from space"
        
        # Update user's shame score
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.shame_score = total_score
            db.commit()
        
        return ShameScore(
            score=total_score,
            breakdown=breakdown,
            rank=rank,
            message=message
        )
    
    async def generate_insights(self, user_id: int, db: Session) -> BehavioralInsights:
        """Generate behavioral insights and patterns"""
        pile_entries = db.query(PileEntry).join(SteamGame).filter(PileEntry.user_id == user_id).all()
        
        if not pile_entries:
            return BehavioralInsights(
                buying_patterns=[],
                genre_preferences={},
                completion_rate=0,
                most_neglected_genre="",
                recommendations=[]
            )
        
        # Analyze genre preferences (what they buy vs what they play)
        bought_genres = []
        played_genres = []
        
        for entry in pile_entries:
            if entry.steam_game.genres:
                bought_genres.extend(entry.steam_game.genres)
                if entry.playtime_minutes > 60:  # Played for more than 1 hour
                    played_genres.extend(entry.steam_game.genres)
        
        bought_counter = Counter(bought_genres)
        played_counter = Counter(played_genres)
        
        # Calculate completion rate
        played_games = sum(1 for entry in pile_entries if entry.playtime_minutes > 0)
        completion_rate = (played_games / len(pile_entries)) * 100 if pile_entries else 0
        
        # Find most neglected genre
        neglected_genres = {}
        for genre in bought_counter:
            bought = bought_counter[genre]
            played = played_counter.get(genre, 0)
            if bought > 0:
                neglected_genres[genre] = (bought - played) / bought
        
        most_neglected_genre = max(neglected_genres.items(), key=lambda x: x[1])[0] if neglected_genres else ""
        
        # Generate buying patterns insights
        buying_patterns = []
        
        if bought_counter.get("RPG", 0) > 3 and played_counter.get("RPG", 0) < 2:
            buying_patterns.append("You buy RPGs but rarely commit to their epic length")
        
        if bought_counter.get("Action", 0) > bought_counter.get("Strategy", 0) and played_counter.get("Strategy", 0) > played_counter.get("Action", 0):
            buying_patterns.append("You buy action games but actually prefer strategy")
        
        indie_bought = sum(1 for entry in pile_entries if entry.purchase_price and entry.purchase_price < 20)
        indie_total = len(pile_entries)
        if indie_bought / indie_total > 0.7:
            buying_patterns.append("You're an indie game collector with refined taste")
        
        free_games = sum(1 for entry in pile_entries if not entry.purchase_price or entry.purchase_price == 0)
        if free_games > 10:
            buying_patterns.append("You never miss a free game, do you?")
        
        # Generate recommendations
        recommendations = []
        
        if completion_rate < 20:
            recommendations.append("Try finishing one game before buying three more")
        
        if most_neglected_genre:
            recommendations.append(f"Stop buying {most_neglected_genre} games until you play the ones you have")
        
        if len(pile_entries) > 50:
            recommendations.append("Consider the Pile amnesty program for games you'll never play")
        
        unplayed_value = sum((entry.purchase_price or entry.steam_game.price or 0) for entry in pile_entries if entry.playtime_minutes == 0)
        if unplayed_value > 100:
            recommendations.append(f"You have ${unplayed_value:.0f} worth of unplayed games. That's a nice vacation!")
        
        return BehavioralInsights(
            buying_patterns=buying_patterns,
            genre_preferences=dict(bought_counter.most_common(5)),
            completion_rate=completion_rate,
            most_neglected_genre=most_neglected_genre,
            recommendations=recommendations
        )