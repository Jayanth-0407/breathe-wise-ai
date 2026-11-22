import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.exceptions import (
    ExternalAPIException,
    external_api_exception_handler,
    generic_exception_handler
)
from app.db.session import init_db
from app.api.v1.health import router as health_router
from app.api.v1.air_quality import router as air_quality_router
from app.api.v1.routes import router as routes_router
from app.api.v1.user import router as user_router
from app.api.v1.exercise_windows import router as exercise_windows_router
from app.api.v1.exposure import router as exposure_router
from app.api.v1.chat import router as chat_router
from app.api.v1.indoor_workouts import router as indoor_workouts_router
from app.api.v1.activity import router as activity_router
from app.api.v1.emissions import router as emissions_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("breathewise")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing BreatheWise AI backend services...")
    try:
        init_db()
    except Exception as e:
        logger.warning(f"Database initialization deferred: {e}")
    logger.info("BreatheWise AI backend ready to receive requests.")
    yield
    # Shutdown
    logger.info("Shutting down BreatheWise AI backend...")

app = FastAPI(
    title="BreatheWise AI Backend API",
    description="Pollution-Aware Fitness & Mobility Assistant Backend with LangGraph & Groq AI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware - allows localhost and any Vercel production/preview domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127.0.0.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Exception Handlers
app.add_exception_handler(ExternalAPIException, external_api_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Root health check endpoints
app.include_router(health_router, prefix="", tags=["Health"])
app.include_router(health_router, prefix="/api/v1", tags=["Health"])

# Core Application Endpoints
app.include_router(air_quality_router, prefix="/api/v1", tags=["Air Quality"])
app.include_router(routes_router, prefix="/api/v1", tags=["Routing"])
app.include_router(user_router, prefix="/api/v1", tags=["User Profile"])

# Intelligence & AI Endpoints
app.include_router(exercise_windows_router, prefix="/api/v1", tags=["Exercise Windows"])
app.include_router(exposure_router, prefix="/api/v1", tags=["Exposure Estimation"])
app.include_router(chat_router, prefix="/api/v1", tags=["AI Assistant"])

# Additional Workouts, Tracking, and Emissions Endpoints
app.include_router(indoor_workouts_router, prefix="/api/v1", tags=["Indoor Workouts"])
app.include_router(activity_router, prefix="/api/v1", tags=["Activity Tracking"])
app.include_router(emissions_router, prefix="/api/v1", tags=["Emissions Calculator"])

@app.get("/")
def root():
    return {
        "name": "BreatheWise AI API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/health"
    }
