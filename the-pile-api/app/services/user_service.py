import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_token
from app.core.config import settings
from app.db.base import get_db
from typing import Optional

security = HTTPBearer()


class UserService:
    async def get_steam_user_info(self, steam_id: str) -> dict:
        """Fetch user info from Steam Web API"""
        url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
        params = {
            "key": settings.STEAM_API_KEY,
            "steamids": steam_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            
            if data.get("response", {}).get("players"):
                return data["response"]["players"][0]
            return {}
    
    async def get_or_create_user(self, steam_id: str, db: Session) -> User:
        """Get existing user or create new one with Steam data"""
        user = db.query(User).filter(User.steam_id == steam_id).first()
        
        if not user:
            # Fetch user info from Steam
            steam_info = await self.get_steam_user_info(steam_id)
            
            user = User(
                steam_id=steam_id,
                username=steam_info.get("personaname", "Unknown"),
                avatar_url=steam_info.get("avatarfull", "")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user
    
    async def get_current_user(
        self,
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ) -> dict:
        """Get current authenticated user from JWT token"""
        steam_id = verify_token(credentials.credentials)
        
        if not steam_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = db.query(User).filter(User.steam_id == steam_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": user.id,
            "steam_id": user.steam_id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "shame_score": user.shame_score
        }