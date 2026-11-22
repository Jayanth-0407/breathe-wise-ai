from typing import Optional
from pydantic import BaseModel, Field

class EmissionCalculateRequest(BaseModel):
    distance_km: float = Field(..., ge=0.1, le=500.0, description="Trip distance in kilometers")
    active_mode: str = Field(default="walking", description="walking | cycling")
    replaced_mode: str = Field(default="petrol_car", description="petrol_car | diesel_car | auto_rickshaw | motorbike")

class EmissionCalculateResponse(BaseModel):
    distance_km: float
    active_mode: str
    replaced_mode: str
    co2e_saved_grams: float
    co2e_saved_kg: float
    local_pm25_avoided_grams: float
    local_nox_avoided_grams: float
    comparative_context: str
    methodology: str
    scientific_distinction: str
