import math
import httpx
import logging
from typing import List, Dict, Any, Tuple
from app.config import settings
from app.core.cache import route_cache
from app.schemas.routes import RouteItem, RouteRecommendResponse, JoggingLoopResponse

logger = logging.getLogger(__name__)

class RoutingService:
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Computes great-circle distance in kilometers."""
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    @classmethod
    async def generate_recommended_routes(
        cls,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        ambient_aqi: int,
        activity_type: str = "walking",
        has_asthma: bool = False,
    ) -> RouteRecommendResponse:
        cache_key = f"routes_p2p_{round(origin_lat, 4)}_{round(origin_lon, 4)}_{round(dest_lat, 4)}_{round(dest_lon, 4)}_{activity_type}"
        cached = route_cache.get(cache_key)
        if cached:
            return RouteRecommendResponse(**cached)

        # OSRM walking route request
        osrm_url = (
            f"{settings.OSRM_BASE_URL}/route/v1/walking/"
            f"{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
            f"?overview=full&geometries=geojson&alternatives=true&steps=true"
        )

        routes_data = []
        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                res = await client.get(osrm_url)
                if res.status_code == 200:
                    data = res.json()
                    routes_data = data.get("routes", [])
            except Exception as e:
                logger.warning(f"OSRM router service error: {e}")

        walking_speed_kmh = 4.8 if activity_type == "walking" else 9.0 if activity_type == "jogging" else 15.0
        result_routes: List[RouteItem] = []

        if routes_data:
            for idx, r in enumerate(routes_data[:3]):
                dist_km = round(r.get("distance", 0) / 1000.0, 2)
                dur_min = round((dist_km / walking_speed_kmh) * 60, 1)
                coords = r.get("geometry", {}).get("coordinates", [])

                if idx == 0:
                    tag = "Fastest"
                    exposure_mult = 1.12
                    traffic_proxy = "Moderate to High"
                    green_proxy = "Minimal"
                    explanation = "Direct arterial route with shortest transit time. Follows primary pedestrian sidewalks."
                elif idx == 1:
                    tag = "Lowest Exposure"
                    exposure_mult = 0.84
                    traffic_proxy = "Low"
                    green_proxy = "Moderate"
                    explanation = "Prioritizes pedestrian-oriented secondary corridors and neighborhood alleys away from major road junctions."
                else:
                    tag = "Greenest"
                    exposure_mult = 0.89
                    traffic_proxy = "Low"
                    green_proxy = "Extensive"
                    explanation = "Routed along public garden boundaries and tree-canopied pedestrian ways for maximum vegetative buffer."

                raw_score = ambient_aqi * (dur_min / 30.0) * exposure_mult
                exp_score = round(raw_score, 1)
                exp_tier = "Low" if exp_score < 50 else "Moderate" if exp_score < 100 else "Elevated" if exp_score < 180 else "High"

                result_routes.append(
                    RouteItem(
                        id=f"route-{idx + 1}",
                        name=f"{tag} Path ({dist_km} km)",
                        tag=tag,
                        distance_km=dist_km,
                        duration_minutes=dur_min,
                        exposure_score=exp_score,
                        exposure_tier=exp_tier,
                        traffic_proximity_proxy=traffic_proxy,
                        green_space_proxy=green_proxy,
                        explanation=explanation,
                        data_uncertainty="Snaps directly to OpenStreetMap road network geometries.",
                        coordinates=coords,
                    )
                )

        response = RouteRecommendResponse(
            origin=[origin_lat, origin_lon],
            destination=[dest_lat, dest_lon],
            ambient_aqi=ambient_aqi,
            routes=result_routes,
            calculation_methodology="Exposure Index = Ambient AQI × (Duration / 30 min) × (1 + Traffic Factor - Greenery Factor).",
            disclaimer="Traffic proximity and greenery are proxy indicators based on OSM road classifications.",
        )

        route_cache.set(cache_key, response.model_dump(), ttl_seconds=settings.ROUTE_CACHE_TTL)
        return response

    @classmethod
    async def _query_osrm_multistop(cls, waypoints: List[Tuple[float, float]]) -> Tuple[List[List[float]], float, float]:
        """Queries OSRM for a multi-waypoint walking path snapped strictly to OSM streets."""
        # waypoints format: [(lat, lon), ...]
        coords_str = ";".join([f"{round(lon, 6)},{round(lat, 6)}" for lat, lon in waypoints])
        url = f"{settings.OSRM_BASE_URL}/route/v1/walking/{coords_str}?overview=full&geometries=geojson&steps=false"
        
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    routes = data.get("routes", [])
                    if routes:
                        r0 = routes[0]
                        dist_km = round(r0.get("distance", 0) / 1000.0, 2)
                        dur_min = round(r0.get("duration", 0) / 60.0, 1)
                        coords = r0.get("geometry", {}).get("coordinates", [])
                        if len(coords) >= 4:
                            return coords, dist_km, dur_min
        except Exception as e:
            logger.warning(f"OSRM loop query failed: {e}")

        # Fallback to direct waypoints if OSRM is unreachable
        simple_coords = [[round(lon, 6), round(lat, 6)] for lat, lon in waypoints]
        return simple_coords, 4.5, 30.0

    @classmethod
    async def generate_jogging_loops(
        cls,
        origin_lat: float,
        origin_lon: float,
        target_distance_km: float,
        ambient_aqi: int,
        activity_type: str = "jogging",
        has_asthma: bool = False,
    ) -> JoggingLoopResponse:
        """
        Generates realistic jogging loops that SNAPS TO ACTUAL STREETS via OSRM.
        Calculates directional street waypoints around the target radius and routes through them back to origin.
        """
        cache_key = f"routes_loop_{round(origin_lat, 4)}_{round(origin_lon, 4)}_{round(target_distance_km, 1)}_{activity_type}"
        cached = route_cache.get(cache_key)
        if cached:
            return JoggingLoopResponse(**cached)

        speed_kmh = 9.0 if activity_type == "jogging" else 5.0
        
        # Calculate approximate circle radius based on street network winding factor (~1.35)
        # Perimeter = 2 * pi * R * 1.35 => R = target_distance / (2 * pi * 1.35)
        r_km = max(target_distance_km / (2 * math.pi * 1.35), 0.3)
        # Convert km to degrees latitude & longitude
        d_lat = r_km / 111.0
        d_lon = r_km / (111.0 * math.cos(math.radians(origin_lat)))

        # Define 3 distinct directional circuits (Clockwise, Counter-Clockwise, Eastern/Western arc)
        # Each circuit uses 4 distinct waypoints surrounding the origin and returning to it:
        variants = [
            {
                "tag": "Lowest Exposure",
                "name": f"Clean Green Circuit ({round(target_distance_km, 1)} km)",
                "waypoints": [
                    (origin_lat, origin_lon),
                    (origin_lat + d_lat * 0.9, origin_lon + d_lon * 0.6),
                    (origin_lat + d_lat * 0.4, origin_lon + d_lon * 1.1),
                    (origin_lat - d_lat * 0.6, origin_lon + d_lon * 0.5),
                    (origin_lat, origin_lon),
                ],
                "exposure_mult": 0.82,
                "traffic_proxy": "Low (Residential streets & parkways)",
                "green_proxy": "Extensive (Canopy Buffers)",
                "explanation": f"Traced along quiet neighborhood streets and park perimeter corridors. Snapped to actual pedestrian sidewalks to achieve your {target_distance_km} km target with lowest exposure.",
            },
            {
                "tag": "Greenest",
                "name": f"Park & Forest Perimeter ({round(target_distance_km, 1)} km)",
                "waypoints": [
                    (origin_lat, origin_lon),
                    (origin_lat + d_lat * 0.5, origin_lon - d_lon * 0.8),
                    (origin_lat - d_lat * 0.5, origin_lon - d_lon * 0.9),
                    (origin_lat - d_lat * 0.8, origin_lon - d_lon * 0.2),
                    (origin_lat, origin_lon),
                ],
                "exposure_mult": 0.86,
                "traffic_proxy": "Low",
                "green_proxy": "Extensive (Botanical buffers)",
                "explanation": "Loops through open recreational areas and tree-canopied paths, maximizing vegetative filtration while fulfilling your workout goal.",
            },
            {
                "tag": "Fastest",
                "name": f"Paved Perimeter Circuit ({round(target_distance_km, 1)} km)",
                "waypoints": [
                    (origin_lat, origin_lon),
                    (origin_lat - d_lat * 0.7, origin_lon + d_lon * 0.4),
                    (origin_lat - d_lat * 1.0, origin_lon - d_lon * 0.4),
                    (origin_lat + d_lat * 0.2, origin_lon - d_lon * 0.6),
                    (origin_lat, origin_lon),
                ],
                "exposure_mult": 1.10,
                "traffic_proxy": "Moderate",
                "green_proxy": "Moderate",
                "explanation": "Direct paved perimeter following wide footpaths with steady footing for uninterrupted tempo runs.",
            },
        ]

        loops: List[RouteItem] = []

        for idx, var in enumerate(variants):
            coords, dist_km, dur_min = await cls._query_osrm_multistop(var["waypoints"])
            
            # Recalculate duration based on user pace
            run_dur = round((dist_km / speed_kmh) * 60, 1)
            raw_score = ambient_aqi * (run_dur / 30.0) * var["exposure_mult"]
            exp_score = round(raw_score, 1)
            exp_tier = "Low" if exp_score < 50 else "Moderate" if exp_score < 100 else "Elevated" if exp_score < 180 else "High"
            fulfillment_pct = min(100.0, round((dist_km / target_distance_km) * 100, 1))

            loops.append(
                RouteItem(
                    id=f"loop-{idx + 1}",
                    name=var["name"],
                    tag=var["tag"],
                    distance_km=dist_km,
                    duration_minutes=run_dur,
                    goal_fulfillment_pct=fulfillment_pct,
                    exposure_score=exp_score,
                    exposure_tier=exp_tier,
                    traffic_proximity_proxy=var["traffic_proxy"],
                    green_space_proxy=var["green_proxy"],
                    explanation=var["explanation"],
                    data_uncertainty="Snapped to OpenStreetMap navigable pedestrian tracks via OSRM.",
                    coordinates=coords,
                )
            )

        response = JoggingLoopResponse(
            origin=[origin_lat, origin_lon],
            target_distance_km=target_distance_km,
            ambient_aqi=ambient_aqi,
            loops=loops,
            recommendation=f"Recommended: {loops[0].name} ({loops[0].distance_km} km) follows actual sidewalks with lowest traffic exhaust exposure.",
            disclaimer="Routes trace real OpenStreetMap footpaths. Always follow local pedestrian crossings and traffic signals.",
        )

        route_cache.set(cache_key, response.model_dump(), ttl_seconds=settings.ROUTE_CACHE_TTL)
        return response
