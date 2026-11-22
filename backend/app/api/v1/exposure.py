from fastapi import APIRouter
from app.schemas.exposure import ExposureEstimateRequest, ExposureEstimateResponse
from app.services.exposure_service import ExposureService

router = APIRouter()

@router.post("/exposure/estimate", response_model=ExposureEstimateResponse)
async def estimate_pollution_exposure(req: ExposureEstimateRequest):
    return await ExposureService.estimate_exposure(req)
