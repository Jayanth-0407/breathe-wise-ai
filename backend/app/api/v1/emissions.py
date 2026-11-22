from fastapi import APIRouter
from app.schemas.emissions import EmissionCalculateRequest, EmissionCalculateResponse
from app.services.emissions_service import EmissionsService

router = APIRouter()

@router.post("/emissions/calculate", response_model=EmissionCalculateResponse)
def calculate_emissions(req: EmissionCalculateRequest):
    return EmissionsService.calculate_avoided_emissions(req)
