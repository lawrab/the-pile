from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.services.user_service import UserService
from app.services.share_service import ShareService
from app.schemas.share import ShareableStats, ShareResponse

router = APIRouter()
user_service = UserService()
share_service = ShareService()


@router.post("/create", response_model=ShareResponse)
async def create_shareable_stats(
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Create shareable image of pile statistics"""
    share_data = await share_service.create_shareable_stats(
        current_user["id"], db
    )
    
    return share_data


@router.get("/{share_id}", response_model=ShareableStats)
async def get_shared_stats(
    share_id: str,
    db: Session = Depends(get_db)
):
    """Get shared statistics by ID"""
    stats = await share_service.get_shared_stats(share_id, db)
    
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared stats not found"
        )
    
    return stats