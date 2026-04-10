"""
PitStop Backend — FastAPI + Socket.IO Server
=============================================
Entry point for the PitStop AI-powered F1 companion backend.
Run with:  uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.openf1_client import openf1
from backend.ai_engine import explain_why
from backend.live_feed import socket_app, init_scaler

# ─── FastAPI App ────────────────────────────────────────────────
app = FastAPI(
    title="PitStop — AI F1 Companion",
    version="0.2.0",
    description="Real-time F1 race strategy explained by AI",
)

# ─── CORS Middleware ────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ───────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "PitStop backend is running",
        "version": "0.2.0",
        "session": openf1.get_session_info(),
    }


# ─── Lap Context ───────────────────────────────────────────────
@app.get("/api/lap/{lap_number}")
async def get_lap(lap_number: int):
    return openf1.get_lap_context(lap_number)


# ─── Home Tab: Last 10 Laps ────────────────────────────────────
@app.get("/api/home/laps")
async def get_home_laps():
    """Returns events grouped by lap for the last 10 laps of the race."""
    return openf1.get_last_10_laps_events()


# ─── AI "Why" Endpoint ─────────────────────────────────────────
@app.get("/api/why")
async def why_endpoint(
    lap: int = Query(..., ge=1, description="Lap number to analyze"),
    event: str = Query("", description="Specific event text to focus on")
):
    """
    The "Why it Happened" endpoint.
    1. Fetches lap context from OpenF1 (filtered by lap)
    2. Sends it to Gemini with the specific event focus
    """
    lap_context = openf1.get_lap_context(lap)
    result = await explain_why(lap_context, event)
    return result


# ─── Root ───────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "Welcome to PitStop API",
        "docs": "/docs",
        "health": "/health",
        "try_lap": "/api/lap/20",
        "try_why": "/api/why?lap=20",
        "socket_io": "ws://localhost:8000/socket.io",
    }


# ─── Mount Socket.IO ───────────────────────────────────────────
app.mount("/socket.io", socket_app)


# ─── Startup Event ─────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """
    On boot:
     1. Resolve the session (auto-detect live, or fall back to latest race)
     2. Cache driver metadata
     3. Build the true GPS track path
    """
    # Try to find a 2025 live session first, then fall back to 2024 Abu Dhabi
    openf1.resolve_session()

    # If no 2025 session found, the resolver already falls back to 2024.
    # Cache metadata
    openf1.fetch_drivers()
    openf1.fetch_total_laps()

    # Build the GPS-accurate track path from one full lap
    openf1.build_track_path()

    # Pre-initialize the coordinate scaler so it's ready before clients connect
    init_scaler()

    info = openf1.get_session_info()
    print(f"PitStop targeting: {info['meeting_name']} (session {info['session_key']})")
    print(f"   Circuit: {info['circuit_short_name']} | Laps: {info['total_laps']}")
    print(f"   Drivers cached: {len(openf1.drivers)}")
    print(f"   Track path points: {len(openf1.track_path)}")
