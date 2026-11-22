"""
BreatheWise AI - Avoided Emissions Calculation Service
======================================================
Quantifies personal environmental dividend gained by choosing active mobility
(walking, jogging, cycling) in place of vehicular transit.

Emission Factors Reference:
---------------------------
- UK DEFRA Greenhouse Gas Conversion Factors for Company Reporting (2023)
- Central Pollution Control Board (CPCB) Vehicular Emission Inventory (India)
- International Energy Agency (IEA) Well-to-Wheel mobility metrics

Scientific Distinction:
-----------------------
- CO2e (Greenhouse Gas): Global global-warming potential, persistent atmospheric life.
- PM2.5 and NOx: Local criteria pollutants causing acute pulmonary and cardiovascular inflammation.
"""

from typing import Dict, Final
from app.schemas.emissions import EmissionCalculateRequest, EmissionCalculateResponse

# Physical Conversion Constants
GRAMS_PER_KILOGRAM: Final[float] = 1000.0
DAYS_PER_YEAR: Final[float] = 365.0

# Comparative Equivalency Benchmarks
# Reference: EPA Greenhouse Gas Equivalencies Calculator
CO2E_PER_SMARTPHONE_CHARGE_GRAMS: Final[float] = 8.22
# Average mature tree annual CO2 sequestration (kg/year)
MATURE_TREE_ANNUAL_CO2_SEQUESTRATION_KG: Final[float] = 21.77

# Documented emission factors per vehicle-km
EMISSION_FACTORS: Final[Dict[str, Dict[str, float | str]]] = {
    "petrol_car": {
        "co2e_per_km": 171.0,   # grams CO2e/km
        "pm25_per_km": 0.0035,  # grams PM2.5/km (tailpipe + brake/tire wear)
        "nox_per_km": 0.18,     # grams NOx/km
        "label": "Average Petrol Passenger Car",
    },
    "diesel_car": {
        "co2e_per_km": 165.0,
        "pm25_per_km": 0.0085,
        "nox_per_km": 0.42,
        "label": "Diesel Passenger Car",
    },
    "auto_rickshaw": {
        "co2e_per_km": 82.0,
        "pm25_per_km": 0.0015,
        "nox_per_km": 0.12,
        "label": "CNG Auto-Rickshaw / Micro-Transit",
    },
    "motorbike": {
        "co2e_per_km": 103.0,
        "pm25_per_km": 0.0025,
        "nox_per_km": 0.09,
        "label": "Two-Wheeler Motorbike / Scooter",
    },
}
DEFAULT_VEHICLE_FACTOR_KEY: Final[str] = "petrol_car"


class EmissionsService:
    """Service quantifying avoided greenhouse gas and local air toxic emissions."""

    @classmethod
    def calculate_avoided_emissions(cls, req: EmissionCalculateRequest) -> EmissionCalculateResponse:
        """
        Computes avoided CO2e, PM2.5, and NOx for a given distance and replaced transport mode.

        Args:
            req: EmissionCalculateRequest containing distance in km, active mode, and replaced mode.

        Returns:
            EmissionCalculateResponse with quantified masses and tangible real-world equivalents.
        """
        factor = EMISSION_FACTORS.get(req.replaced_mode.lower(), EMISSION_FACTORS[DEFAULT_VEHICLE_FACTOR_KEY])

        co2e_grams = round(float(factor["co2e_per_km"]) * req.distance_km, 1)
        co2e_kg = round(co2e_grams / GRAMS_PER_KILOGRAM, 3)
        pm25_grams = round(float(factor["pm25_per_km"]) * req.distance_km, 4)
        nox_grams = round(float(factor["nox_per_km"]) * req.distance_km, 3)

        # Tangible equivalency metrics
        smartphones_charged = round(co2e_grams / CO2E_PER_SMARTPHONE_CHARGE_GRAMS, 1)
        tree_absorption_days = round(
            (co2e_kg / MATURE_TREE_ANNUAL_CO2_SEQUESTRATION_KG) * DAYS_PER_YEAR, 1
        )

        comparative = (
            f"By choosing to {req.active_mode} {req.distance_km} km instead of driving a {factor['label']}, "
            f"you prevented {co2e_kg} kg of CO2e (equivalent to charging {smartphones_charged} smartphones) "
            f"and eliminated {pm25_grams} g of toxic tailpipe PM2.5 from neighborhood street air."
        )

        methodology = (
            f"Calculation: Avoided CO2e = Distance ({req.distance_km} km) × Factor ({factor['co2e_per_km']} g/km). "
            f"Source factors derived from UK DEFRA Greenhouse Gas Conversion Factors and CPCB Vehicular Emission Inventories."
        )

        scientific_distinction = (
            "Scientific Distinction: CO2e represents global climate warming potential (GHG). "
            "PM2.5 and NOx represent acute, localized toxic pollutants causing direct respiratory inflammation. "
            "These metrics are distinct and not interchangeable."
        )

        return EmissionCalculateResponse(
            distance_km=req.distance_km,
            active_mode=req.active_mode,
            replaced_mode=req.replaced_mode,
            co2e_saved_grams=co2e_grams,
            co2e_saved_kg=co2e_kg,
            local_pm25_avoided_grams=pm25_grams,
            local_nox_avoided_grams=nox_grams,
            comparative_context=comparative,
            methodology=methodology,
            scientific_distinction=scientific_distinction,
        )
