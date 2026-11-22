import logging
from typing import Dict, Any
from app.schemas.exposure import ExposureEstimateRequest, ExposureEstimateResponse
from app.services.openmeteo_service import OpenMeteoService

logger = logging.getLogger(__name__)

class ExposureService:
    MET_VALUES = {
        "sedentary": 1.0,
        "walking": 3.3,
        "jogging": 7.0,
        "cycling": 5.5,
        "indoor_workout": 4.5,
    }

    BASE_VENTILATION_L_MIN = {
        "child": 4.5,
        "young_adult": 6.5,
        "adult": 6.0,
        "senior": 5.5,
    }

    @classmethod
    async def estimate_exposure(cls, req: ExposureEstimateRequest) -> ExposureEstimateResponse:
        # Determine PM2.5 and AQI
        pm25 = req.pm25_concentration
        aqi = req.ambient_aqi

        if pm25 is None or aqi is None:
            lat = req.latitude or 28.6139
            lon = req.longitude or 77.2090
            live_aq = await OpenMeteoService.get_live_air_quality(lat, lon)
            pm25 = live_aq.get("pm25", 35.0) if pm25 is None else pm25
            aqi = live_aq.get("aqi", 100) if aqi is None else aqi

        # 1. Ventilation calculations
        base_v0 = cls.BASE_VENTILATION_L_MIN.get(req.age_group.lower(), 6.0)
        met = cls.MET_VALUES.get(req.activity_type.lower(), 3.5)
        
        # Minute ventilation (L/min)
        minute_ve = round(base_v0 * met, 1)
        # Total air inhaled in cubic meters (m3) = (L/min * min) / 1000
        total_m3 = round((minute_ve * req.duration_minutes) / 1000.0, 3)

        # 2. Particulate dose intake estimate (ug)
        # Dose = Concentration (ug/m3) * Volume (m3) * Traffic proximity multiplier
        raw_intake_ug = pm25 * total_m3 * req.route_traffic_factor
        estimated_dose_ug = round(raw_intake_ug, 1)

        # 3. Exposure tier classification
        if estimated_dose_ug < 15:
            tier = "Minimal"
            health_impact = "Very low acute particulate burden. Well within normal biological clearance capacity."
        elif estimated_dose_ug < 40:
            tier = "Low"
            health_impact = "Moderate particulate intake. Generally well tolerated by healthy individuals."
        elif estimated_dose_ug < 80:
            tier = "Moderate"
            health_impact = "Elevated intake. Individuals with asthma or airway hyperreactivity may notice mild airway resistance."
        elif estimated_dose_ug < 150:
            tier = "High"
            health_impact = "Substantial particulate intake. Can induce bronchial inflammation and oxidative stress."
        else:
            tier = "Severe"
            health_impact = "Hazardous particulate exposure. Strong risk of acute respiratory and vascular strain. Outdoor cardio strongly discouraged."

        # Comparative context
        daily_who_baseline_ug = 15.0 * 12.0  # 15 ug/m3 * 12 m3 baseline adult breathing/day = 180 ug/day
        pct_who_daily = round((estimated_dose_ug / daily_who_baseline_ug) * 100, 1)
        comparative = (
            f"This {req.duration_minutes}-minute {req.activity_type} accounts for approximately "
            f"{pct_who_daily}% of the WHO recommended 24-hour total ambient particulate intake benchmark."
        )

        return ExposureEstimateResponse(
            activity_type=req.activity_type,
            duration_minutes=req.duration_minutes,
            met_value=met,
            minute_ventilation_liters_per_min=minute_ve,
            total_air_inhaled_m3=total_m3,
            ambient_pm25_ug_m3=round(pm25, 1),
            ambient_aqi=aqi,
            estimated_inhaled_pm25_ug=estimated_dose_ug,
            exposure_tier=tier,
            personalized_health_impact=health_impact,
            comparative_context=comparative,
            calculation_methodology="Inhaled Dose (µg) = PM2.5 Concentration (µg/m³) × [Minute Ventilation (L/min) × Duration (min) / 1000] × Route Factor.",
            scientific_disclaimer="Estimated particulate intake proxy. This calculation models inhaled air volume and ambient concentration; it does not measure individualized alveolar retention, blood absorption, or clinical medical risk.",
        )
