import random
from typing import Optional
<<<<<<< HEAD
import uuid

from sqlalchemy.orm import Session
||||||| parent of 9e6a2d5 (Improve code quality: fix import order and configure isort)

from sqlalchemy.orm import Session
=======
import uuid
>>>>>>> 9e6a2d5 (Improve code quality: fix import order and configure isort)

from app.models.user import User
from app.schemas.share import ShareableStats, ShareResponse
from app.services.stats_service import StatsService

from sqlalchemy.orm import Session


class ShareService:
    def __init__(self):
        self.stats_service = StatsService()

    async def create_shareable_stats(self, user_id: int, db: Session) -> ShareResponse:
        """Create shareable statistics with image"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Get stats
        reality_check = await self.stats_service.calculate_reality_check(user_id, db)
        shame_score = await self.stats_service.calculate_shame_score(user_id, db)

        # Generate a fun fact
        fun_facts = [
            f"Could buy {reality_check.money_wasted / 5:.0f} coffees with money "
            "spent on unplayed games",
            f"Has enough unplayed games to last until the year "
            f"{2024 + int(reality_check.completion_years)}",
            f"Shame score of {shame_score.score:.0f} puts them in the "
            f"'{shame_score.rank}' category",
            f"Only {reality_check.unplayed_games} games standing between them "
            "and victory",
            "Professional game collector, amateur game player",
            "Supports developers by buying games they'll never play",
        ]

        fun_fact = random.choice(fun_facts)

        share_id = str(uuid.uuid4())

        stats = ShareableStats(
            username=user.username,
            shame_score=shame_score.score,
            total_games=reality_check.total_games,
            unplayed_games=reality_check.unplayed_games,
            money_wasted=reality_check.money_wasted,
            completion_years=reality_check.completion_years,
            fun_fact=fun_fact,
        )

        # In a real implementation, you'd generate an image here
        # For now, we'll just return a placeholder URL
        image_url = f"https://api.example.com/share-images/{share_id}.png"

        # Store the shareable stats (in a real implementation, you'd save to database)
        # For now, we'll just return the response

        return ShareResponse(share_id=share_id, image_url=image_url, text_stats=stats)

    async def get_shared_stats(
        self, share_id: str, db: Session
    ) -> Optional[ShareableStats]:
        """Get shared statistics by ID"""
        # In a real implementation, you'd fetch from database
        # For now, return None to indicate not found
        return None
