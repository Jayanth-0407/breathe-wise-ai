from typing import List, Optional
from pydantic import BaseModel, Field

class ActivityCreate(BaseModel):
    user_id: str = "guest-user"
    activity_type: str = Field(..., description="walking | jogging | cycling | indoor_workout | yoga")
    duration_minutes: int = Field(..., ge=1, le=360)
    distance_km: float = Field(default=0.0, ge=0.0, le=100.0)
    estimated_aqi: Optional[float] = None
    exposure_score: Optional[float] = None
    location_name: Optional[str] = "Neighborhood Corridor"
    notes: Optional[str] = None

class ActivityItemResponse(BaseModel):
    id: str
    user_id: str
    activity_type: str
    duration_minutes: int
    distance_km: float
    estimated_aqi: Optional[float]
    exposure_score: Optional[float]
    location_name: Optional[str]
    notes: Optional[str]
    logged_at: str

class WeeklySummary(BaseModel):
    total_duration_minutes: int
    total_distance_km: float
    total_sessions: int
    daily_goal_minutes: int
    goal_completion_pct: float
    avg_exposure_score: float
    activities_by_type: dict

class ActivityListResponse(BaseModel):
    activities: List[ActivityItemResponse]
    summary: WeeklySummary
