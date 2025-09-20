"""
Shared test configuration and fixtures for The Pile API tests.
"""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base, get_db
from app.main import app
from app.models.pile_entry import GameStatus, PileEntry
from app.models.steam_game import SteamGame
from app.models.user import User

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_the_pile.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def override_get_db(db_session):
    """Override the get_db dependency to use test database."""

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client(override_get_db) -> Generator[TestClient, None, None]:
    """Create a test client for FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
async def async_client(override_get_db) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for FastAPI app."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


# Test data fixtures
@pytest.fixture
def sample_user(db_session) -> User:
    """Create a sample user for testing."""
    user = User(
        steam_id="76561197960435530",
        username="testuser",
        avatar_url="https://example.com/avatar.jpg",
        shame_score=150.0,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_steam_game(db_session) -> SteamGame:
    """Create a sample Steam game for testing."""
    game = SteamGame(
        steam_app_id=400,
        name="Portal",
        description="A puzzle-platform game",
        image_url="https://example.com/portal.jpg",
        price=9.99,
        genres=["Puzzle", "Platformer"],
        categories=["Single-player"],
        is_free=False,
        release_date="2007-10-09",
        developer="Valve Corporation",
        publisher="Valve Corporation",
        screenshots=[
            "https://example.com/screenshot1.jpg",
            "https://example.com/screenshot2.jpg",
        ],
    )
    db_session.add(game)
    db_session.commit()
    db_session.refresh(game)
    return game


@pytest.fixture
def sample_pile_entry(db_session, sample_user, sample_steam_game) -> PileEntry:
    """Create a sample pile entry for testing."""
    entry = PileEntry(
        user_id=sample_user.id,
        steam_game_id=sample_steam_game.id,
        status=GameStatus.UNPLAYED,
        playtime_minutes=0,
        purchase_price=9.99,
    )
    db_session.add(entry)
    db_session.commit()
    db_session.refresh(entry)
    return entry


# Mock data fixtures
@pytest.fixture
def mock_steam_owned_games():
    """Mock Steam API owned games response."""
    return {
        "response": {
            "games": [
                {
                    "appid": 400,
                    "name": "Portal",
                    "playtime_forever": 120,
                    "img_icon_url": "example_icon",
                    "img_logo_url": "example_logo",
                },
                {
                    "appid": 420,
                    "name": "Portal 2",
                    "playtime_forever": 0,
                    "img_icon_url": "example_icon2",
                    "img_logo_url": "example_logo2",
                },
            ]
        }
    }


@pytest.fixture
def mock_steam_app_details():
    """Mock Steam Store API app details response."""
    return {
        "400": {
            "success": True,
            "data": {
                "name": "Portal",
                "short_description": (
                    "A puzzle-platform game that combines puzzles with action"
                ),
                "developers": ["Valve Corporation"],
                "publishers": ["Valve Corporation"],
                "price_overview": {"initial": 999, "final": 999, "currency": "USD"},
                "genres": [
                    {"id": "1", "description": "Action"},
                    {"id": "2", "description": "Puzzle"},
                ],
                "categories": [{"id": "2", "description": "Single-player"}],
                "screenshots": [
                    {"path_full": "https://example.com/screenshot1.jpg"},
                    {"path_full": "https://example.com/screenshot2.jpg"},
                ],
                "release_date": {"date": "Oct 9, 2007"},
            },
        }
    }


# Auth fixtures
@pytest.fixture
def auth_headers(sample_user):
    """Create auth headers for authenticated requests."""
    # In a real implementation, you'd generate a proper JWT token
    # For testing, we'll use a mock token
    return {"Authorization": f"Bearer mock_token_user_{sample_user.id}"}


@pytest.fixture
def mock_jwt_decode(monkeypatch, sample_user):
    """Mock JWT token decoding for authentication tests."""

    def mock_verify_token(token):
        # Mock the verify_token function to return the sample user's steam_id
        return str(sample_user.steam_id)

    # Mock the verify_token function used in user_service
    monkeypatch.setattr("app.services.user_service.verify_token", mock_verify_token)
