from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.config import settings
from app.schemas.common import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def check_health(db: Session = Depends(get_db)):
    # Verify DB connectivity
    db_status = "operational"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unreachable: {str(e)}"

    services = {
        "database": db_status,
        "openaq": "ready",
        "openmeteo": "ready",
        "osrm": "ready",
        "groq_ai": "configured" if settings.GROQ_API_KEY else "unconfigured (mock fallback)"
    }

    overall_status = "healthy" if db_status == "operational" else "degraded"

    return HealthResponse(
        status=overall_status,
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        database=settings.DATABASE_URL.split("://")[0] if "://" in settings.DATABASE_URL else "sqlite",
        timestamp=datetime.utcnow().isoformat() + "Z",
        services=services
    )
