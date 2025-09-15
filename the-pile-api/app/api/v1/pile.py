from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.base import get_db
from app.services.user_service import UserService
from app.services.pile_service import PileService
from app.models.import_status import ImportStatus
from app.models.user import User
from app.schemas.pile import PileEntryResponse, PileFilters, AmnestyRequest

router = APIRouter()
user_service = UserService()
pile_service = PileService()


@router.get("/", response_model=List[PileEntryResponse])
async def get_pile(
    status: Optional[str] = None,
    genre: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_direction: Optional[str] = "desc",
    limit: int = 100,
    offset: int = 0,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's pile with optional filtering"""
    filters = PileFilters(
        status=status,
        genre=genre,
        sort_by=sort_by,
        sort_direction=sort_direction,
        limit=limit,
        offset=offset
    )
    
    pile_entries = await pile_service.get_user_pile(
        current_user["id"], filters, db
    )
    
    return pile_entries


@router.post("/import")
async def import_steam_library(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Import user's Steam library"""
    from datetime import datetime, timedelta, timezone
    
    # Check if user has imported in the last 24 hours
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if user and user.last_sync_at:
        # Ensure both datetimes are timezone-aware for comparison
        now_utc = datetime.now(timezone.utc)
        last_sync = user.last_sync_at
        
        # If last_sync is timezone-naive, assume it's UTC
        if last_sync.tzinfo is None:
            last_sync = last_sync.replace(tzinfo=timezone.utc)
        
        time_since_last_sync = now_utc - last_sync
        if time_since_last_sync < timedelta(hours=24):
            hours_remaining = 24 - time_since_last_sync.total_seconds() / 3600
            return {
                "error": "Rate limit exceeded", 
                "message": f"You can only sync once per day. Try again in {hours_remaining:.1f} hours.",
                "retry_after_hours": hours_remaining
            }
    
    # Add background task to import library
    background_tasks.add_task(
        pile_service.import_steam_library,
        current_user["steam_id"],
        current_user["id"],
        db
    )
    
    return {"message": "Steam library import started", "status": "processing"}


@router.post("/sync")
async def sync_playtime(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Sync playtime data from Steam"""
    background_tasks.add_task(
        pile_service.sync_playtime,
        current_user["steam_id"],
        current_user["id"],
        db
    )
    
    return {"message": "Playtime sync started", "status": "processing"}


@router.get("/import/status")
async def get_import_status(
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get the latest import/sync status for the user"""
    latest_status = db.query(ImportStatus).filter(
        ImportStatus.user_id == current_user["id"]
    ).order_by(ImportStatus.created_at.desc()).first()
    
    if not latest_status:
        return {"status": "none", "message": "No import operations found"}
    
    return {
        "status": latest_status.status,
        "operation_type": latest_status.operation_type,
        "progress_current": latest_status.progress_current,
        "progress_total": latest_status.progress_total,
        "error_message": latest_status.error_message,
        "started_at": latest_status.started_at,
        "completed_at": latest_status.completed_at
    }


@router.post("/amnesty/{game_id}")
async def grant_amnesty(
    game_id: int,
    amnesty_data: AmnestyRequest,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Grant amnesty to a game (give up without guilt)"""
    result = await pile_service.grant_amnesty(
        current_user["id"], game_id, amnesty_data.reason, db
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found in your pile"
        )
    
    return {"message": "Amnesty granted", "game_id": game_id}

@router.post("/start-playing/{game_id}")
async def start_playing(
    game_id: int,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a game as currently being played"""
    result = await pile_service.start_playing(
        current_user["id"], game_id, db
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found in your pile"
        )
    
    return {"message": "Game marked as playing", "game_id": game_id}


@router.post("/complete/{game_id}")
async def mark_completed(
    game_id: int,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a game as completed"""
    result = await pile_service.mark_completed(
        current_user["id"], game_id, db
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found in your pile"
        )
    
    return {"message": "Game marked as completed", "game_id": game_id}


@router.post("/abandon/{game_id}")
async def mark_abandoned(
    game_id: int,
    abandon_data: AmnestyRequest,  # Reuse the same schema for reason
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a game as abandoned"""
    result = await pile_service.mark_abandoned(
        current_user["id"], game_id, abandon_data.reason, db
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found in your pile"
        )
    
    return {"message": "Game marked as abandoned", "game_id": game_id}


@router.post("/status/{game_id}")
async def update_status(
    game_id: int,
    status_data: dict,  # Expect {"status": "playing"/"completed"/etc}
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Update game status directly"""
    status_value = status_data.get("status")
    if not status_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status field is required"
        )
    
    valid_statuses = ['unplayed', 'playing', 'completed', 'abandoned', 'amnesty_granted']
    if status_value not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    result = await pile_service.update_status(
        current_user["id"], game_id, status_value, db
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found in your pile"
        )
    
    return {"message": f"Game status updated to {status_value}", "game_id": game_id}
