"""
Secure user service with proper dependency injection.
Following FastAPI security best practices.
"""

from typing import Annotated, Optional

from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import credentials_exception, security, verify_token
from app.db.base import get_db
from app.models.user import User


class UserService:
    def get_token_from_request(
        self,
        request: Request,
        credentials: Annotated[
            Optional[HTTPAuthorizationCredentials], Depends(security)
        ] = None,
        auth_token: Annotated[Optional[str], Cookie()] = None,
    ) -> Optional[str]:
        """
        Extract authentication token from request.
        Prioritizes cookie over Authorization header for security.
        """
        # Priority 1: HttpOnly cookie (most secure)
        if auth_token:
            return auth_token

        # Priority 2: Authorization header (for API clients)
        if credentials:
            return credentials.credentials

        return None

    async def get_current_user(
        self,
        request: Request,
        db: Annotated[Session, Depends(get_db)],
        credentials: Annotated[
            Optional[HTTPAuthorizationCredentials], Depends(security)
        ] = None,
        auth_token: Annotated[Optional[str], Cookie()] = None,
    ) -> dict:
        """
        Get current authenticated user with secure token validation.
        """
        # Extract token using secure method
        token = self.get_token_from_request(request, credentials, auth_token)

        if not token:
            raise credentials_exception

        # Verify token securely
        steam_id = verify_token(token)
        if not steam_id:
            raise credentials_exception

        # Get user from database
        user = db.query(User).filter(User.steam_id == steam_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return {
            "id": user.id,
            "steam_id": user.steam_id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "shame_score": user.shame_score,
            "deletion_requested_at": (
                user.deletion_requested_at.isoformat()
                if user.deletion_requested_at
                else None
            ),
            "deletion_scheduled_at": (
                user.deletion_scheduled_at.isoformat()
                if user.deletion_scheduled_at
                else None
            ),
        }

    async def get_current_user_optional(
        self,
        request: Request,
        db: Annotated[Session, Depends(get_db)],
        credentials: Annotated[
            Optional[HTTPAuthorizationCredentials], Depends(security)
        ] = None,
        auth_token: Annotated[Optional[str], Cookie()] = None,
    ) -> Optional[dict]:
        """
        Get current user without raising exceptions (for optional auth).
        """
        try:
            return await self.get_current_user(request, db, credentials, auth_token)
        except HTTPException:
            return None

    async def get_steam_user_info(self, steam_id: str) -> dict:
        """Fetch user info from Steam Web API with proper error handling"""
        url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
        params = {"key": settings.STEAM_API_KEY, "steamids": steam_id}

        timeout = httpx.Timeout(10.0, connect=5.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("response", {}).get("players"):
                    return data["response"]["players"][0]
                return {}
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Steam API timeout",
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Steam API error: {e.response.status_code}",
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to fetch user profile from Steam",
            )

    async def get_or_create_user(self, steam_id: str, db: Session) -> User:
        """Get existing user or create new one from Steam data"""
        # Check if user already exists
        user = db.query(User).filter(User.steam_id == steam_id).first()
        if user:
            return user

        # Fetch user profile from Steam
        steam_info = await self.get_steam_user_info(steam_id)

        # Create new user with secure defaults
        user = User(
            steam_id=steam_id,
            username=steam_info.get(
                "personaname", f"User_{steam_id[-8:]}"
            ),  # Use last 8 chars for privacy
            avatar_url=steam_info.get("avatarfull"),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user
