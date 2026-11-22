import logging
from typing import Dict, Any, List, Optional, TypedDict
from langgraph.graph import StateGraph, START, END
from app.config import settings
from app.schemas.chat import ChatResponse, Citation
from app.ai.rag import EnvironmentalRAG
from app.ai.tools import (
    tool_get_current_aqi,
    tool_get_exercise_windows,
    tool_estimate_exposure,
)

logger = logging.getLogger(__name__)

# 1. Define LangGraph Typed State
class AgentState(TypedDict):
    user_message: str
    latitude: float
    longitude: float
    location_name: str
    city_name: str
    conversation_history: List[Dict[str, str]]
    rag_docs: List[Dict[str, Any]]
    citations: List[Citation]
    tools_used: List[str]
    tool_outputs: Dict[str, Any]
    suggested_actions: List[str]
    final_response: str

# 2. Node: RAG Knowledge Retrieval
def retrieve_rag_node(state: AgentState) -> Dict[str, Any]:
    """Retrieves authoritative environmental health documentation."""
    query = state.get("user_message", "")
    rag_docs = EnvironmentalRAG.search(query, top_k=2)
    citations: List[Citation] = []
    for doc in rag_docs:
        citations.append(
            Citation(
                title=doc["title"],
                source=doc["source"],
                url=doc.get("url"),
                snippet=doc["content"][:200] + "...",
            )
        )
    return {
        "rag_docs": rag_docs,
        "citations": citations,
    }

# 3. Node: Deterministic Tool Dispatching
async def execute_tools_node(state: AgentState) -> Dict[str, Any]:
    """Executes relevant environmental tools based on user prompt intent."""
    msg = state.get("user_message", "").lower()
    lat = state.get("latitude", 28.6139)
    lon = state.get("longitude", 77.2090)
    tools_used: List[str] = []
    tool_outputs: Dict[str, Any] = {}

    if any(w in msg for w in ["aqi", "air quality", "pm2.5", "pm10", "current", "weather"]):
        tools_used.append("tool_get_current_aqi")
        tool_outputs["current_aq"] = await tool_get_current_aqi(lat, lon)

    if any(w in msg for w in ["best time", "when to", "window", "schedule", "jog", "run", "morning"]):
        tools_used.append("tool_get_exercise_windows")
        tool_outputs["exercise_windows"] = await tool_get_exercise_windows(lat, lon, duration=45)

    if any(w in msg for w in ["exposure", "inhale", "dose", "lungs", "intake", "risk"]):
        tools_used.append("tool_estimate_exposure")
        tool_outputs["exposure"] = await tool_estimate_exposure(activity="jogging", duration_min=30, aqi=150)

    suggested = [
        "Check today's best exercise window",
        "Calculate my jogging pollution exposure",
        "What type of mask is effective against PM2.5?",
    ]

    return {
        "tools_used": tools_used,
        "tool_outputs": tool_outputs,
        "suggested_actions": suggested,
    }

# 4. Node: Groq LLM Synthesis & Grounded Guardrails
async def synthesize_response_node(state: AgentState) -> Dict[str, Any]:
    """Synthesizes final response using Groq LLM or deterministic grounded fallback."""
    user_message = state.get("user_message", "")
    rag_docs = state.get("rag_docs", [])
    tool_outputs = state.get("tool_outputs", {})
    history = state.get("conversation_history", [])
    lat = state.get("latitude", 13.0827)
    lon = state.get("longitude", 80.2707)
    location_name = state.get("location_name", "Chennai")
    city_name = state.get("city_name", "Chennai")

    # If Groq API Key is configured, use Groq LLM inference
    if settings.GROQ_API_KEY:
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=settings.GROQ_API_KEY)

            system_prompt = (
                "You are BreatheWise AI, an expert environmental health, pollution exposure, and urban fitness assistant.\n"
                f"CURRENT USER LOCATION CONTEXT: {location_name} ({city_name}). Coordinates: {lat}°N, {lon}°E.\n"
                "IMPORTANT INSTRUCTIONS:\n"
                f"1. You are fully aware that the user is currently at or inquiring about {location_name} ({city_name}). "
                f"Whenever the user asks about current conditions, when to exercise, air quality, safety, or routes, "
                f"always answer specifically for {location_name} ({city_name}).\n"
                "2. Rely on the real-time environmental data and authoritative scientific knowledge provided below.\n"
                "3. Cite your sources using brackets (e.g. [WHO 2021], [CPCB NAQI], [EPA Standard]).\n"
                "4. Never diagnose medical conditions or make unsupported individual health risk claims.\n"
                "5. If outdoor air quality is unhealthy/hazardous (AQI > 150-200), advise shifting workouts indoors.\n"
                f"Live Environmental Tools Data for {location_name}: {tool_outputs}\n"
                f"Authoritative RAG Grounding: {[d['content'] for d in rag_docs]}"
            )

            groq_messages = [{"role": "system", "content": system_prompt}]
            if history:
                for h in history[-4:]:
                    groq_messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            groq_messages.append({"role": "user", "content": user_message})

            completion = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=groq_messages,
                temperature=0.3,
                max_tokens=600,
            )
            response_text = completion.choices[0].message.content or ""
            return {"final_response": response_text}
        except Exception as e:
            logger.warning(f"Groq API call error: {e}. Executing deterministic grounded fallback.")

    # Deterministic Grounded Synthesis Fallback
    parts: List[str] = []
    if "current_aq" in tool_outputs:
        aq = tool_outputs["current_aq"]
        parts.append(
            f"**Current Air Quality in {location_name}**: The local AQI is **{aq['aqi']}** ({aq['category']}) with PM2.5 at **{aq['pm25']} µg/m³** "
            f"and temperature of {aq['temperature']}°C (Source: {aq['source']})."
        )

    if "exercise_windows" in tool_outputs:
        ew = tool_outputs["exercise_windows"]
        wins = ew.get("windows", [])
        if wins:
            top_w = wins[0]
            parts.append(
                f"\n**Recommended Exercise Window**: The safest outdoor window is **{top_w['window_start']} – {top_w['window_end']}** "
                f"({top_w['suitability']}, Avg AQI ~{top_w['avg_aqi']}). {top_w['reason']}"
            )

    if "exposure" in tool_outputs:
        exp = tool_outputs["exposure"]
        parts.append(
            f"\n**Estimated Particulate Inhaled Dose**: A 30-minute jog at current pollution levels results in an estimated "
            f"**{exp['estimated_inhaled_pm25_ug']} µg** of inhaled PM2.5 ({exp['exposure_tier']} Tier). {exp['health_impact']}"
        )

    lower_msg = user_message.lower()
    if any(w in lower_msg for w in ["mask", "n95", "cloth", "surgical", "purifier", "hepa"]):
        top_doc = rag_docs[0] if rag_docs else None
        if top_doc:
            parts.append(
                f"\n**Environmental Health Guidance**: According to *{top_doc['title']}* ([{top_doc['source']}]): {top_doc['content']}"
            )
    elif not parts:
        top_doc = rag_docs[0] if rag_docs else None
        if top_doc:
            parts.append(
                f"Based on established environmental guidelines from the **{top_doc['title']}**:\n\n"
                f"{top_doc['content']}\n\n"
                f"For personalized recommendations, check your Live Dashboard or explore low-exposure jogging routes."
            )

    return {"final_response": "\n\n".join(parts)}

# 5. Build and Compile the LangGraph StateGraph
def create_breathewise_langgraph():
    graph_builder = StateGraph(AgentState)

    # Register Nodes
    graph_builder.add_node("retrieve_rag", retrieve_rag_node)
    graph_builder.add_node("execute_tools", execute_tools_node)
    graph_builder.add_node("synthesize_response", synthesize_response_node)

    # Define Graph Edges
    graph_builder.add_edge(START, "retrieve_rag")
    graph_builder.add_edge("retrieve_rag", "execute_tools")
    graph_builder.add_edge("execute_tools", "synthesize_response")
    graph_builder.add_edge("synthesize_response", END)

    # Compile Graph
    return graph_builder.compile()

# Global compiled LangGraph instance
breathewise_graph = create_breathewise_langgraph()

class AgentGraphWorkflow:
    """Public interface calling the compiled LangGraph state machine."""

    @classmethod
    async def run(
        cls,
        user_message: str,
        lat: float = 13.0827,
        lon: float = 80.2707,
        location_name: str = "Chennai",
        city_name: str = "Chennai",
        history: Optional[List[Dict[str, str]]] = None,
    ) -> ChatResponse:
        initial_state: AgentState = {
            "user_message": user_message,
            "latitude": lat,
            "longitude": lon,
            "location_name": location_name,
            "city_name": city_name,
            "conversation_history": history or [],
            "rag_docs": [],
            "citations": [],
            "tools_used": [],
            "tool_outputs": {},
            "suggested_actions": [],
            "final_response": "",
        }

        # Execute through the compiled LangGraph workflow
        final_state = await breathewise_graph.ainvoke(initial_state)

        return ChatResponse(
            response=final_state.get("final_response", ""),
            citations=final_state.get("citations", []),
            tools_used=final_state.get("tools_used", []),
            suggested_actions=final_state.get("suggested_actions", []),
        )
