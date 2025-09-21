from typing import List, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limiter import limiter
from app.db.base import get_db
from app.models.import_status import ImportStatus
from app.models.user import User
from app.schemas.pile import AmnestyRequest, PileEntryResponse, PileFilters
from app.services.pile_service import PileService
from app.services.user_service import UserService
from app.services.validation_service import InputValidationService

router = APIRouter()
user_service = UserService()
pile_service = PileService()


async def get_updated_shame_score(user_id: int, db: Session) -> float:
    """Helper function to invalidate cache and recalculate shame score"""
    from app.services.cache_service import invalidate_cache_pattern
    from app.services.stats_service import StatsService

    # Clear stats cache for this user
    invalidate_cache_pattern(f"reality_check_{user_id}_*")
    invalidate_cache_pattern(f"behavioral_insights_{user_id}_*")

    stats_service = StatsService()
    updated_shame_score = await stats_service.calculate_shame_score(user_id, db)
    return updated_shame_score.score


@router.get("/", response_model=List[PileEntryResponse])
async def get_pile(
    status: Optional[str] = None,
    genre: Optional[str] = None,
    sort_by: Optional[str] = "playtime",
    sort_direction: Optional[str] = "asc",
    limit: int = 100,
    offset: int = 0,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's pile with optional filtering"""
    filters = PileFilters(
        status=status,
        genre=genre,
        sort_by=sort_by,
        sort_direction=sort_direction,
        limit=limit,
        offset=offset,
    )

    pile_entries = await pile_service.get_user_pile(current_user["id"], filters, db)

    # Use custom factory method to ensure effective_status is used
    return [PileEntryResponse.from_pile_entry(entry) for entry in pile_entries]


@router.post("/import")
@limiter.limit("2/hour")
async def import_steam_library(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Import user's Steam library"""
    from datetime import datetime, timedelta, timezone
    import logging

    logger = logging.getLogger(__name__)
    logger.info(f"Import endpoint called for user {current_user['id']}")

    # Check rate limit if enabled
    if settings.IMPORT_RATE_LIMIT_HOURS > 0:
        user = db.query(User).filter(User.id == current_user["id"]).first()
        if user and user.last_sync_at:
            # Ensure both datetimes are timezone-aware for comparison
            now_utc = datetime.now(timezone.utc)
            last_sync = user.last_sync_at

            # If last_sync is timezone-naive, assume it's UTC
            if last_sync.tzinfo is None:
                last_sync = last_sync.replace(tzinfo=timezone.utc)

            time_since_last_sync = now_utc - last_sync
            rate_limit_delta = timedelta(hours=settings.IMPORT_RATE_LIMIT_HOURS)

            if time_since_last_sync < rate_limit_delta:
                hours_remaining = (
                    settings.IMPORT_RATE_LIMIT_HOURS
                    - time_since_last_sync.total_seconds() / 3600
                )
                logger.info(
                    f"Rate limit hit for user {current_user['id']}: "
                    f"{hours_remaining:.1f} hours remaining"
                )
                time_unit = "hours" if settings.IMPORT_RATE_LIMIT_HOURS != 1 else "hour"
                return {
                    "error": "Rate limit exceeded",
                    "message": (
                        f"You can only sync once every "
                        f"{settings.IMPORT_RATE_LIMIT_HOURS} {time_unit}. "
                        f"Try again in {hours_remaining:.1f} hours."
                    ),
                    "retry_after_hours": hours_remaining,
                }

    logger.info(
        f"Adding background task for user {current_user['id']}, "
        f"steam_id {current_user['steam_id']}"
    )

    # Add background task to import library
    # Note: Don't pass the db session - let the background task create its own
    background_tasks.add_task(
        _import_steam_library_task, current_user["steam_id"], current_user["id"]
    )

    logger.info(f"Background task added successfully for user {current_user['id']}")

    return {"message": "Steam library import started", "status": "processing"}


async def _import_steam_library_task(steam_id: str, user_id: int):
    """Background task wrapper that creates its own database session"""
    import logging

    from app.db.base import get_db_session

    logger = logging.getLogger(__name__)
    logger.info(f"Starting import for user {user_id}, steam_id {steam_id}")

    # Validate inputs
    validated_steam_id = InputValidationService.validate_steam_id(steam_id)
    validated_user_id = InputValidationService.validate_user_id(user_id)

    db = get_db_session()
    try:
        await pile_service.import_steam_library(
            validated_steam_id, validated_user_id, db
        )
        logger.info(f"Import completed successfully for user {validated_user_id}")
    except Exception as e:
        logger.error(f"Import failed for user {validated_user_id}: {str(e)}")
        raise
    finally:
        db.close()


@router.post("/sync")
@limiter.limit("10/hour")
async def sync_playtime(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Sync playtime data from Steam"""
    background_tasks.add_task(
        _sync_playtime_task, current_user["steam_id"], current_user["id"]
    )

    return {"message": "Playtime sync started", "status": "processing"}


async def _sync_playtime_task(steam_id: str, user_id: int):
    """Background task wrapper that creates its own database session"""
    import logging

    from app.db.base import get_db_session

    logger = logging.getLogger(__name__)
    logger.info(f"Starting sync for user {user_id}, steam_id {steam_id}")

    # Validate inputs
    validated_steam_id = InputValidationService.validate_steam_id(steam_id)
    validated_user_id = InputValidationService.validate_user_id(user_id)

    db = get_db_session()
    try:
        await pile_service.sync_playtime(validated_steam_id, validated_user_id, db)
        logger.info(f"Sync completed successfully for user {validated_user_id}")
    except Exception as e:
        logger.error(f"Sync failed for user {validated_user_id}: {str(e)}")
        raise
    finally:
        db.close()


@router.get("/import/status")
async def get_import_status(
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Get the latest import/sync status for the user"""
    # Validate user ID
    user_id = InputValidationService.validate_user_id(current_user["id"])

    latest_status = (
        db.query(ImportStatus)
        .filter(ImportStatus.user_id == user_id)
        .order_by(ImportStatus.created_at.desc())
        .first()
    )

    if not latest_status:
        return {"status": "none", "message": "No import operations found"}

    return {
        "status": latest_status.status,
        "operation_type": latest_status.operation_type,
        "progress_current": latest_status.progress_current,
        "progress_total": latest_status.progress_total,
        "error_message": latest_status.error_message,
        "started_at": latest_status.started_at,
        "completed_at": latest_status.completed_at,
    }


@router.post("/amnesty/{pile_entry_id}")
@limiter.limit("10/minute")
async def grant_amnesty(
    request: Request,
    response: Response,
    pile_entry_id: int,
    amnesty_data: AmnestyRequest,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Grant amnesty to a game (give up without guilt)"""
    # Validate pile_entry_id
    pile_entry_id = InputValidationService.validate_pile_entry_id(pile_entry_id)
    user_id = InputValidationService.validate_user_id(current_user["id"])

    # Get the pile entry to find the steam_game_id
    from app.models.pile_entry import PileEntry

    pile_entry = (
        db.query(PileEntry)
        .filter(PileEntry.id == pile_entry_id, PileEntry.user_id == user_id)
        .first()
    )

    if not pile_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    result = await pile_service.grant_amnesty(
        user_id, pile_entry.steam_game_id, amnesty_data.reason, db
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    # Get updated shame score after status change
    updated_shame_score = await get_updated_shame_score(user_id, db)

    return {
        "message": "Amnesty granted",
        "pile_entry_id": pile_entry_id,
        "shame_score": updated_shame_score,
    }


@router.post("/start-playing/{pile_entry_id}")
@limiter.limit("10/minute")
async def start_playing(
    request: Request,
    response: Response,
    pile_entry_id: int,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a game as currently being played"""
    # Validate inputs
    pile_entry_id = InputValidationService.validate_pile_entry_id(pile_entry_id)
    user_id = InputValidationService.validate_user_id(current_user["id"])

    # Get the pile entry to find the steam_game_id
    from app.models.pile_entry import PileEntry

    pile_entry = (
        db.query(PileEntry)
        .filter(PileEntry.id == pile_entry_id, PileEntry.user_id == user_id)
        .first()
    )

    if not pile_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    result = await pile_service.start_playing(user_id, pile_entry.steam_game_id, db)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    # Get updated shame score after status change
    updated_shame_score = await get_updated_shame_score(user_id, db)

    return {
        "message": "Game marked as playing",
        "pile_entry_id": pile_entry_id,
        "shame_score": updated_shame_score,
    }


@router.post("/complete/{pile_entry_id}")
@limiter.limit("10/minute")
async def mark_completed(
    request: Request,
    response: Response,
    pile_entry_id: int,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a game as completed"""
    # Validate inputs
    pile_entry_id = InputValidationService.validate_pile_entry_id(pile_entry_id)
    user_id = InputValidationService.validate_user_id(current_user["id"])

    # Get the pile entry to find the steam_game_id
    from app.models.pile_entry import PileEntry

    pile_entry = (
        db.query(PileEntry)
        .filter(PileEntry.id == pile_entry_id, PileEntry.user_id == user_id)
        .first()
    )

    if not pile_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    result = await pile_service.mark_completed(user_id, pile_entry.steam_game_id, db)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    # Get updated shame score after status change
    updated_shame_score = await get_updated_shame_score(user_id, db)

    return {
        "message": "Game marked as completed",
        "pile_entry_id": pile_entry_id,
        "shame_score": updated_shame_score,
    }


@router.post("/abandon/{pile_entry_id}")
@limiter.limit("10/minute")
async def mark_abandoned(
    request: Request,
    response: Response,
    pile_entry_id: int,
    abandon_data: AmnestyRequest,  # Reuse the same schema for reason
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a game as abandoned"""
    # Validate inputs
    pile_entry_id = InputValidationService.validate_pile_entry_id(pile_entry_id)
    user_id = InputValidationService.validate_user_id(current_user["id"])

    # Get the pile entry to find the steam_game_id
    from app.models.pile_entry import PileEntry

    pile_entry = (
        db.query(PileEntry)
        .filter(PileEntry.id == pile_entry_id, PileEntry.user_id == user_id)
        .first()
    )

    if not pile_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    result = await pile_service.mark_abandoned(
        user_id, pile_entry.steam_game_id, abandon_data.reason, db
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    # Get updated shame score after status change
    updated_shame_score = await get_updated_shame_score(user_id, db)

    return {
        "message": "Game marked as abandoned",
        "pile_entry_id": pile_entry_id,
        "shame_score": updated_shame_score,
    }


@router.post("/status/{pile_entry_id}")
@limiter.limit("10/minute")
async def update_status(
    request: Request,
    response: Response,
    pile_entry_id: int,
    status_data: dict,  # Expect {"status": "playing"/"completed"/etc}
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Update game status directly"""
    # Validate inputs
    pile_entry_id = InputValidationService.validate_pile_entry_id(pile_entry_id)
    user_id = InputValidationService.validate_user_id(current_user["id"])

    # Get the pile entry to find the steam_game_id
    from app.models.pile_entry import PileEntry

    pile_entry = (
        db.query(PileEntry)
        .filter(PileEntry.id == pile_entry_id, PileEntry.user_id == user_id)
        .first()
    )

    if not pile_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    status_value = status_data.get("status")
    if not status_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Status field is required"
        )

    valid_statuses = [
        "unplayed",
        "playing",
        "completed",
        "abandoned",
        "amnesty_granted",
    ]
    if status_value not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    result = await pile_service.update_status(
        user_id, pile_entry.steam_game_id, status_value, db
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game not found in your pile"
        )

    # Get updated shame score after status change
    updated_shame_score = await get_updated_shame_score(user_id, db)

    return {
        "message": f"Game status updated to {status_value}",
        "pile_entry_id": pile_entry_id,
        "shame_score": updated_shame_score,
    }


@router.delete("/clear")
@limiter.limit("1/hour")
async def clear_pile(
    request: Request,
    response: Response,
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db),
):
    """Clear all pile entries for the user (destructive operation)"""
    # Validate user ID
    user_id = InputValidationService.validate_user_id(current_user["id"])

    result = await pile_service.clear_user_pile(user_id, db)

    return {
        "message": f"Cleared {result} games from your pile",
        "cleared_count": result,
    }
