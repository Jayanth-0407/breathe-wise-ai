import httpx
import logging
from typing import Dict, Any, Optional
from app.config import settings
from app.core.cache import aq_cache
from app.services.openmeteo_service import OpenMeteoService

logger = logging.getLogger(__name__)

class OpenAQService:
    @classmethod
    async def get_nearest_station_data(cls, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """Queries OpenAQ v3 API for official monitoring station data within 25km."""
        cache_key = f"openaq_station_{round(lat, 2)}_{round(lon, 2)}"
        cached = aq_cache.get(cache_key)
        if cached:
            return cached

        headers = {}
        if settings.OPENAQ_API_KEY:
            headers["X-API-Key"] = settings.OPENAQ_API_KEY

        url = f"{settings.OPENAQ_BASE_URL}/locations?coordinates={lat},{lon}&radius=25000&limit=1"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get("results", [])
                    if results:
                        station = results[0]
                        station_name = station.get("name", "Local Monitoring Station")
                        sensors = station.get("sensors", [])
                        pm25 = None
                        pm10 = None

                        for s in sensors:
                            parameter = s.get("parameter", {}).get("name", "").lower()
                            val = s.get("value")
                            if "pm25" in parameter or "pm2.5" in parameter:
                                pm25 = val
                            elif "pm10" in parameter:
                                pm10 = val

                        if pm25 is not None:
                            us_aqi = int(pm25 * 3.1)
                            category = OpenMeteoService.get_aqi_category(us_aqi)
                            result = {
                                "aqi": us_aqi,
                                "category": category,
                                "dominant_pollutant": "PM2.5",
                                "pm25": round(pm25, 1),
                                "pm10": round(pm10, 1) if pm10 is not None else None,
                                "source": f"OpenAQ Station ({station_name})",
                                "station_name": station_name,
                                "is_estimated": False,
                                "last_updated": station.get("datetimeLast", {}).get("utc", "Recent"),
                            }
                            aq_cache.set(cache_key, result, ttl_seconds=900)
                            return result
        except Exception as e:
            logger.info(f"OpenAQ station query note: {e}")

        return None
