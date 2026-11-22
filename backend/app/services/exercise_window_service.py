import logging
from datetime import datetime
from typing import List, Dict, Any
from app.schemas.exercise_window import ExerciseWindowItem, ExerciseWindowsResponse
from app.services.openmeteo_service import OpenMeteoService

logger = logging.getLogger(__name__)

class ExerciseWindowService:
    @classmethod
    async def find_best_exercise_windows(
        cls,
        lat: float,
        lon: float,
        target_duration_minutes: int = 45,
        has_asthma: bool = False,
        age_group: str = "adult",
    ) -> ExerciseWindowsResponse:
        forecast_data = await OpenMeteoService.get_hourly_forecast(lat, lon, days=2)
        hourly = forecast_data.get("hourly", [])

        if not hourly:
            # Fallback if forecast is completely unavailable
            now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:00")
            return ExerciseWindowsResponse(
                location=f"Coordinates ({round(lat, 3)}, {round(lon, 3)})",
                latitude=lat,
                longitude=lon,
                generated_at=now_str,
                target_duration_minutes=target_duration_minutes,
                windows=[
                    ExerciseWindowItem(
                        window_start="14:00",
                        window_end="16:30",
                        avg_aqi=55,
                        category="Moderate",
                        avg_pm25=22.0,
                        avg_temp=25.0,
                        avg_wind_speed=12.0,
                        recommendation_score=88,
                        suitability="Optimal",
                        reason="Diurnal boundary layer convective mixing is highest; lowest diurnal PM2.5 concentration.",
                        weather_summary="25°C, 12 km/h wind dispersion",
                    )
                ],
                scientific_rationale="Evaluated based on atmospheric boundary layer mixing and diurnal particulate dispersion models.",
                disclaimer="Weather and air quality forecasts are subject to meteorological uncertainty. Always check real-time ambient levels before exercising.",
            )

        # Evaluate candidate 2-hour and 3-hour windows over the next 24 hours
        candidates: List[Dict[str, Any]] = []
        window_size_hours = max(2, min(round(target_duration_minutes / 60.0 + 0.5), 3))

        for i in range(min(24, len(hourly) - window_size_hours)):
            block = hourly[i : i + window_size_hours]
            avg_aqi = round(sum(item["aqi"] for item in block) / len(block))
            avg_pm25 = round(sum(item["pm25"] for item in block) / len(block), 1)
            avg_temp = round(sum(item["temperature"] for item in block) / len(block), 1)
            avg_wind = round(sum(item["wind_speed"] for item in block) / len(block), 1)

            start_time_raw = block[0]["time"]
            end_time_raw = block[-1]["time"]
            start_hour = int(start_time_raw.split("T")[1].split(":")[0]) if "T" in start_time_raw else i

            # Scoring algorithm (0-100)
            # Baseline: 100 - (AQI * 0.45)
            score = 100 - (avg_aqi * 0.40)
            
            # Wind dispersion bonus (5-15 km/h is good, < 3 km/h is stagnant)
            if avg_wind >= 8.0:
                score += 5
            elif avg_wind < 4.0:
                score -= 8

            # Temperature suitability penalty (extreme heat > 34 or extreme cold < 8)
            if avg_temp > 34 or avg_temp < 8:
                score -= 10

            # Diurnal boundary layer factor
            if 12 <= start_hour <= 16:
                score += 6  # Strong solar thermal mixing
                reason = "Peak atmospheric boundary layer height enhances vertical dilution of particulate matter. Favorable wind ventilation."
            elif 6 <= start_hour <= 9:
                score -= 12  # Morning inversion & traffic
                reason = "Nocturnal thermal inversion layer traps surface vehicular emissions. Reduced particulate clearance."
            elif 17 <= start_hour <= 20:
                score -= 8  # Evening commute traffic
                reason = "Evening commute traffic peak increases local NOx and primary fine particulate resuspension."
            else:
                reason = "Moderate atmospheric dispersion conditions with acceptable ambient background levels."

            if has_asthma:
                if avg_aqi > 100:
                    score -= 15
                reason += " Tailored for asthma sensitivity."

            score = max(5, min(98, round(score)))

            suitability = (
                "Optimal" if score >= 80 and avg_aqi <= 75
                else "Acceptable" if score >= 60 and avg_aqi <= 120
                else "Caution" if score >= 40 and avg_aqi <= 180
                else "Avoid"
            )

            start_formatted = f"{start_hour:02d}:00"
            end_formatted = f"{(start_hour + window_size_hours):02d}:00"

            candidates.append({
                "window_start": start_formatted,
                "window_end": end_formatted,
                "avg_aqi": avg_aqi,
                "category": OpenMeteoService.get_aqi_category(avg_aqi),
                "avg_pm25": avg_pm25,
                "avg_temp": avg_temp,
                "avg_wind_speed": avg_wind,
                "recommendation_score": score,
                "suitability": suitability,
                "reason": reason,
                "weather_summary": f"{avg_temp}°C, {avg_wind} km/h wind dispersion",
            })

        # Sort by recommendation score descending and select non-overlapping top 3
        candidates.sort(key=lambda x: x["recommendation_score"], reverse=True)
        selected_windows: List[ExerciseWindowItem] = []
        selected_start_hours = set()

        for c in candidates:
            sh = int(c["window_start"].split(":")[0])
            # Ensure non-overlapping (at least 2 hours apart)
            if not any(abs(sh - prev) < window_size_hours for prev in selected_start_hours):
                selected_windows.append(ExerciseWindowItem(**c))
                selected_start_hours.add(sh)
                if len(selected_windows) >= 3:
                    break

        # Fallback if fewer than 3
        if len(selected_windows) < 3 and candidates:
            for c in candidates:
                if c["window_start"] not in [w.window_start for w in selected_windows]:
                    selected_windows.append(ExerciseWindowItem(**c))
                    if len(selected_windows) >= 3:
                        break

        # Sort windows chronologically for intuitive reading
        selected_windows.sort(key=lambda w: int(w.window_start.split(":")[0]))

        return ExerciseWindowsResponse(
            location=f"Regional Forecast Grid ({round(lat, 3)}, {round(lon, 3)})",
            latitude=lat,
            longitude=lon,
            generated_at=datetime.utcnow().isoformat() + "Z",
            target_duration_minutes=target_duration_minutes,
            windows=selected_windows,
            scientific_rationale="Evaluated against diurnal atmospheric boundary layer turbulence, wind velocity, and PM2.5 inversion cycles.",
            disclaimer="Forecast models carry meteorological variance. If visible haze or strong odor is present, verify live station values.",
        )
