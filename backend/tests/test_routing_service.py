import pytest
from app.services.routing_service import RoutingService, EARTH_RADIUS_KM

def test_haversine_distance():
    # Chennai to Besant Nagar (approx ~9.5 km)
    lat1, lon1 = 13.0827, 80.2707
    lat2, lon2 = 13.0001, 80.2718
    dist = RoutingService.haversine_distance(lat1, lon1, lat2, lon2)
    assert 8.0 < dist < 11.0

    # Same point distance should be zero
    zero_dist = RoutingService.haversine_distance(lat1, lon1, lat1, lon1)
    assert round(zero_dist, 4) == 0.0

@pytest.mark.anyio
async def test_generate_jogging_loops_structure():
    lat, lon = 13.0827, 80.2707
    res = await RoutingService.generate_jogging_loops(
        origin_lat=lat,
        origin_lon=lon,
        target_distance_km=5.0,
        ambient_aqi=75,
        activity_type="jogging",
    )

    assert len(res.loops) == 3
    assert res.target_distance_km == 5.0
    assert res.loops[0].tag == "Lowest Exposure"
    assert res.loops[1].tag == "Greenest"
    assert res.loops[2].tag == "Fastest"
    for loop in res.loops:
        assert loop.distance_km > 0
        assert loop.exposure_score > 0
