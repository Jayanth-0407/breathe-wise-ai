from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_indoor_workouts():
    response = client.get("/api/v1/indoor-workouts?fitness_level=intermediate&duration=30")
    assert response.status_code == 200
    data = response.json()
    assert "routines" in data
    assert len(data["routines"]) >= 1
    assert "clean_indoor_air_protocol" in data
    assert len(data["clean_indoor_air_protocol"]) >= 3
    assert "hepa_guidance" in data

def test_activity_logging_and_summary():
    # 1. Log an activity
    payload = {
        "user_id": "test-athlete-1",
        "activity_type": "jogging",
        "duration_minutes": 35,
        "distance_km": 5.2,
        "estimated_aqi": 85.0,
        "exposure_score": 42.0,
        "location_name": "Lodhi Gardens Circuit",
        "notes": "Felt great, clear air morning."
    }
    res_log = client.post("/api/v1/activities", json=payload)
    assert res_log.status_code == 200
    item = res_log.json()
    assert item["activity_type"] == "jogging"
    assert item["duration_minutes"] == 35

    # 2. Get activities and summary
    res_list = client.get("/api/v1/activities?user_id=test-athlete-1")
    assert res_list.status_code == 200
    list_data = res_list.json()
    assert len(list_data["activities"]) >= 1
    assert list_data["summary"]["total_duration_minutes"] >= 35
    assert list_data["summary"]["total_distance_km"] >= 5.2

def test_emissions_calculator():
    payload = {
        "distance_km": 5.0,
        "active_mode": "cycling",
        "replaced_mode": "petrol_car"
    }
    response = client.post("/api/v1/emissions/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "co2e_saved_grams" in data
    assert data["co2e_saved_grams"] > 800  # 5km * ~171g = ~855g
    assert "local_pm25_avoided_grams" in data
    assert "scientific_distinction" in data
