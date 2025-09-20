from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: Optional[str] = "redis://localhost:6379"
    STEAM_API_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    ENVIRONMENT: str = "development"
    BASE_URL: str = "http://localhost:8000"
    IMPORT_RATE_LIMIT_HOURS: int = 0  # 0 = disabled, any positive value = hours between imports
    ENABLE_REDIS_CACHE: bool = False  # Enable Redis caching for performance

    class Config:
        env_file = ".env"


settings = Settings()
