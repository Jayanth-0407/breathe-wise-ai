from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import UserProfile
from app.schemas.user import UserProfileCreate, UserProfileResponse

router = APIRouter()

@router.get("/user/profile/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        # Return sensible default guest profile
        return UserProfileResponse(
            user_id=user_id,
            age_group="adult",
            has_asthma=False,
            respiratory_conditions=[],
            fitness_level="intermediate",
            preferred_activities=["walking", "jogging"],
            daily_activity_goal_minutes=30,
            preferred_duration_minutes=30,
            default_city="Delhi NCR",
            default_lat=28.6139,
            default_lon=77.2090,
        )
    return UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        age_group=profile.age_group,
        has_asthma=profile.has_asthma,
        respiratory_conditions=profile.respiratory_conditions or [],
        fitness_level=profile.fitness_level,
        preferred_activities=profile.preferred_activities or ["walking", "jogging"],
        daily_activity_goal_minutes=profile.daily_activity_goal_minutes,
        preferred_duration_minutes=profile.preferred_duration_minutes,
        default_city=profile.default_city,
        default_lat=profile.default_lat,
        default_lon=profile.default_lon,
        created_at=profile.created_at.isoformat() if profile.created_at else None,
        updated_at=profile.updated_at.isoformat() if profile.updated_at else None,
    )

@router.post("/user/profile", response_model=UserProfileResponse)
def save_user_profile(payload: UserProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == payload.user_id).first()
    if profile:
        profile.age_group = payload.age_group
        profile.has_asthma = payload.has_asthma
        profile.respiratory_conditions = payload.respiratory_conditions
        profile.fitness_level = payload.fitness_level
        profile.preferred_activities = payload.preferred_activities
        profile.daily_activity_goal_minutes = payload.daily_activity_goal_minutes
        profile.preferred_duration_minutes = payload.preferred_duration_minutes
        profile.default_city = payload.default_city
        profile.default_lat = payload.default_lat
        profile.default_lon = payload.default_lon
    else:
        profile = UserProfile(
            user_id=payload.user_id,
            age_group=payload.age_group,
            has_asthma=payload.has_asthma,
            respiratory_conditions=payload.respiratory_conditions,
            fitness_level=payload.fitness_level,
            preferred_activities=payload.preferred_activities,
            daily_activity_goal_minutes=payload.daily_activity_goal_minutes,
            preferred_duration_minutes=payload.preferred_duration_minutes,
            default_city=payload.default_city,
            default_lat=payload.default_lat,
            default_lon=payload.default_lon,
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)

    return UserProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        age_group=profile.age_group,
        has_asthma=profile.has_asthma,
        respiratory_conditions=profile.respiratory_conditions or [],
        fitness_level=profile.fitness_level,
        preferred_activities=profile.preferred_activities or ["walking", "jogging"],
        daily_activity_goal_minutes=profile.daily_activity_goal_minutes,
        preferred_duration_minutes=profile.preferred_duration_minutes,
        default_city=profile.default_city,
        default_lat=profile.default_lat,
        default_lon=profile.default_lon,
        created_at=profile.created_at.isoformat() if profile.created_at else None,
        updated_at=profile.updated_at.isoformat() if profile.updated_at else None,
    )
