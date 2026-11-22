import pytest
from app.schemas.emissions import EmissionCalculateRequest
from app.services.emissions_service import (
    EmissionsService,
    EMISSION_FACTORS,
    GRAMS_PER_KILOGRAM,
)

def test_calculate_avoided_emissions_petrol_car():
    req = EmissionCalculateRequest(
        distance_km=10.0,
        active_mode="jogging",
        replaced_mode="petrol_car",
    )

    res = EmissionsService.calculate_avoided_emissions(req)

    # Petrol car: 171.0 g CO2e / km * 10 km = 1710.0 g = 1.71 kg
    assert res.co2e_saved_grams == 1710.0
    assert res.co2e_saved_kg == 1.71
    # PM2.5: 0.0035 * 10 = 0.035 g
    assert res.local_pm25_avoided_grams == 0.035
    # NOx: 0.18 * 10 = 1.8 g
    assert res.local_nox_avoided_grams == 1.8
    assert "petrol" in res.comparative_context.lower()

def test_calculate_avoided_emissions_fallback():
    req = EmissionCalculateRequest(
        distance_km=5.0,
        active_mode="walking",
        replaced_mode="unrecognized_mode",
    )

    res = EmissionsService.calculate_avoided_emissions(req)
    # Defaults to petrol car
    assert res.co2e_saved_grams == 855.0
