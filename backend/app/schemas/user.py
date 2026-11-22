from typing import Optional, List
from pydantic import BaseModel, Field

class UserProfileBase(BaseModel):
    user_id: str = Field(default="guest-user", description="Unique user identifier")
    age_group: str = Field(default="adult", description="child | young_adult | adult | senior")
    has_asthma: bool = Field(default=False, description="Asthma vulnerability flag")
    respiratory_conditions: List[str] = Field(default_factory=list, description="Optional conditions: allergies, bronchitis, etc.")
    fitness_level: str = Field(default="intermediate", description="beginner | intermediate | advanced")
    preferred_activities: List[str] = Field(default_factory=lambda: ["walking", "jogging"])
    daily_activity_goal_minutes: int = Field(default=30, ge=5, le=300)
    preferred_duration_minutes: int = Field(default=30, ge=5, le=180)
    default_city: str = Field(default="New Delhi")
    default_lat: float = Field(default=28.6139)
    default_lon: float = Field(default=77.2090)

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
