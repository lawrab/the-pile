from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.base import get_db
from app.services.user_service import UserService
from app.services.pile_service import PileService
from app.schemas.pile import PileEntryResponse, PileFilters, AmnestyRequest

router = APIRouter()
user_service = UserService()
pile_service = PileService()


@router.get("/", response_model=List[PileEntryResponse])
async def get_pile(
    status: Optional[str] = None,
    genre: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's pile with optional filtering"""
    filters = PileFilters(
        status=status,
        genre=genre,
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