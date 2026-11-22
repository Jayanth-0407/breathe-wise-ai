from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class PollutantData(BaseModel):
    value: float
    unit: str = "µg/m³"
    category: Optional[str] = None

class AirQualityLiveResponse(BaseModel):
    aqi: int
    category: str
    dominant_pollutant: str
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    source: str
    station_name: Optional[str] = None
    last_updated: str
    is_estimated: bool = False
    personalized_guidance: str
    health_alerts: List[str] = []

class HourlyForecastItem(BaseModel):
    time: str
    aqi: int
    category: str
    pm25: float
    pm10: float
    temperature: float
    humidity: float
    wind_speed: float

class AirQualityForecastResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    hourly: List[HourlyForecastItem]
    source: str
    generated_at: str
