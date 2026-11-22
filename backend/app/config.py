from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded strictly from environment variables and .env.
    No private credentials or secret URLs are hardcoded here.
    """
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://breathewise-ai.vercel.app"
    
    # Render PostgreSQL / Database URL (loaded strictly from .env or environment)
    DATABASE_URL: str = "sqlite:///./breathewise.db"
    RENDER_POSTGRES_EXTERNAL_URL: str = ""
    RENDER_POSTGRES_INTERNAL_URL: str = ""
    
    # Groq API Key & Model (loaded strictly from .env or environment)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # External APIs
    OPENMETEO_BASE_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    OPENMETEO_WEATHER_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPENAQ_BASE_URL: str = "https://api.openaq.org/v3"
    OPENAQ_API_KEY: str = ""
    OSRM_BASE_URL: str = "https://router.project-osrm.org"
    
    # Cache settings (seconds)
    AIR_QUALITY_CACHE_TTL: int = 600  # 10 minutes
    ROUTE_CACHE_TTL: int = 1800        # 30 minutes

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def active_database_url(self) -> str:
        url = self.RENDER_POSTGRES_INTERNAL_URL or self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
