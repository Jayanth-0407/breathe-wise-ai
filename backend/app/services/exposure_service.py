"""
BreatheWise AI - Exposure Calculation Service
=============================================
Computes estimated inhaled particulate matter (PM2.5) intake dose during outdoor
physical activities based on human ventilation physiology, metabolic equivalents (MET),
ambient particulate concentrations, and micro-environmental route exposure factors.

Mathematical Formulation:
-------------------------
1. Minute Ventilation (V_E):
   V_E = V_0 * MET   [L/min]
   where V_0 is age-adjusted baseline resting ventilation.

2. Inhaled Air Volume (V):
   V = (V_E * duration_minutes) / 1000.0   [m³]

3. Inhaled Particulate Dose:
   Dose (µg) = C_ambient (µg/m³) * V (m³) * f_traffic
   where f_traffic is the micro-environmental corridor proximity modifier.
"""

import logging
from typing import Dict, Final
from app.schemas.exposure import ExposureEstimateRequest, ExposureEstimateResponse
from app.services.openmeteo_service import OpenMeteoService

logger = logging.getLogger(__name__)

# --- Physiological and Exposure Constants ---
LITERS_PER_CUBIC_METER: Final[float] = 1000.0

# Metabolic Equivalent of Task (MET) baselines
# Reference: 2024 Compendium of Physical Activities
MET_VALUES: Final[Dict[str, float]] = {
    "sedentary": 1.0,
    "walking": 3.3,
    "jogging": 7.0,
    "cycling": 5.5,
    "indoor_workout": 4.5,
}
DEFAULT_MET_VALUE: Final[float] = 3.5

# Baseline Resting Minute Ventilation (V_0 in L/min) stratified by age group
# Reference: EPA Exposure Factors Handbook & ICRP Human Respiratory Tract Model
BASE_VENTILATION_L_MIN: Final[Dict[str, float]] = {
    "child": 4.5,
    "young_adult": 6.5,
    "adult": 6.0,
    "senior": 5.5,
}
DEFAULT_BASE_VENTILATION_L_MIN: Final[float] = 6.0

# World Health Organization (WHO) 2021 Air Quality Guideline Baselines
# 24-hour mean guideline: 15 µg/m³; Standard adult respiratory volume: 12 m³/day
WHO_24H_PM25_GUIDELINE_UG_M3: Final[float] = 15.0
ADULT_DAILY_AIR_VOLUME_M3: Final[float] = 12.0
DAILY_WHO_BASELINE_INTAKE_UG: Final[float] = WHO_24H_PM25_GUIDELINE_UG_M3 * ADULT_DAILY_AIR_VOLUME_M3  # 180.0 µg/day

# Inhaled PM2.5 Acute Exposure Tiers (µg)
EXPOSURE_TIER_MINIMAL_MAX_UG: Final[float] = 15.0
EXPOSURE_TIER_LOW_MAX_UG: Final[float] = 40.0
EXPOSURE_TIER_MODERATE_MAX_UG: Final[float] = 80.0
EXPOSURE_TIER_HIGH_MAX_UG: Final[float] = 150.0

# Geographic Fallback Coordinates (Delhi NCR center)
DEFAULT_FALLBACK_LATITUDE: Final[float] = 28.6139
DEFAULT_FALLBACK_LONGITUDE: Final[float] = 77.2090
DEFAULT_FALLBACK_PM25: Final[float] = 35.0
DEFAULT_FALLBACK_AQI: Final[int] = 100


class ExposureService:
    """Service providing physiological particulate dose estimation and risk stratification."""

    @classmethod
    async def estimate_exposure(cls, req: ExposureEstimateRequest) -> ExposureEstimateResponse:
        """
        Calculates personal inhaled PM2.5 mass intake and assigns a health exposure tier.

        Args:
            req: ExposureEstimateRequest containing activity type, duration,
                 location/concentration, and user vulnerability profiles.

        Returns:
            ExposureEstimateResponse containing minute ventilation, total air volume,
            calculated particulate dose (µg), and comparative context.
        """
        # Determine PM2.5 and AQI from request or fetch real-time atmospheric data
        pm25 = req.pm25_concentration
        aqi = req.ambient_aqi

        if pm25 is None or aqi is None:
            lat = req.latitude or DEFAULT_FALLBACK_LATITUDE
            lon = req.longitude or DEFAULT_FALLBACK_LONGITUDE
            live_aq = await OpenMeteoService.get_live_air_quality(lat, lon)
            pm25 = live_aq.get("pm25", DEFAULT_FALLBACK_PM25) if pm25 is None else pm25
            aqi = live_aq.get("aqi", DEFAULT_FALLBACK_AQI) if aqi is None else aqi

        # 1. Ventilation volume calculations
        base_v0 = BASE_VENTILATION_L_MIN.get(req.age_group.lower(), DEFAULT_BASE_VENTILATION_L_MIN)
        met = MET_VALUES.get(req.activity_type.lower(), DEFAULT_MET_VALUE)

        # Minute ventilation (L/min)
        minute_ve = round(base_v0 * met, 1)
        # Total air inhaled in cubic meters (m³)
        total_m3 = round((minute_ve * req.duration_minutes) / LITERS_PER_CUBIC_METER, 3)

        # 2. Particulate dose intake estimate (µg)
        # Dose = Concentration (µg/m³) * Volume (m³) * Traffic proximity multiplier
        raw_intake_ug = pm25 * total_m3 * req.route_traffic_factor
        estimated_dose_ug = round(raw_intake_ug, 1)

        # 3. Exposure tier classification and personalized health impact
        if estimated_dose_ug < EXPOSURE_TIER_MINIMAL_MAX_UG:
            tier = "Minimal"
            health_impact = (
                "Very low acute particulate burden. Well within normal biological clearance capacity."
            )
        elif estimated_dose_ug < EXPOSURE_TIER_LOW_MAX_UG:
            tier = "Low"
            health_impact = (
                "Moderate particulate intake. Generally well tolerated by healthy individuals."
            )
        elif estimated_dose_ug < EXPOSURE_TIER_MODERATE_MAX_UG:
            tier = "Moderate"
            health_impact = (
                "Elevated intake. Individuals with asthma or airway hyperreactivity may notice mild airway resistance."
            )
        elif estimated_dose_ug < EXPOSURE_TIER_HIGH_MAX_UG:
            tier = "High"
            health_impact = (
                "Substantial particulate intake. Can induce bronchial inflammation and oxidative stress."
            )
        else:
            tier = "Severe"
            health_impact = (
                "Hazardous particulate exposure. Strong risk of acute respiratory and vascular strain. "
                "Outdoor cardio strongly discouraged."
            )

        # 4. Comparative benchmark against WHO daily ambient intake guideline
        pct_who_daily = round((estimated_dose_ug / DAILY_WHO_BASELINE_INTAKE_UG) * 100, 1)
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
            calculation_methodology=(
                "Inhaled Dose (µg) = PM2.5 Concentration (µg/m³) × "
                "[Minute Ventilation (L/min) × Duration (min) / 1000] × Route Factor."
            ),
            scientific_disclaimer=(
                "Estimated particulate intake proxy. This calculation models inhaled air volume and "
                "ambient concentration; it does not measure individualized alveolar retention, "
                "blood absorption, or clinical medical risk."
            ),
        )
