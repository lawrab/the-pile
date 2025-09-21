"""
Repository pattern implementations for The Pile project.

This package provides:
- BaseRepository: Abstract base class with common CRUD operations
- PileRepository: Domain-specific operations for pile entries
- StatsRepository: Analytics and statistics queries
- UserRepository: User management operations
- Dependency injection utilities
"""

from .base import BaseRepository
from .deps import (
    get_pile_repository,
    get_repository_container,
    get_stats_repository,
    get_user_repository,
    RepositoryContainer,
)
from .pile_repository import PileRepository
from .stats_repository import StatsRepository
from .user_repository import UserRepository

__all__ = [
    "BaseRepository",
    "PileRepository",
    "StatsRepository",
    "UserRepository",
    "get_pile_repository",
    "get_stats_repository",
    "get_user_repository",
    "get_repository_container",
    "RepositoryContainer",
]
