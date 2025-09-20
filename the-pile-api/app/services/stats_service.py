from sqlalchemy.orm import Session

from app.schemas.stats import BehavioralInsights, RealityCheck, ShameScore
from app.services.cache_service import cache_result


class StatsService:
    @cache_result(expiration=1800, key_prefix="reality_check")  # 30 minutes
    async def calculate_reality_check(self, user_id: int, db: Session) -> RealityCheck:
        """Calculate brutal reality check statistics using repository pattern"""
        from app.repositories.stats_repository import StatsRepository

        stats_repo = StatsRepository(db)
        reality_data = stats_repo.get_reality_check_data(user_id)

        # Calculate money wasted
        money_wasted = sum(
            (entry.purchase_price or entry.steam_game.price or 0)
            for entry in reality_data["unplayed_entries"]
        )

        # Find most expensive unplayed game
        most_expensive = None
        max_price = 0
        for entry in reality_data["unplayed_entries"]:
            # Handle None values explicitly
            purchase_price = (
                entry.purchase_price if entry.purchase_price is not None else 0
            )
            steam_price = (
                entry.steam_game.price if entry.steam_game.price is not None else 0
            )
            price = purchase_price or steam_price

            if price > max_price:
                max_price = price
                most_expensive = entry.steam_game.name

        most_expensive_unplayed = {most_expensive: max_price} if most_expensive else {}

        # Format oldest unplayed
        oldest_unplayed = {}
        if reality_data["oldest_entry"]:
            oldest_entry = reality_data["oldest_entry"]
            oldest_unplayed[oldest_entry.steam_game.name] = (
                oldest_entry.purchase_date.strftime("%Y-%m-%d")
            )

        # Calculate completion years (assuming 2 hours per week gaming)
        hours_per_week = 2
        average_game_hours = 20  # Rough estimate
        total_hours_needed = reality_data["unplayed_games"] * average_game_hours
        completion_years = (
            total_hours_needed / (hours_per_week * 52)
            if hours_per_week > 0
            else float("inf")
        )

        return RealityCheck(
            total_games=reality_data["total_games"],
            unplayed_games=reality_data["unplayed_games"],
            completion_years=completion_years,
            money_wasted=money_wasted,
            most_expensive_unplayed=most_expensive_unplayed,
            oldest_unplayed=oldest_unplayed,
        )

    async def calculate_shame_score(self, user_id: int, db: Session) -> ShameScore:
        """Calculate user's shame score with breakdown using repository pattern"""
        from app.repositories.stats_repository import StatsRepository
        from app.repositories.user_repository import UserRepository
        from app.schemas.stats import RealityCheck

        stats_repo = StatsRepository(db)
        user_repo = UserRepository(db)

        reality_check_result = await self.calculate_reality_check(user_id, db)

        # Handle cached result that might be a dict instead of RealityCheck object
        if isinstance(reality_check_result, dict):
            reality_check = RealityCheck(**reality_check_result)
        else:
            reality_check = reality_check_result

        shame_data = stats_repo.get_shame_score_data(user_id)

        # Score components
        unplayed_penalty = (
            reality_check.unplayed_games * 2
        )  # 2 points per unplayed game
        money_penalty = reality_check.money_wasted * 0.5  # 0.5 points per dollar wasted
        time_penalty = min(
            reality_check.completion_years * 10, 100
        )  # Max 100 points for time
        zero_playtime_penalty = (
            shame_data["zero_playtime_count"] * 3
        )  # Extra penalty for never played

        total_score = (
            unplayed_penalty + money_penalty + time_penalty + zero_playtime_penalty
        )

        breakdown = {
            "unplayed_games": unplayed_penalty,
            "money_wasted": money_penalty,
            "time_to_complete": time_penalty,
            "never_played": zero_playtime_penalty,
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

        # Update user's shame score using repository
        user_repo.update_shame_score(user_id, total_score)

        return ShameScore(
            score=total_score, breakdown=breakdown, rank=rank, message=message
        )

    @cache_result(expiration=3600, key_prefix="behavioral_insights")  # 1 hour
    async def generate_insights(self, user_id: int, db: Session) -> BehavioralInsights:
        """Generate behavioral insights and patterns using repository pattern"""
        from app.repositories.stats_repository import StatsRepository

        stats_repo = StatsRepository(db)

        # Get comprehensive analysis data
        genre_analysis = stats_repo.get_genre_analysis(user_id)
        completion_stats = stats_repo.get_completion_stats(user_id)
        financial_analysis = stats_repo.get_financial_analysis(user_id)

        if completion_stats["total_games"] == 0:
            return BehavioralInsights(
                buying_patterns=[],
                genre_preferences={},
                completion_rate=0,
                most_neglected_genre="",
                recommendations=[],
            )

        # Generate buying patterns insights
        buying_patterns = []

        bought_counter = genre_analysis["bought_genres"]
        played_counter = genre_analysis["played_genres"]

        if bought_counter.get("RPG", 0) > 3 and played_counter.get("RPG", 0) < 2:
            buying_patterns.append(
                "You buy RPGs but rarely commit to their epic length"
            )

        if bought_counter.get("Action", 0) > bought_counter.get(
            "Strategy", 0
        ) and played_counter.get("Strategy", 0) > played_counter.get("Action", 0):
            buying_patterns.append("You buy action games but actually prefer strategy")

        if completion_stats["indie_ratio"] > 0.7:
            buying_patterns.append("You're an indie game collector with refined taste")

        if completion_stats["free_games"] > 10:
            buying_patterns.append("You never miss a free game, do you?")

        # Generate recommendations
        recommendations = []

        if completion_stats["completion_rate"] < 20:
            recommendations.append("Try finishing one game before buying three more")

        if genre_analysis["most_neglected_genre"]:
            recommendations.append(
                f"Stop buying {genre_analysis['most_neglected_genre']} games "
                "until you play the ones you have"
            )

        if completion_stats["total_games"] > 50:
            recommendations.append(
                "Consider the Pile amnesty program for games you'll never play"
            )

        if financial_analysis["unplayed_value"] > 100:
            unplayed_value = financial_analysis['unplayed_value']
            recommendations.append(
                f"You have ${unplayed_value:.0f} worth of unplayed games. "
                "That's a nice vacation!"
            )

        return BehavioralInsights(
            buying_patterns=buying_patterns,
            genre_preferences=genre_analysis["genre_preferences"],
            completion_rate=completion_stats["completion_rate"],
            most_neglected_genre=genre_analysis["most_neglected_genre"],
            recommendations=recommendations,
        )
