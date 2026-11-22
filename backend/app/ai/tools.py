from typing import Dict, Any
from app.services.openmeteo_service import OpenMeteoService
from app.services.exercise_window_service import ExerciseWindowService
from app.services.exposure_service import ExposureService
from app.schemas.exposure import ExposureEstimateRequest
from app.ai.rag import EnvironmentalRAG

async def tool_get_current_aqi(lat: float = 28.6139, lon: float = 77.2090) -> Dict[str, Any]:
    """Retrieves live observational air quality, PM2.5, PM10, temperature, and wind speed."""
    data = await OpenMeteoService.get_live_air_quality(lat, lon)
    return {
        "aqi": data.get("aqi"),
        "category": data.get("category"),
        "pm25": data.get("pm25"),
        "pm10": data.get("pm10"),
        "temperature": data.get("temperature"),
        "wind_speed": data.get("wind_speed"),
        "source": data.get("source"),
    }

async def tool_get_exercise_windows(lat: float = 28.6139, lon: float = 77.2090, duration: int = 45) -> Dict[str, Any]:
    """Finds the best 3 outdoor exercise windows in the next 24 hours based on atmospheric boundary layer mixing."""
    res = await ExerciseWindowService.find_best_exercise_windows(lat, lon, target_duration_minutes=duration)
    return {
        "windows": [w.model_dump() for w in res.windows],
        "rationale": res.scientific_rationale,
    }

async def tool_estimate_exposure(activity: str = "jogging", duration_min: int = 30, aqi: int = 150) -> Dict[str, Any]:
    """Calculates deterministic inhaled PM2.5 dose (ug) based on minute ventilation rates."""
    req = ExposureEstimateRequest(activity_type=activity, duration_minutes=duration_min, ambient_aqi=aqi)
    res = await ExposureService.estimate_exposure(req)
    return {
        "estimated_inhaled_pm25_ug": res.estimated_inhaled_pm25_ug,
        "exposure_tier": res.exposure_tier,
        "total_air_inhaled_m3": res.total_air_inhaled_m3,
        "health_impact": res.personalized_health_impact,
    }

def tool_search_guidelines(query: str) -> Dict[str, Any]:
    """Searches authoritative guidelines (WHO 2021, CPCB, US EPA) with official citations."""
    docs = EnvironmentalRAG.search(query, top_k=2)
    return {"results": docs}
