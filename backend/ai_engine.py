"""
PitStop — Gemini AI Engine
============================
Takes FastF1 lap context and asks Gemini 1.5 Pro to explain
the strategy "why" in 2 concise sentences, like a race engineer
talking to a casual fan.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# ─── Load API key from .env ────────────────────────────────────
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini API configured")
else:
    print("⚠️  GEMINI_API_KEY not found in .env — AI features will return fallback text")

# ─── The Gemini Model ──────────────────────────────────────────
MODEL_NAME = "gemini-2.0-flash"

# ─── System prompt — role + constraints ────────────────────────
SYSTEM_PROMPT = """You are PitStop AI, an expert Formula 1 race strategist and commentator.

Your job is to explain race events to casual fans who may not understand F1 strategy.

RULES:
1. Respond in EXACTLY 2 sentences. No more, no less.
2. First sentence: Explain WHAT happened and WHY it was strategically important.
3. Second sentence: Explain the CONSEQUENCE — what this means for the race outcome.
4. Use simple, exciting language. Avoid jargon without explanation.
5. Reference specific data (tire age, gaps, compounds) from the context provided.
6. Be confident and insightful, like a TV commentator during a broadcast.
"""


async def explain_why(lap_context: dict) -> dict:
    """
    Given lap context from FastF1, ask Gemini to explain the strategy.

    Args:
        lap_context: dict from get_current_lap_context()

    Returns:
        dict with "explanation" (AI text) and "lap" (number)
    """
    # ── Guard: no API key ──────────────────────────────────────
    if not GEMINI_API_KEY:
        return {
            "lap": lap_context.get("lap", 0),
            "explanation": "⚠️ AI unavailable — set GEMINI_API_KEY in your .env file to enable race insights.",
            "source": "fallback",
        }

    # ── Guard: lap context has error ───────────────────────────
    if "error" in lap_context:
        return {
            "lap": lap_context.get("lap", 0),
            "explanation": f"Cannot analyze: {lap_context['error']}",
            "source": "error",
        }

    # ── Build the data prompt ──────────────────────────────────
    data_prompt = _build_data_prompt(lap_context)

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            system_instruction=SYSTEM_PROMPT,
        )

        response = model.generate_content(
            data_prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=200,
            ),
        )

        explanation = response.text.strip()

        return {
            "lap": lap_context["lap"],
            "explanation": explanation,
            "source": "gemini",
            "track_status": "Unknown",
        }

    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        # Fallback to simulated insight so the app remains free and functional!
        simulated_explanation = f"Based on the telemetry for {lap_context.get('meeting', 'this race')}, the leaders are maintaining their pace to manage tire degradation. We should watch for the pit window opening in the next few laps as grip levels drop."
        
        return {
            "lap": lap_context.get("lap", 0),
            "explanation": simulated_explanation,
            "source": "simulated",
        }


def _build_data_prompt(ctx: dict) -> str:
    """
    Convert structured lap context into a natural-language prompt
    for Gemini to analyze.
    """
    events_text = ""
    for ev in ctx.get("events", []):
        cat = ev.get("category", "")
        msg = ev.get("message", "")
        events_text += f"- [{cat}] {msg}\n"
        
    pits_text = ""
    for pit in ctx.get("pit_stops", []):
        dr = pit.get("driver_number", "Unknown")
        dur = pit.get("pit_duration", "Unknown")
        pits_text += f"- Driver {dr} pitted for {dur}s\n"

    prompt = f"""Analyze this F1 race situation and explain what's happening strategically:

RACE: {ctx.get('meeting', 'Unknown GP')}
LAP: {ctx.get('lap', 0)}

RECENT RACE CONTROL EVENTS:
{events_text if events_text else "None"}

RECENT PIT STOPS:
{pits_text if pits_text else "None"}

Based on this limited OpenF1 telemetry data, explain the current strategic situation to a casual fan.
If there are safety cars or pit stops, focus on those. If nothing is happening, talk about the general pace of the {ctx.get('meeting', 'Unknown GP')} track.
Why are the leaders making these decisions? What should we watch for next?"""

    return prompt
