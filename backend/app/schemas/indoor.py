from typing import List, Optional
from pydantic import BaseModel, Field

class IndoorWorkoutItem(BaseModel):
    id: str
    title: str
    category: str  # Indoor Walking | Yoga & Stretching | Low-Impact Cardio | Bodyweight Fitness
    difficulty: str  # Beginner | Intermediate | Advanced
    duration_minutes: int
    target_heart_rate_zone: str
    instructions: List[str]
    benefits: str
    clean_air_tips: List[str]

class IndoorWorkoutResponse(BaseModel):
    fitness_level: str
    duration_minutes: int
    ambient_outdoor_aqi: Optional[int] = None
    routines: List[IndoorWorkoutItem]
    clean_indoor_air_protocol: List[str]
    hepa_guidance: str
