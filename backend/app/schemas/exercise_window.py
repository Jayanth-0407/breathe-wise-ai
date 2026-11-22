from typing import List, Optional
from pydantic import BaseModel, Field

class ExerciseWindowItem(BaseModel):
    window_start: str
    window_end: str
    avg_aqi: int
    category: str
    avg_pm25: float
    avg_temp: float
    avg_wind_speed: float
    recommendation_score: int  # 0-100
    suitability: str  # Optimal | Acceptable | Caution | Avoid
    reason: str
    weather_summary: str

class ExerciseWindowsResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    generated_at: str
    target_duration_minutes: int
    windows: List[ExerciseWindowItem]
    scientific_rationale: str
    disclaimer: str
