from fastapi import APIRouter
from app.schemas.routes import (
    RouteRequest, 
    RouteRecommendResponse, 
    JoggingLoopRequest, 
    JoggingLoopResponse
)
from app.services.routing_service import RoutingService
from app.services.openmeteo_service import OpenMeteoService

router = APIRouter()

@router.post("/routes/recommend", response_model=RouteRecommendResponse)
async def recommend_routes(req: RouteRequest):
    aq_data = await OpenMeteoService.get_live_air_quality(req.origin_lat, req.origin_lon)
    ambient_aqi = aq_data.get("aqi", 75)

    result = await RoutingService.generate_recommended_routes(
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        dest_lat=req.destination_lat,
        dest_lon=req.destination_lon,
        ambient_aqi=ambient_aqi,
        activity_type=req.activity_type,
        has_asthma=req.has_asthma,
    )
    return result

@router.post("/routes/jogging-loop", response_model=JoggingLoopResponse)
async def generate_jogging_loop(req: JoggingLoopRequest):
    aq_data = await OpenMeteoService.get_live_air_quality(req.origin_lat, req.origin_lon)
    ambient_aqi = aq_data.get("aqi", 75)

    result = await RoutingService.generate_jogging_loops(
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        target_distance_km=req.target_distance_km,
        ambient_aqi=ambient_aqi,
        activity_type=req.activity_type,
        has_asthma=req.has_asthma,
    )
    return result
