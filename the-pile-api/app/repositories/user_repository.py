"""
Repository for user-related database operations.
"""

from typing import List, Optional

from app.models.user import User
from app.repositories.base import BaseRepository

from sqlalchemy.orm import Session


class UserRepository(BaseRepository[User]):
    """Repository for user operations"""

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_user_id(self, user_id: int) -> List[User]:
        """Get user by ID (implements abstract method)"""
        user = self.get_by_id(user_id)
        return [user] if user else []

    def get_by_steam_id(self, steam_id: str) -> Optional[User]:
        """Get user by Steam ID"""
        return self.db.query(User).filter(User.steam_id == steam_id).first()

    def update_shame_score(self, user_id: int, shame_score: float) -> Optional[User]:
        """Update user's shame score"""
        user = self.get_by_id(user_id)
        if user:
            user.shame_score = shame_score
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_last_sync(self, user_id: int, sync_time) -> Optional[User]:
        """Update user's last sync time"""
        user = self.get_by_id(user_id)
        if user:
            user.last_sync_at = sync_time
            self.db.commit()
            self.db.refresh(user)
        return user
