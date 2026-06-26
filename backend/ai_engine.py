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
    print("[OK] Gemini API configured")
else:
    print("[WARN] GEMINI_API_KEY not found in .env — AI features will return fallback text")

# ─── The Gemini Model ──────────────────────────────────────────
MODEL_NAME = "gemini-2.5-flash"

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


async def explain_why(lap_context: dict, target_event: str = "") -> dict:
    """
    Given lap context from FastF1, ask Gemini to explain the strategy.

    Args:
        lap_context: dict from get_current_lap_context()
        target_event: the specific event description to explain
    
    Returns:
        dict with "explanation" (AI text) and "lap" (number)
    """
    # ── Guard: no API key ──────────────────────────────────────
    if not GEMINI_API_KEY:
        return {
            "lap": lap_context.get("lap", 0),
            "explanation": "AI unavailable — set GEMINI_API_KEY in your .env file to enable race insights.",
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
    data_prompt = _build_data_prompt(lap_context, target_event)

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
        print(f"[ERROR] Gemini API error: {e}")
        # Fallback to a highly relevant simulated explanation based on event description
        simulated_explanation = generate_dynamic_fallback(target_event, lap_context.get("lap", 0))
        
        return {
            "lap": lap_context.get("lap", 0),
            "explanation": simulated_explanation,
            "source": "simulated",
        }


def _build_data_prompt(ctx: dict, target_event: str = "") -> str:
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
TARGET EVENT TO EXPLAIN: {target_event if target_event else "The general strategic situation of the lap"}

RECENT RACE CONTROL EVENTS:
{events_text if events_text else "None"}

RECENT PIT STOPS:
{pits_text if pits_text else "None"}

Based on this telemetry data, provide a unique explanation for the TARGET EVENT. 
If explaining a pit stop, tell us why they chose this lap. If explaining a flag or incident, explain the technical or strategic cause.
Respond with a unique insight that hasn't been shared for other laps."""

    return prompt


def generate_dynamic_fallback(target_event: str, lap: int) -> str:
    evt = target_event.lower()
    
    # Extract driver name
    driver = "The driver"
    for d in ["norris", "verstappen", "antonelli", "sainz", "hamilton", "leclerc", "perez", "piastri", "russell", "alonso", "tsunoda", "gasly", "stroll", "albon", "magnussen", "hulkenberg", "bottas", "zhou", "sargeant", "ricciardo"]:
        if d in evt:
            driver = d.capitalize()
            break
            
    if "pit" in evt or "box" in evt or "tyre" in evt or "tire" in evt or "soft" in evt or "medium" in evt or "hard" in evt:
        return f"{driver} entered the pits for fresh tires to optimize track position. This compound change aims to unlock better pace and secure an advantage in the upcoming stint."
    elif "fastest" in evt:
        return f"{driver} registered the fastest lap using low fuel weight and clean air. This adds an extra point to the championship tally and showcases supreme car balance."
    elif "yellow" in evt:
        return "A yellow flag has neutralized this sector due to a track hazard. Drivers must decrease speed and hold their positions until green conditions are restored."
    elif "green" in evt:
        return "The track is clear and green flag racing has resumed. Drivers are back to full throttle, pushing their power units to defend or attempt late-braking moves."
    elif "overtake" in evt or "passed" in evt or "pass" in evt:
        return f"{driver} completed a crucial overtake by exploiting a grip advantage on corner exit. The move shifts momentum and forces the rival team to adapt their strategy."
    elif "retire" in evt or "engine" in evt or "stopped" in evt:
        return f"{driver} suffered a critical failure, forcing them to retire the car. This sudden loss of power disrupts the team's championship points target."
    elif "lock" in evt:
        return f"{driver} locked up the front tires, causing a flat-spot and tyre degradation. This error will lead to handling vibrations and may force an early stop."
    elif "drs" in evt:
        return f"{driver} is now within the 1-second DRS activation zone behind the lead car. The open rear wing flap provides a top-speed boost for an attack."
    elif "safety car" in evt or "sc" in evt:
        return "The safety car deployment groups the field and neutralizes all time gaps. This triggers a flurry of strategic decisions as teams calculate pit stop windows."
    
    return f"This event on Lap {lap} has altered the strategic landscape. The teams are analyzing telemetry data to adapt their fuel management and tyre wear strategies."

