from typing import Dict, Any
from app.schemas.emissions import EmissionCalculateRequest, EmissionCalculateResponse

class EmissionsService:
    # Documented emission factors per vehicle-km (DEFRA 2023 / GHG Protocol / CPCB vehicular emission inventory)
    EMISSION_FACTORS: Dict[str, Dict[str, float]] = {
        "petrol_car": {
            "co2e_per_km": 171.0,  # grams CO2e/km
            "pm25_per_km": 0.0035, # grams PM2.5/km (tailpipe + brake/tire wear)
            "nox_per_km": 0.18,    # grams NOx/km
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

    @classmethod
    def calculate_avoided_emissions(cls, req: EmissionCalculateRequest) -> EmissionCalculateResponse:
        factor = cls.EMISSION_FACTORS.get(req.replaced_mode.lower(), cls.EMISSION_FACTORS["petrol_car"])

        co2e_grams = round(factor["co2e_per_km"] * req.distance_km, 1)
        co2e_kg = round(co2e_grams / 1000.0, 3)
        pm25_grams = round(factor["pm25_per_km"] * req.distance_km, 4)
        nox_grams = round(factor["nox_per_km"] * req.distance_km, 3)

        # Comparative context
        smartphones_charged = round(co2e_grams / 8.22, 1)  # ~8.22g CO2e per full smartphone charge
        tree_absorption_days = round((co2e_kg / 21.77) * 365, 1)  # average mature tree absorbs ~21.8 kg CO2/year

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
