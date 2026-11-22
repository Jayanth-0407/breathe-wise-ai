from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.graph import AgentGraphWorkflow

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(req: ChatRequest):
    return await AgentGraphWorkflow.run(
        user_message=req.message,
        lat=req.latitude or 13.0827,
        lon=req.longitude or 80.2707,
        location_name=req.location_name or "Chennai",
        city_name=req.city_name or req.location_name or "Chennai",
        history=req.conversation_history,
    )
