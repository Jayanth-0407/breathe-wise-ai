from typing import List, Optional, Tuple
from pydantic import BaseModel, Field

class RouteRequest(BaseModel):
    origin_lat: float = Field(..., ge=-90, le=90)
    origin_lon: float = Field(..., ge=-180, le=180)
    destination_lat: float = Field(..., ge=-90, le=90)
    destination_lon: float = Field(..., ge=-180, le=180)
    activity_type: str = Field(default="walking", description="walking | jogging | cycling")
    has_asthma: bool = Field(default=False)
    age_group: str = Field(default="adult")

class JoggingLoopRequest(BaseModel):
    origin_lat: float = Field(default=28.6139, ge=-90, le=90)
    origin_lon: float = Field(default=77.2090, ge=-180, le=180)
    target_distance_km: float = Field(default=5.0, ge=0.5, le=42.0, description="Target jogging distance in km to fulfill daily goal")
    activity_type: str = Field(default="jogging", description="walking | jogging")
    has_asthma: bool = Field(default=False)
    age_group: str = Field(default="adult")

class RouteItem(BaseModel):
    id: str
    name: str
    tag: str  # "Lowest Exposure", "Greenest", "Fastest", "Optimal Loop"
    distance_km: float
    duration_minutes: float
    goal_fulfillment_pct: Optional[float] = 100.0
    exposure_score: float
    exposure_tier: str  # "Low", "Moderate", "Elevated", "High"
    traffic_proximity_proxy: str  # "Low", "Moderate", "High"
    green_space_proxy: str  # "Extensive", "Moderate", "Minimal"
    explanation: str
    data_uncertainty: str
    coordinates: List[List[float]]  # [[lon, lat], ...]

class RouteRecommendResponse(BaseModel):
    origin: List[float]
    destination: List[float]
    ambient_aqi: int
    routes: List[RouteItem]
    calculation_methodology: str
    disclaimer: str

class JoggingLoopResponse(BaseModel):
    origin: List[float]
    target_distance_km: float
    ambient_aqi: int
    loops: List[RouteItem]
    recommendation: str
    disclaimer: str
