import pytest
from app.schemas.exposure import ExposureEstimateRequest
from app.schemas.emissions import EmissionCalculateRequest
from app.services.exposure_service import ExposureService
from app.services.emissions_service import EmissionsService
from app.services.routing_service import RoutingService
from app.services.openmeteo_service import OpenMeteoService

def test_haversine_identical_coordinates():
    # Distance between identical points must be zero
    dist = RoutingService.haversine_distance(13.0827, 80.2707, 13.0827, 80.2707)
    assert dist == 0.0

def test_emissions_minimum_boundary_distance():
    req = EmissionCalculateRequest(
        distance_km=0.1,
        active_mode="walking",
        replaced_mode="petrol_car",
    )
    res = EmissionsService.calculate_avoided_emissions(req)
    assert res.co2e_saved_grams > 0.0
    assert res.co2e_saved_kg >= 0.0

def test_emissions_input_validation_zero_distance():
    with pytest.raises(Exception):
        EmissionCalculateRequest(
            distance_km=0.0,
            active_mode="walking",
            replaced_mode="petrol_car",
        )

def test_emissions_unrecognized_mode_defaulting():
    req = EmissionCalculateRequest(
        distance_km=10.0,
        active_mode="walking",
        replaced_mode="hyperloop_unknown",
    )
    res = EmissionsService.calculate_avoided_emissions(req)
    # Must fallback gracefully to standard petrol car baseline (171 g/km)
    assert res.co2e_saved_grams == 1710.0

@pytest.mark.anyio
async def test_exposure_extreme_hazardous_aqi():
    req = ExposureEstimateRequest(
        activity_type="jogging",
        duration_minutes=60,
        pm25_concentration=450.0,
        ambient_aqi=480,
        age_group="adult",
        route_traffic_factor=1.5,
    )
    res = await ExposureService.estimate_exposure(req)
    assert res.exposure_tier == "Severe"
    assert "Hazardous particulate exposure" in res.personalized_health_impact

@pytest.mark.anyio
async def test_exposure_age_group_child_differentiation():
    # Child ventilation (4.5 L/min baseline) vs Adult (6.0 L/min baseline)
    child_req = ExposureEstimateRequest(
        activity_type="walking",
        duration_minutes=30,
        pm25_concentration=50.0,
        ambient_aqi=100,
        age_group="child",
    )
    adult_req = ExposureEstimateRequest(
        activity_type="walking",
        duration_minutes=30,
        pm25_concentration=50.0,
        ambient_aqi=100,
        age_group="adult",
    )
    child_res = await ExposureService.estimate_exposure(child_req)
    adult_res = await ExposureService.estimate_exposure(adult_req)

    assert child_res.minute_ventilation_liters_per_min < adult_res.minute_ventilation_liters_per_min
    assert child_res.estimated_inhaled_pm25_ug < adult_res.estimated_inhaled_pm25_ug

def test_aqi_category_boundaries():
    assert OpenMeteoService.get_aqi_category(0) == "Good"
    assert OpenMeteoService.get_aqi_category(50) == "Good"
    assert OpenMeteoService.get_aqi_category(51) == "Moderate"
    assert OpenMeteoService.get_aqi_category(100) == "Moderate"
    assert OpenMeteoService.get_aqi_category(101) == "Unhealthy for Sensitive Groups"
    assert OpenMeteoService.get_aqi_category(151) == "Unhealthy"
    assert OpenMeteoService.get_aqi_category(201) == "Very Unhealthy"
    assert OpenMeteoService.get_aqi_category(301) == "Hazardous"
    assert OpenMeteoService.get_aqi_category(500) == "Hazardous"
