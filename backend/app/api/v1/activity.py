from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.activity import ActivityCreate, ActivityItemResponse, ActivityListResponse
from app.services.activity_service import ActivityService

router = APIRouter()

@router.post("/activities", response_model=ActivityItemResponse)
def log_activity(payload: ActivityCreate, db: Session = Depends(get_db)):
    return ActivityService.log_activity(db, payload)

@router.get("/activities", response_model=ActivityListResponse)
def list_activities(
    user_id: str = Query(default="guest-user"),
    db: Session = Depends(get_db),
):
    return ActivityService.get_activities_and_summary(db, user_id=user_id)
