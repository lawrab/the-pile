"""
Repository dependency injection for FastAPI.
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.repositories.pile_repository import PileRepository
from app.repositories.stats_repository import StatsRepository
from app.repositories.user_repository import UserRepository


def get_pile_repository(db: Session = Depends(get_db)) -> PileRepository:
    """Dependency injection for PileRepository"""
    return PileRepository(db)


def get_stats_repository(db: Session = Depends(get_db)) -> StatsRepository:
    """Dependency injection for StatsRepository"""
    return StatsRepository(db)


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    """Dependency injection for UserRepository"""
    return UserRepository(db)


# Repository container for services that need multiple repositories
class RepositoryContainer:
    """Container for all repositories - useful for services that need multiple repos"""

    def __init__(self, db: Session):
        self.pile = PileRepository(db)
        self.stats = StatsRepository(db)
        self.user = UserRepository(db)


def get_repository_container(db: Session = Depends(get_db)) -> RepositoryContainer:
    """Dependency injection for repository container"""
    return RepositoryContainer(db)
