"""
BreatheWise AI - ADK & Agent Tools
==================================
Python tool functions registered with the Google ADK Agent.
Equipped with clear parameter type annotations and rich docstrings to facilitate
Gemini function-calling and tool routing.
"""

import asyncio
import concurrent.futures
import sys
from pathlib import Path
from typing import Dict, Any, Optional

# Ensure the backend directory is in sys.path when invoked via adk CLI
_backend_dir = str(Path(__file__).resolve().parent.parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.services.openmeteo_service import OpenMeteoService
from app.services.exercise_window_service import ExerciseWindowService
from app.services.exposure_service import ExposureService
from app.schemas.exposure import ExposureEstimateRequest
from app.ai.rag import EnvironmentalRAG


def _run_async_safely(coro):
    """Executes an async coroutine safely within both sync (e.g. adk web) and async event loops."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(asyncio.run, coro)
            return future.result()
    else:
        return asyncio.run(coro)


def get_current_air_quality(latitude: float = 28.6139, longitude: float = 77.2090) -> Dict[str, Any]:
    """
    Retrieves real-time ground-level air quality observations for given geographic coordinates.

    Args:
        latitude: Latitude of the location (e.g. 28.6139 for Delhi, 13.0827 for Chennai).
        longitude: Longitude of the location (e.g. 77.2090 for Delhi, 80.2707 for Chennai).

    Returns:
        Dictionary containing AQI, PM2.5 (ug/m3), PM10 (ug/m3), temperature (°C),
        wind speed (km/h), health category, and data source.
    """
    async def _fetch():
        data = await OpenMeteoService.get_live_air_quality(latitude, longitude)
        return {
            "aqi": data.get("aqi"),
            "category": data.get("category"),
            "pm25_ug_m3": data.get("pm25"),
            "pm10_ug_m3": data.get("pm10"),
            "temperature_celsius": data.get("temperature"),
            "wind_speed_kmh": data.get("wind_speed"),
            "source": data.get("source"),
        }

    return _run_async_safely(_fetch())


def get_best_exercise_windows(
    latitude: float = 28.6139,
    longitude: float = 77.2090,
    duration_minutes: int = 45,
    has_asthma: bool = False,
    age_group: str = "adult",
) -> Dict[str, Any]:
    """
    Finds and ranks the safest, least-polluted outdoor exercise and jogging time windows
    over the next 24 hours based on atmospheric boundary layer convective mixing and diurnal inversion.

    Args:
        latitude: Latitude of workout location.
        longitude: Longitude of workout location.
        duration_minutes: Desired workout duration in minutes (default 45).
        has_asthma: Whether the individual has asthma or airway vulnerability.
        age_group: Demographic group ('child', 'young_adult', 'adult', 'senior').

    Returns:
        Ranked list of candidate time windows with forecast AQI and meteorological rationale.
    """
    async def _fetch():
        res = await ExerciseWindowService.find_best_exercise_windows(
            lat=latitude,
            lon=longitude,
            target_duration_minutes=duration_minutes,
            has_asthma=has_asthma,
            age_group=age_group,
        )
        return {
            "windows": [w.model_dump() for w in res.windows],
            "rationale": res.scientific_rationale,
        }

    return _run_async_safely(_fetch())


def calculate_inhaled_dose(
    activity_type: str = "jogging",
    duration_minutes: int = 30,
    ambient_aqi: int = 150,
    age_group: str = "adult",
) -> Dict[str, Any]:
    """
    Calculates personal inhaled PM2.5 particulate mass (ug) using physiological minute
    ventilation rates (VE = V0 * MET), activity type, duration, and ambient AQI.

    Args:
        activity_type: Mode of activity ('walking', 'jogging', 'cycling', 'indoor_workout').
        duration_minutes: Duration of physical activity in minutes.
        ambient_aqi: Ambient Air Quality Index during the session.
        age_group: Age demographic ('child', 'young_adult', 'adult', 'senior').

    Returns:
        Estimated inhaled PM2.5 dose (ug), acute exposure tier, total air inhaled (m3),
        and personalized health impact advisory.
    """
    async def _fetch():
        req = ExposureEstimateRequest(
            activity_type=activity_type,
            duration_minutes=duration_minutes,
            ambient_aqi=ambient_aqi,
            age_group=age_group,
        )
        res = await ExposureService.estimate_exposure(req)
        return {
            "estimated_inhaled_pm25_ug": res.estimated_inhaled_pm25_ug,
            "exposure_tier": res.exposure_tier,
            "total_air_inhaled_m3": res.total_air_inhaled_m3,
            "health_impact": res.personalized_health_impact,
        }

    return _run_async_safely(_fetch())


def search_who_guidelines(query: str) -> Dict[str, Any]:
    """
    Searches local authoritative environmental health guidelines and air quality standards
    (WHO 2021 Global Air Quality Guidelines, CPCB NAQI, US EPA standards).

    Args:
        query: Specific search term (e.g. 'WHO PM2.5 annual limit', 'N95 mask protection', 'sensitive groups').

    Returns:
        List of authoritative document snippets with titles and official source citations.
    """
    docs = EnvironmentalRAG.search(query, top_k=2)
    return {"results": docs}


# Backward-compatible async aliases for existing callers
async def tool_get_current_aqi(lat: float = 28.6139, lon: float = 77.2090) -> Dict[str, Any]:
    return get_current_air_quality(latitude=lat, longitude=lon)

async def tool_get_exercise_windows(lat: float = 28.6139, lon: float = 77.2090, duration: int = 45) -> Dict[str, Any]:
    return get_best_exercise_windows(latitude=lat, longitude=lon, duration_minutes=duration)

async def tool_estimate_exposure(activity: str = "jogging", duration_min: int = 30, aqi: int = 150) -> Dict[str, Any]:
    return calculate_inhaled_dose(activity_type=activity, duration_minutes=duration_min, ambient_aqi=aqi)

def tool_search_guidelines(query: str) -> Dict[str, Any]:
    return search_who_guidelines(query=query)
