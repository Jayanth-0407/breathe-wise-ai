import pytest
from app.schemas.exposure import ExposureEstimateRequest
from app.services.exposure_service import (
    ExposureService,
    BASE_VENTILATION_L_MIN,
    MET_VALUES,
    LITERS_PER_CUBIC_METER,
)

@pytest.mark.anyio
async def test_estimate_exposure_calculation():
    # 30-minute jogging session for an adult at 50 ug/m3 PM2.5
    req = ExposureEstimateRequest(
        activity_type="jogging",
        duration_minutes=30,
        pm25_concentration=50.0,
        ambient_aqi=130,
        age_group="adult",
        route_traffic_factor=1.0,
    )

    res = await ExposureService.estimate_exposure(req)

    # Minute ventilation = 6.0 (adult) * 7.0 (jogging) = 42.0 L/min
    assert res.minute_ventilation_liters_per_min == 42.0
    # Inhaled air = (42.0 * 30) / 1000 = 1.26 m3
    assert res.total_air_inhaled_m3 == 1.26
    # Estimated dose = 50.0 * 1.26 * 1.0 = 63.0 ug
    assert res.estimated_inhaled_pm25_ug == 63.0
    # Tier for 63.0 ug is Moderate (40 <= dose < 80)
    assert res.exposure_tier == "Moderate"
    assert "asthma or airway" in res.personalized_health_impact

@pytest.mark.anyio
async def test_minimal_exposure_tier():
    req = ExposureEstimateRequest(
        activity_type="walking",
        duration_minutes=10,
        pm25_concentration=10.0,
        ambient_aqi=35,
        age_group="adult",
        route_traffic_factor=0.85,
    )

    res = await ExposureService.estimate_exposure(req)
    assert res.exposure_tier == "Minimal"
    assert res.estimated_inhaled_pm25_ug < 15.0
