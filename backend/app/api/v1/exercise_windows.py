from fastapi import APIRouter, Query
from app.schemas.exercise_window import ExerciseWindowsResponse
from app.services.exercise_window_service import ExerciseWindowService

router = APIRouter()

@router.get("/exercise-windows", response_model=ExerciseWindowsResponse)
async def get_exercise_windows(
    lat: float = Query(default=28.6139, ge=-90, le=90),
    lon: float = Query(default=77.2090, ge=-180, le=180),
    duration: int = Query(default=45, ge=15, le=180),
    has_asthma: bool = Query(default=False),
    age_group: str = Query(default="adult"),
):
    return await ExerciseWindowService.find_best_exercise_windows(
        lat=lat,
        lon=lon,
        target_duration_minutes=duration,
        has_asthma=has_asthma,
        age_group=age_group,
    )
