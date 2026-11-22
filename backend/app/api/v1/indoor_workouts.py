from fastapi import APIRouter, Query
from app.schemas.indoor import IndoorWorkoutResponse
from app.services.indoor_service import IndoorService

router = APIRouter()

@router.get("/indoor-workouts", response_model=IndoorWorkoutResponse)
def get_indoor_workouts(
    fitness_level: str = Query(default="intermediate"),
    duration: int = Query(default=30, ge=10, le=120),
):
    return IndoorService.get_recommendations(fitness_level=fitness_level, duration_minutes=duration)
