from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.services.user_service import UserService
from app.services.stats_service import StatsService
from app.schemas.stats import RealityCheck, ShameScore, BehavioralInsights

router = APIRouter()
user_service = UserService()
stats_service = StatsService()


@router.get("/reality-check", response_model=RealityCheck)
async def get_reality_check(
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get brutal reality check statistics"""
    reality_check = await stats_service.calculate_reality_check(
        current_user["id"], db
    )
    return reality_check


@router.get("/shame-score", response_model=ShameScore)
async def get_shame_score(
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's shame score and breakdown"""
    shame_score = await stats_service.calculate_shame_score(
        current_user["id"], db
    )
    return shame_score


@router.get("/insights", response_model=BehavioralInsights)
async def get_behavioral_insights(
    current_user: dict = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get behavioral insights and patterns"""
    insights = await stats_service.generate_insights(
        current_user["id"], db
    )
    return insights