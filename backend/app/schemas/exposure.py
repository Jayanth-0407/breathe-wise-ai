from typing import Optional, List
from pydantic import BaseModel, Field

class ExposureEstimateRequest(BaseModel):
    activity_type: str = Field(default="jogging", description="walking | jogging | cycling | sedentary")
    duration_minutes: int = Field(default=30, ge=5, le=360)
    ambient_aqi: Optional[int] = Field(default=None, description="Optional override, else fetched from lat/lon")
    pm25_concentration: Optional[float] = Field(default=None, description="Optional PM2.5 in ug/m3")
    latitude: Optional[float] = Field(default=28.6139)
    longitude: Optional[float] = Field(default=77.2090)
    route_traffic_factor: float = Field(default=1.0, ge=0.5, le=2.0, description="1.0 normal, 0.85 park, 1.25 arterial road")
    has_asthma: bool = Field(default=False)
    age_group: str = Field(default="adult")

class ExposureEstimateResponse(BaseModel):
    activity_type: str
    duration_minutes: int
    met_value: float
    minute_ventilation_liters_per_min: float
    total_air_inhaled_m3: float
    ambient_pm25_ug_m3: float
    ambient_aqi: int
    estimated_inhaled_pm25_ug: float
    exposure_tier: str  # Minimal | Low | Moderate | High | Severe
    personalized_health_impact: str
    comparative_context: str
    calculation_methodology: str
    scientific_disclaimer: str
