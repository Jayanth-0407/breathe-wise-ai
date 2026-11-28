from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.agent import run_adk_chat
from app.ai.graph import AgentGraphWorkflow

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(req: ChatRequest):
    # 1. Primary execution via Google ADK Agent (with Google Search & custom tools)
    adk_response = await run_adk_chat(
        user_message=req.message,
        lat=req.latitude or 13.0827,
        lon=req.longitude or 80.2707,
        location_name=req.location_name or "Chennai",
        city_name=req.city_name or req.location_name or "Chennai",
        history=req.conversation_history,
    )
    if adk_response:
        return adk_response

    # 2. Resilient fallback to RAG / deterministic synthesis
    return await AgentGraphWorkflow.run(
        user_message=req.message,
        lat=req.latitude or 13.0827,
        lon=req.longitude or 80.2707,
        location_name=req.location_name or "Chennai",
        city_name=req.city_name or req.location_name or "Chennai",
        history=req.conversation_history,
    )
