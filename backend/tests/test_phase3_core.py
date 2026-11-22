from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_live_air_quality():
    response = client.get("/api/v1/air-quality/live?lat=28.6139&lon=77.2090&has_asthma=true")
    assert response.status_code == 200
    data = response.json()
    assert "aqi" in data
    assert "category" in data
    assert "personalized_guidance" in data
    assert "source" in data
    assert isinstance(data["aqi"], int)

def test_air_quality_forecast():
    response = client.get("/api/v1/air-quality/forecast?lat=28.6139&lon=77.2090&days=1")
    assert response.status_code == 200
    data = response.json()
    assert "hourly" in data
    assert len(data["hourly"]) > 0
    assert "pm25" in data["hourly"][0]

def test_route_recommendation():
    payload = {
        "origin_lat": 28.6139,
        "origin_lon": 77.2090,
        "destination_lat": 28.6304,
        "destination_lon": 77.2177,
        "activity_type": "walking",
        "has_asthma": False,
        "age_group": "adult"
    }
    response = client.post("/api/v1/routes/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data
    assert len(data["routes"]) >= 1
    route = data["routes"][0]
    assert "exposure_score" in route
    assert "coordinates" in route
    assert "traffic_proximity_proxy" in route
    assert "green_space_proxy" in route

def test_jogging_loop_recommendation():
    payload = {
        "origin_lat": 28.5933,
        "origin_lon": 77.2197,
        "target_distance_km": 5.0,
        "activity_type": "jogging",
        "has_asthma": False,
        "age_group": "adult"
    }
    response = client.post("/api/v1/routes/jogging-loop", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "loops" in data
    assert len(data["loops"]) >= 1
    loop = data["loops"][0]
    assert "exposure_score" in loop
    assert "goal_fulfillment_pct" in loop
    assert loop["goal_fulfillment_pct"] >= 90.0
    assert "coordinates" in loop
    assert len(loop["coordinates"]) > 10

def test_user_profile_crud():
    # Fetch default profile
    res1 = client.get("/api/v1/user/profile/test-user-1")
    assert res1.status_code == 200
    p1 = res1.json()
    assert p1["user_id"] == "test-user-1"

    # Save profile
    save_payload = {
        "user_id": "test-user-1",
        "age_group": "senior",
        "has_asthma": True,
        "respiratory_conditions": ["mild_asthma"],
        "fitness_level": "intermediate",
        "preferred_activities": ["walking"],
        "daily_activity_goal_minutes": 45,
        "preferred_duration_minutes": 30,
        "default_city": "Mumbai",
        "default_lat": 19.0760,
        "default_lon": 72.8777
    }
    res2 = client.post("/api/v1/user/profile", json=save_payload)
    assert res2.status_code == 200
    p2 = res2.json()
    assert p2["age_group"] == "senior"
    assert p2["has_asthma"] is True
    assert p2["default_city"] == "Mumbai"
