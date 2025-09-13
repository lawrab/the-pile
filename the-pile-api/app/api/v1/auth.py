from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.services.steam_auth import SteamAuth
from app.services.user_service import UserService
from app.core.security import create_access_token
from datetime import timedelta
from app.core.config import settings

router = APIRouter()
steam_auth = SteamAuth()
user_service = UserService()


@router.get("/steam/login")
async def steam_login():
    """Initiate Steam OpenID authentication"""
    auth_url = steam_auth.get_auth_url()
    return RedirectResponse(auth_url)


@router.get("/steam/callback")
async def steam_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Steam OpenID callback and create/update user"""
    # Extract OpenID parameters from query string
    query_params = dict(request.query_params)
    
    # Check if we have the required OpenID parameters
    required_params = [
        "openid.mode", "openid.signed", "openid.sig", "openid.ns",
        "openid.op_endpoint", "openid.claimed_id", "openid.identity",
        "openid.return_to", "openid.response_nonce"
    ]
    
    missing_params = [param for param in required_params if param not in query_params]
    if missing_params:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing OpenID parameters: {', '.join(missing_params)}"
        )
    
    # Verify Steam authentication
    steam_id = steam_auth.verify_authentication(query_params)
    
    if not steam_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Steam authentication failed"
        )
    
    # Get or create user
    user = await user_service.get_or_create_user(steam_id, db)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": steam_id}, expires_delta=access_token_expires
    )
    
    # Redirect to frontend with token
    frontend_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
    return RedirectResponse(f"{frontend_url}/auth/callback?token={access_token}")


@router.get("/me")
async def get_current_user(
    current_user: dict = Depends(user_service.get_current_user)
):
    """Get current authenticated user"""
    return current_user