"""
Secure authentication and authorization utilities.
Following FastAPI security best practices.
"""

from datetime import datetime, timedelta, timezone
import secrets
from typing import Optional

from fastapi import HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    steam_id: Optional[str] = None


# Password hashing context (for future use if we add local accounts)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security schemes
security = HTTPBearer(auto_error=False)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a secure JWT access token with proper claims.
    """
    to_encode = data.copy()

    # Set expiration
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Add standard JWT claims
    to_encode.update(
        {
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access",
            "aud": "thepile:api",
            "iss": "thepile:auth",
        }
    )

    # Create JWT token
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[str]:
    """
    Verify and decode JWT token, return steam_id if valid.
    Uses secure comparison and proper error handling.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            audience="thepile:api",
            issuer="thepile:auth",
        )

        # Extract steam_id from token
        steam_id: str = payload.get("sub")
        if not steam_id:
            return None

        # Verify token type
        token_type = payload.get("type")
        if token_type != "access":
            return None

        return steam_id

    except JWTError:
        return None


def verify_credentials_securely(provided: str, correct: str) -> bool:
    """
    Securely compare credentials to prevent timing attacks.
    """
    return secrets.compare_digest(provided.encode("utf-8"), correct.encode("utf-8"))


def create_session_token() -> str:
    """
    Create a cryptographically secure session token.
    """
    return secrets.token_urlsafe(32)


def hash_password(password: str) -> str:
    """
    Hash a password securely.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


# Exception for authentication failures
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def create_secure_cookie_params(secure: bool = None) -> dict:
    """
    Create secure cookie parameters following best practices.
    """
    if secure is None:
        secure = settings.ENVIRONMENT == "production"

    return {
        "httponly": True,  # Prevent XSS
        "secure": secure,  # HTTPS only in production
        "samesite": "lax",  # CSRF protection
        "max_age": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "path": "/",
    }
