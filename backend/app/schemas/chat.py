from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Citation(BaseModel):
    title: str
    source: str
    url: Optional[str] = None
    snippet: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    user_id: Optional[str] = "guest-user"
    latitude: Optional[float] = 13.0827
    longitude: Optional[float] = 80.2707
    location_name: Optional[str] = "Chennai"
    city_name: Optional[str] = "Chennai"
    conversation_history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    response: str
    citations: List[Citation] = []
    tools_used: List[str] = []
    suggested_actions: List[str] = []
    disclaimer: str = "AI guidance is grounded in environmental guidelines (WHO, CPCB, EPA). It does not substitute professional medical advice."
