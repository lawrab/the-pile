"""
Rate limiting middleware for FastAPI using slowapi.
"""

from slowapi import _rate_limit_exceeded_handler, Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

# Create a limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute", "1000 per hour"],
    storage_uri="memory://",  # Use Redis in production: redis://localhost:6379
    headers_enabled=True,  # Enable X-RateLimit headers
)

# Export for use in main.py
__all__ = [
    "limiter",
    "RateLimitExceeded",
    "_rate_limit_exceeded_handler",
    "SlowAPIMiddleware",
]
