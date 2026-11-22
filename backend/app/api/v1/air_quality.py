from fastapi import APIRouter, Query
from app.schemas.air_quality import AirQualityLiveResponse, AirQualityForecastResponse
from app.services.openmeteo_service import OpenMeteoService
from app.services.openaq_service import OpenAQService

router = APIRouter()

def generate_personalized_guidance(aqi: int, age_group: str, has_asthma: bool) -> tuple[str, list[str]]:
    alerts = []
    
    # Vulnerability guidance without changing official AQI breakpoints
    if aqi <= 50:
        guidance = "Air quality is ideal for all outdoor fitness activities. Enjoy your walking, jogging, or cycling session."
    elif aqi <= 100:
        if has_asthma or age_group in ["child", "senior"]:
            guidance = "Moderate air quality. Unusually sensitive individuals and those with asthma should monitor for mild respiratory irritation during prolonged outdoor exertion."
            alerts.append("Sensitive group advisory: Keep quick-relief inhaler handy if prescribed.")
        else:
            guidance = "Air quality is acceptable for outdoor exercise. Normal fitness routines can proceed."
    elif aqi <= 150:
        if has_asthma or age_group in ["child", "senior"]:
            guidance = "Unhealthy for Sensitive Groups. If you have asthma or cardiovascular conditions, shift intense cardiovascular training indoors or reduce outdoor duration."
            alerts.append("Vulnerability alert: Limit continuous outdoor endurance exercises beyond 30 minutes.")
        else:
            guidance = "Sensitive individuals may experience effects. Active adults should reduce heavy or prolonged outdoor exertion."
    elif aqi <= 200:
        guidance = "Unhealthy air quality. All individuals should substantially reduce prolonged or heavy outdoor exertion. Prefer indoor workouts or lower-intensity walking."
        alerts.append("General Health Warning: Consider wearing a well-fitted N95 particulate respirator outdoors.")
    elif aqi <= 300:
        guidance = "Very Unhealthy air quality. Avoid all strenuous outdoor exercise. Keep windows closed and utilize indoor HEPA filtration."
        alerts.append("High alert: Significant risk of adverse respiratory effects. Move workouts entirely indoors.")
    else:
        guidance = "Hazardous air quality: Health emergency conditions. Remain indoors with filtered air and minimize all outdoor physical activity."
        alerts.append("Emergency warning: Extreme particulate concentration. Do not perform outdoor cardiovascular activity.")

    return guidance, alerts

@router.get("/air-quality/live", response_model=AirQualityLiveResponse)
async def get_live_air_quality(
    lat: float = Query(default=28.6139, ge=-90, le=90),
    lon: float = Query(default=77.2090, ge=-180, le=180),
    age_group: str = Query(default="adult"),
    has_asthma: bool = Query(default=False),
):
    # 1. Try official OpenAQ station first
    station_data = await OpenAQService.get_nearest_station_data(lat, lon)
    # 2. Get Open-Meteo live weather & model AQ
    om_data = await OpenMeteoService.get_live_air_quality(lat, lon)

    if station_data:
        aqi = station_data["aqi"]
        category = station_data["category"]
        pm25 = station_data["pm25"]
        pm10 = station_data.get("pm10") or om_data.get("pm10")
        source = station_data["source"]
        station_name = station_data["station_name"]
        last_updated = station_data["last_updated"]
        is_estimated = False
    else:
        aqi = om_data["aqi"]
        category = om_data["category"]
        pm25 = om_data["pm25"]
        pm10 = om_data["pm10"]
        source = om_data["source"]
        station_name = om_data.get("station_name")
        last_updated = om_data["last_updated"]
        is_estimated = True

    guidance, alerts = generate_personalized_guidance(aqi, age_group, has_asthma)

    return AirQualityLiveResponse(
        aqi=aqi,
        category=category,
        dominant_pollutant="PM2.5",
        pm25=pm25,
        pm10=pm10,
        temperature=om_data.get("temperature"),
        humidity=om_data.get("humidity"),
        wind_speed=om_data.get("wind_speed"),
        wind_direction=om_data.get("wind_direction"),
        source=source,
        station_name=station_name,
        last_updated=last_updated,
        is_estimated=is_estimated,
        personalized_guidance=guidance,
        health_alerts=alerts,
    )

@router.get("/air-quality/forecast", response_model=AirQualityForecastResponse)
async def get_air_quality_forecast(
    lat: float = Query(default=28.6139, ge=-90, le=90),
    lon: float = Query(default=77.2090, ge=-180, le=180),
    days: int = Query(default=3, ge=1, le=5),
):
    data = await OpenMeteoService.get_hourly_forecast(lat, lon, days)
    return AirQualityForecastResponse(**data)
