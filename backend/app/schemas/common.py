from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    environment: str
    database: str
    timestamp: str
    services: Dict[str, str]

class APIResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None
