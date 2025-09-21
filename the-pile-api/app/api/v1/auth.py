"""
Secure authentication endpoints following FastAPI best practices.
"""

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limiter import limiter
from app.core.security import create_access_token, create_secure_cookie_params, Token
from app.db.base import get_db
from app.models.user import User
from app.services.steam_auth import SteamAuth
from app.services.user_service import UserService

router = APIRouter()
steam_auth = SteamAuth()
user_service = UserService()


@router.get("/steam/login")
@limiter.limit("10 per minute")
async def steam_login(request: Request, response: Response):
    """
    Initiate Steam OpenID authentication.
    Redirects user to Steam's authentication page.
    """
    try:
        auth_url = steam_auth.get_auth_url()
        return RedirectResponse(auth_url, status_code=status.HTTP_302_FOUND)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Steam authentication service unavailable",
        )


@router.get("/steam/callback")
@limiter.limit("20 per minute")
async def steam_callback(
    request: Request, response: Response, db: Annotated[Session, Depends(get_db)]
):
    """
    Handle Steam OpenID callback with secure parameter validation.
    """
    # Extract OpenID parameters from query string
    query_params = dict(request.query_params)

    # Validate required OpenID parameters
    required_params = [
        "openid.mode",
        "openid.signed",
        "openid.sig",
        "openid.ns",
        "openid.op_endpoint",
        "openid.claimed_id",
        "openid.identity",
        "openid.return_to",
        "openid.response_nonce",
    ]

    missing_params = [param for param in required_params if param not in query_params]
    if missing_params:
        # Log security event
        print(f"Missing OpenID parameters in callback: {missing_params}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid authentication response",
        )

    # Verify Steam authentication securely
    try:
        steam_id = steam_auth.verify_authentication(query_params)
    except Exception as e:
        # Log security event
        print(f"Steam authentication verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication verification failed",
        )

    if not steam_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Steam authentication failed",
        )

    # Get or create user securely
    try:
        await user_service.get_or_create_user(steam_id, db)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="User creation failed",
        )

    # Create secure access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": steam_id}, expires_delta=access_token_expires
    )

    # Prepare secure redirect
    frontend_url = (
        settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
    )

    # Validate frontend URL for security
    if not frontend_url.startswith(("http://localhost", "https://")):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid redirect configuration",
        )

    response = RedirectResponse(
        f"{frontend_url}/auth/callback?success=true", status_code=status.HTTP_302_FOUND
    )

    # Set secure cookie with all security headers
    cookie_params = create_secure_cookie_params()
    response.set_cookie(key="auth_token", value=access_token, **cookie_params)

    return response


@router.get("/me")
async def get_current_user(
    current_user: Annotated[dict, Depends(user_service.get_current_user)],
):
    """Get current authenticated user with secure validation"""
    return current_user


@router.post("/token")
@limiter.limit("30 per minute")
async def get_access_token(
    request: Request,
    response: Response,
    current_user: Annotated[dict, Depends(user_service.get_current_user)],
) -> Token:
    """
    Get access token for API clients (alternative to cookie auth).
    Useful for programmatic access.
    """
    # Create new token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user["steam_id"]}, expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/logout")
@router.post("/logout")
@limiter.limit("30 per minute")
async def logout(request: Request, response: Response):
    """
    Secure logout with proper cookie clearing.
    Supports both GET and POST for flexibility.
    """
    # Determine redirect URL
    frontend_url = (
        settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
    )

    # Clear authentication cookie securely
    cookie_params = create_secure_cookie_params()
    cookie_params["max_age"] = 0  # Immediately expire

    # For GET requests, redirect to frontend
    if request.method == "GET":
        redirect_response = RedirectResponse(
            frontend_url, status_code=status.HTTP_302_FOUND
        )
        redirect_response.delete_cookie(
            key="auth_token",
            path="/",
            domain=None,
            secure=cookie_params["secure"],
            samesite=cookie_params["samesite"],
        )
        return redirect_response

    # For POST requests, return JSON response
    response.delete_cookie(
        key="auth_token",
        path="/",
        domain=None,
        secure=cookie_params["secure"],
        samesite=cookie_params["samesite"],
    )

    return {"message": "Successfully logged out"}


@router.delete("/profile")
@limiter.limit("3 per hour")
async def request_account_deletion(
    request: Request,
    response: Response,
    current_user: Annotated[dict, Depends(user_service.get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    GDPR Article 17 - Right to erasure
    Request account deletion with 30-day grace period
    """
    try:
        # Get user from database
        user = db.query(User).filter(User.id == current_user["id"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Check if deletion is already requested
        if user.deletion_requested_at:
            return {
                "message": "Account deletion already requested",
                "deletion_date": user.deletion_scheduled_at,
                "grace_period_ends": user.deletion_scheduled_at,
            }

        # Set deletion timestamps
        now = datetime.now(timezone.utc)
        user.deletion_requested_at = now
        user.deletion_scheduled_at = now + timedelta(days=30)

        db.commit()

        return {
            "message": "Account deletion scheduled successfully",
            "deletion_date": user.deletion_scheduled_at,
            "grace_period_ends": user.deletion_scheduled_at,
            "notice": "You have 30 days to cancel this request by logging in again",
        }

    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"Account deletion request failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process deletion request",
        )


@router.post("/profile/cancel-deletion")
@limiter.limit("10 per hour")
async def cancel_account_deletion(
    request: Request,
    response: Response,
    current_user: Annotated[dict, Depends(user_service.get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Cancel a previously requested account deletion
    """
    try:
        # Get user from database
        user = db.query(User).filter(User.id == current_user["id"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Check if deletion was requested
        if not user.deletion_requested_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No deletion request found to cancel",
            )

        # Clear deletion timestamps
        user.deletion_requested_at = None
        user.deletion_scheduled_at = None

        db.commit()

        return {
            "message": "Account deletion request cancelled successfully",
            "status": "active",
        }

    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"Account deletion cancellation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel deletion request",
        )


@router.get("/verify")
async def verify_authentication(
    current_user: Annotated[dict, Depends(user_service.get_current_user_optional)],
):
    """
    Verify if current request is authenticated.
    Returns user info if authenticated, null otherwise.
    """
    return {"authenticated": current_user is not None, "user": current_user}
