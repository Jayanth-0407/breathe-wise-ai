from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_exercise_windows():
    response = client.get("/api/v1/exercise-windows?lat=28.6139&lon=77.2090&duration=45")
    assert response.status_code == 200
    data = response.json()
    assert "windows" in data
    assert len(data["windows"]) >= 1
    w0 = data["windows"][0]
    assert "window_start" in w0
    assert "avg_aqi" in w0
    assert "recommendation_score" in w0
    assert "suitability" in w0

def test_exposure_estimation():
    payload = {
        "activity_type": "jogging",
        "duration_minutes": 30,
        "ambient_aqi": 120,
        "pm25_concentration": 45.0,
        "route_traffic_factor": 1.0,
        "has_asthma": False,
        "age_group": "adult"
    }
    response = client.post("/api/v1/exposure/estimate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "estimated_inhaled_pm25_ug" in data
    assert data["estimated_inhaled_pm25_ug"] > 0
    assert "minute_ventilation_liters_per_min" in data
    assert "exposure_tier" in data

def test_chat_with_agent():
    payload = {
        "message": "Is an N95 mask effective for running when AQI is 200?",
        "latitude": 28.6139,
        "longitude": 77.2090,
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert len(data["response"]) > 20
    assert "citations" in data
    assert len(data["citations"]) >= 1
    # Verify citation title or source
    assert "WHO" in data["citations"][0]["title"] or "CDC" in data["citations"][0]["source"] or "Particulate" in data["citations"][0]["title"]
