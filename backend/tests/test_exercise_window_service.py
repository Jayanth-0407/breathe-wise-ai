import pytest
from app.services.exercise_window_service import ExerciseWindowService
from app.services.openmeteo_service import OpenMeteoService

def test_get_aqi_category():
    assert OpenMeteoService.get_aqi_category(35) == "Good"
    assert OpenMeteoService.get_aqi_category(75) == "Moderate"
    assert OpenMeteoService.get_aqi_category(125) == "Unhealthy for Sensitive Groups"
    assert OpenMeteoService.get_aqi_category(175) == "Unhealthy"
    assert OpenMeteoService.get_aqi_category(250) == "Very Unhealthy"
    assert OpenMeteoService.get_aqi_category(350) == "Hazardous"

@pytest.mark.anyio
async def test_find_best_exercise_windows_ranking():
    # Query exercise windows for Chennai coordinates
    res = await ExerciseWindowService.find_best_exercise_windows(
        lat=13.0827,
        lon=80.2707,
        target_duration_minutes=45,
        has_asthma=False,
    )

    assert len(res.windows) >= 1
    for win in res.windows:
        assert 0 <= win.recommendation_score <= 100
        assert win.suitability in ["Optimal", "Acceptable", "Caution", "Avoid"]
        assert win.window_start != ""
