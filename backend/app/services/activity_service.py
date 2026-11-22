import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import ActivityLog
from app.schemas.activity import ActivityCreate, ActivityItemResponse, ActivityListResponse, WeeklySummary

logger = logging.getLogger(__name__)

class ActivityService:
    @classmethod
    def log_activity(cls, db: Session, payload: ActivityCreate) -> ActivityItemResponse:
        entry = ActivityLog(
            user_id=payload.user_id,
            activity_type=payload.activity_type,
            duration_minutes=payload.duration_minutes,
            distance_km=payload.distance_km,
            estimated_aqi=payload.estimated_aqi,
            exposure_score=payload.exposure_score,
            location_name=payload.location_name,
            notes=payload.notes,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

        return ActivityItemResponse(
            id=entry.id,
            user_id=entry.user_id,
            activity_type=entry.activity_type,
            duration_minutes=entry.duration_minutes,
            distance_km=entry.distance_km,
            estimated_aqi=entry.estimated_aqi,
            exposure_score=entry.exposure_score,
            location_name=entry.location_name,
            notes=entry.notes,
            logged_at=entry.logged_at.isoformat(),
        )

    @classmethod
    def get_activities_and_summary(cls, db: Session, user_id: str = "guest-user") -> ActivityListResponse:
        logs = db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.logged_at.desc()).all()

        items = [
            ActivityItemResponse(
                id=l.id,
                user_id=l.user_id,
                activity_type=l.activity_type,
                duration_minutes=l.duration_minutes,
                distance_km=l.distance_km,
                estimated_aqi=l.estimated_aqi,
                exposure_score=l.exposure_score,
                location_name=l.location_name,
                notes=l.notes,
                logged_at=l.logged_at.isoformat() if l.logged_at else "",
            )
            for l in logs
        ]

        total_dur = sum(i.duration_minutes for i in items)
        total_dist = round(sum(i.distance_km for i in items), 2)
        total_sessions = len(items)

        # Activity types distribution
        by_type: Dict[str, int] = {}
        for i in items:
            by_type[i.activity_type] = by_type.get(i.activity_type, 0) + 1

        avg_exposure = (
            round(sum(i.exposure_score for i in items if i.exposure_score) / len(items), 1)
            if items and any(i.exposure_score for i in items)
            else 0.0
        )

        daily_goal = 30
        goal_pct = min(100.0, round((total_dur / (daily_goal * 7)) * 100, 1))

        summary = WeeklySummary(
            total_duration_minutes=total_dur,
            total_distance_km=total_dist,
            total_sessions=total_sessions,
            daily_goal_minutes=daily_goal,
            goal_completion_pct=goal_pct,
            avg_exposure_score=avg_exposure,
            activities_by_type=by_type,
        )

        return ActivityListResponse(activities=items, summary=summary)
