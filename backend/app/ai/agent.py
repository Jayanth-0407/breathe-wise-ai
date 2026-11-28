"""
BreatheWise AI - Google ADK Agent Definition
===========================================
Defines the primary BreatheWise conversational assistant agent with Google ADK,
incorporating local tools for real-time air quality, exercise window forecasting,
physiological exposure modeling, and GoogleSearchTool for questions beyond local scope.
"""

import os
import sys
from pathlib import Path

# Ensure the backend directory is in sys.path when invoked via adk CLI
_backend_dir = str(Path(__file__).resolve().parent.parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

try:
    from dotenv import load_dotenv
    load_dotenv(Path(_backend_dir) / ".env")
except Exception:
    pass

from app.config import settings

# Ensure Google API Key is visible to ADK
if settings.GOOGLE_API_KEY and not os.environ.get("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY

from google.adk.agents.llm_agent import Agent
from google.adk.tools.google_search_tool import GoogleSearchTool
from app.ai.tools import (
    get_current_air_quality,
    get_best_exercise_windows,
    calculate_inhaled_dose,
    search_who_guidelines,
)

BREATHEWISE_INSTRUCTIONS = """You are BreatheWise AI, an expert environmental health, air quality, and urban mobility assistant.

YOUR CAPABILITIES & TOOLS:
1. get_current_air_quality: Use this tool to look up live AQI, PM2.5, PM10, temperature, and wind speed for the user's location.
2. get_best_exercise_windows: Use this tool when users ask when to jog, run, or cycle, or need safe outdoor workout schedules over the next 24 hours.
3. calculate_inhaled_dose: Use this tool when users ask about pollution intake, lung exposure, or health damage from exercising outdoors.
4. search_who_guidelines: Use this tool to retrieve local authoritative WHO 2021 air quality benchmarks and standards.
5. google_search: For any question beyond the local air quality scope (such as latest news, emerging regional pollution advisories, clinical studies, air purifier comparisons, mask ratings, or questions about specific cities), use Google Search to retrieve and cite accurate web information.

SAFETY & GUARDRAILS:
- Always cite sources in brackets (e.g. [WHO 2021], [CPCB], [Source: Web]).
- Never diagnose medical illnesses or make unsupported individual medical claims.
- If outdoor AQI exceeds 150-200, proactively advise shifting workouts indoors or exercising in HEPA-filtered spaces.
"""

# Primary ADK agent instance for 'adk web' / CLI
root_agent = Agent(
    name="breathewise_assistant",
    model=os.environ.get("GEMINI_MODEL") or settings.GEMINI_MODEL or "gemini-3.5-flash",
    description="Pollution-aware fitness, health, and clean mobility AI assistant.",
    instruction=BREATHEWISE_INSTRUCTIONS,
    tools=[
        GoogleSearchTool(bypass_multi_tools_limit=True),
        get_current_air_quality,
        get_best_exercise_windows,
        calculate_inhaled_dose,
        search_who_guidelines,
    ],
)

agent = root_agent

# --- Programmatic Execution Interface for FastAPI / Vercel ---
import logging
from typing import Optional, List, Dict
from app.schemas.chat import ChatResponse, Citation

logger = logging.getLogger(__name__)

_runner = None
_session_service = None

def _get_or_create_runner():
    global _runner, _session_service
    if _runner is not None:
        return _runner
    try:
        from google.adk.runners import Runner
        from google.adk.sessions.in_memory_session_service import InMemorySessionService
        _session_service = InMemorySessionService()
        _runner = Runner(
            agent=root_agent,
            app_name="breathewise",
            session_service=_session_service,
            auto_create_session=True,
        )
        return _runner
    except Exception as e:
        logger.warning(f"Could not initialize Google ADK Runner: {e}")
        return None

async def run_adk_chat(
    user_message: str,
    lat: float = 13.0827,
    lon: float = 80.2707,
    location_name: str = "Chennai",
    city_name: str = "Chennai",
    history: Optional[List[Dict[str, str]]] = None,
) -> Optional[ChatResponse]:
    """Runs the Google ADK agent and formats the output for the Vercel frontend."""
    runner = _get_or_create_runner()
    if runner is None:
        return None

    try:
        from google.genai import types
        context_prompt = (
            f"[User Location: {location_name} ({city_name}), Coordinates: {lat}°N, {lon}°E]\n"
            f"User Question: {user_message}"
        )
        content = types.Content(role="user", parts=[types.Part(text=context_prompt)])

        collected_text: List[str] = []
        tools_invoked: List[str] = []

        session_id = f"session_{location_name.lower().replace(' ', '_')}"
        async for event in runner.run_async(
            user_id="breathewise_user",
            session_id=session_id,
            new_message=content,
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        collected_text.append(part.text)
                    if getattr(part, "function_call", None):
                        tools_invoked.append(part.function_call.name)

        final_text = "".join(collected_text).strip()
        if not final_text:
            return None

        citations = [
            Citation(
                title=f"Google ADK ({settings.GEMINI_MODEL or 'gemini-3.5-flash'})",
                source="Google Gemini + Open-Meteo Environmental Network",
                snippet=f"Grounded real-time analysis for {location_name}.",
            )
        ]

        return ChatResponse(
            response=final_text,
            citations=citations,
            tools_used=list(set(tools_invoked)) if tools_invoked else ["adk_gemini_agent"],
            suggested_actions=[
                "Check today's best exercise window",
                "Calculate my jogging pollution exposure",
                "What mask protects best against PM2.5?",
            ],
        )
    except Exception as e:
        logger.warning(f"ADK Agent execution warning: {e}. Executing resilient fallback.")
        return None

