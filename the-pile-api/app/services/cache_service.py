"""
Redis caching service with decorators and utilities.
"""
import json
import hashlib
from typing import Any, Optional, Callable
from functools import wraps
import redis
from app.core.config import settings

# Initialize Redis client
try:
    redis_client = redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True,
        health_check_interval=30
    )
    # Test connection
    redis_client.ping()
    REDIS_AVAILABLE = True
except Exception as e:
    print(f"Redis connection failed: {e}. Caching disabled.")
    redis_client = None
    REDIS_AVAILABLE = False


class CacheService:
    """Redis caching service with key management"""
    
    def __init__(self):
        self.client = redis_client
        self.available = REDIS_AVAILABLE
    
    def _serialize_value(self, value: Any) -> str:
        """Serialize value for Redis storage"""
        return json.dumps(value, default=str)
    
    def _deserialize_value(self, value: str) -> Any:
        """Deserialize value from Redis"""
        return json.loads(value)
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key from function args"""
        # Create a hash of arguments for consistent keys
        key_data = f"{prefix}:{args}:{sorted(kwargs.items())}"
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"pile_cache:{prefix}:{key_hash}"
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.available:
            return None
        
        try:
            value = self.client.get(key)
            return self._deserialize_value(value) if value else None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def set(self, key: str, value: Any, expiration: int = 3600) -> bool:
        """Set value in cache with expiration"""
        if not self.available:
            return False
        
        try:
            serialized = self._serialize_value(value)
            return self.client.setex(key, expiration, serialized)
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.available:
            return False
        
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    def invalidate_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.available:
            return 0
        
        try:
            keys = self.client.keys(f"pile_cache:{pattern}*")
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            print(f"Cache invalidate error: {e}")
            return 0


# Global cache service instance
cache_service = CacheService()


def cache_result(expiration: int = 3600, key_prefix: str = None):
    """
    Decorator to cache function results in Redis
    
    Args:
        expiration: Cache expiration in seconds (default 1 hour)
        key_prefix: Custom prefix for cache key (defaults to function name)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not cache_service.available:
                return await func(*args, **kwargs)
            
            # Generate cache key
            prefix = key_prefix or func.__name__
            cache_key = cache_service._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            cache_service.set(cache_key, result, expiration)
            return result
        
        return wrapper
    return decorator


def invalidate_cache_pattern(pattern: str):
    """Helper function to invalidate cache by pattern"""
    return cache_service.invalidate_pattern(pattern)