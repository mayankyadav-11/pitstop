"""
PitStop — Socket.IO Live Track Feed (v2)
==========================================
Streams real car positions from OpenF1 via Socket.IO.

For **live sessions**: queries positions at current UTC time.
For **historical sessions**: replays the race in real-time from lap 1,
advancing a virtual clock every tick so the user sees the race unfold
exactly as it happened.

Also broadcasts the *true track path* — a GPS-accurate racing line built
from one full lap of telemetry — so the frontend can draw the real circuit
instead of an approximated SVG.
"""

import asyncio
import socketio
from datetime import datetime, timedelta, timezone
from backend.openf1_client import openf1
import logging

logger = logging.getLogger(__name__)

# ─── Socket.IO Server ──────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
)

socket_app = socketio.ASGIApp(sio)


# ─── Coordinate Scaler ─────────────────────────────────────────
class CoordinateScaler:
    """Maps raw GPS coordinates into a 550×500 SVG viewBox."""

    def __init__(self):
        self.min_x = float("inf")
        self.max_x = float("-inf")
        self.min_y = float("inf")
        self.max_y = float("-inf")
        self.margin = 50
        self.target_w = 550
        self.target_h = 500
        self.ready = False

    def learn(self, points: list[dict]):
        """Feed many {x,y} points (e.g. the track path) to learn bounds."""
        for p in points:
            x, y = p.get("x"), p.get("y")
            if x is None or y is None:
                continue
            self.min_x = min(self.min_x, x)
            self.max_x = max(self.max_x, x)
            self.min_y = min(self.min_y, y)
            self.max_y = max(self.max_y, y)
            self.ready = True

    def scale(self, x: float, y: float) -> tuple[float, float]:
        if not self.ready:
            return 275.0, 250.0

        rx = self.max_x - self.min_x
        ry = self.max_y - self.min_y
        if rx == 0 or ry == 0:
            return 275.0, 250.0

        usable_w = self.target_w - 2 * self.margin
        usable_h = self.target_h - 2 * self.margin
        s = min(usable_w / rx, usable_h / ry)

        sw = rx * s
        sh = ry * s
        ox = self.margin + (usable_w - sw) / 2
        oy = self.margin + (usable_h - sh) / 2

        # Invert Y — GPS is Y-up, SVG is Y-down
        nx = (x - self.min_x) * s + ox
        ny = (self.max_y - y) * s + oy
        return round(nx, 1), round(ny, 1)

    def scale_path(self, points: list[dict]) -> list[dict]:
        """Scale a list of {x,y} points into SVG coordinates."""
        out = []
        for p in points:
            sx, sy = self.scale(p["x"], p["y"])
            out.append({"x": sx, "y": sy})
        return out


# ─── State ──────────────────────────────────────────────────────
_scaler = CoordinateScaler()
_feed_task = None
_is_running = False
_playback_cursor: datetime | None = None
_lap_timestamps: list[dict] = []
_scaled_track_path: list[dict] = []  # pre-computed on startup

POLL_INTERVAL = 4.0       # seconds between each tick
PLAYBACK_STEP = 4.0       # how many real seconds each tick advances


def init_scaler():
    """Pre-learn bounds from the track path so everything is ready before clients connect."""
    global _scaled_track_path
    if openf1.track_path:
        _scaler.learn(openf1.track_path)
        _scaled_track_path = _scaler.scale_path(openf1.track_path)
        logger.info(f"Scaler initialized with {len(_scaled_track_path)} track points")


# ─── Socket events ─────────────────────────────────────────────
@sio.event
async def connect(sid, environ):
    logger.info(f"🔌 Client connected: {sid}")

    # Send session info
    info = openf1.get_session_info()
    await sio.emit("session_info", {
        "sessionName": str(info.get("session_key", "")),
        "circuitKey": info.get("circuit_key", 0),
        "meetingName": info.get("meeting_name", "Unknown"),
        "circuitShortName": info.get("circuit_short_name", "Unknown"),
        "countryName": info.get("country_name", ""),
        "totalLaps": info.get("total_laps", 0),
    }, room=sid)

    # Send the pre-scaled track path
    if _scaled_track_path:
        await sio.emit("track_path", _scaled_track_path, room=sid)
        logger.info(f"Sent track path ({len(_scaled_track_path)} pts) to {sid}")

    # Start the feed loop if not already running
    global _feed_task, _is_running
    if not _is_running:
        _is_running = True
        _feed_task = asyncio.create_task(_run_live_feed())


@sio.event
async def disconnect(sid):
    logger.info(f"❌ Client disconnected: {sid}")


# ─── Feed loop ─────────────────────────────────────────────────
async def _run_live_feed():
    global _playback_cursor, _lap_timestamps, _sent_track_path

    logger.info("🏎️  Starting live feed loop...")

    # Determine if this is a live or historical session
    is_live = False
    if openf1.date_start:
        session_start = datetime.fromisoformat(openf1.date_start)
        now = datetime.now(timezone.utc)
        session_end_est = session_start + timedelta(hours=3)
        if session_start <= now <= session_end_est:
            is_live = True
            logger.info("🟢 Live mode — tracking current UTC time")
        else:
            # Historical playback — start from the beginning
            _playback_cursor = session_start
            logger.info(f"🔄 Playback mode — starting from {session_start.isoformat()}")
    else:
        logger.warning("No date_start — feed will idle")
        return

    # Cache lap timestamps for progress tracking
    _lap_timestamps = openf1.get_lap_timestamps()
    total_laps = openf1.total_laps or 58

    while _is_running:
        try:
            # Determine the query time window
            if is_live:
                t_end = datetime.now(timezone.utc)
                t_start = t_end - timedelta(seconds=POLL_INTERVAL + 1)
            else:
                if _playback_cursor is None:
                    break
                t_start = _playback_cursor
                t_end = _playback_cursor + timedelta(seconds=PLAYBACK_STEP)
                _playback_cursor = t_end

                # Stop if we've gone past the session end
                if openf1.date_end:
                    end_dt = datetime.fromisoformat(openf1.date_end)
                    if t_start > end_dt:
                        logger.info("🏁 Playback complete — restarting from lap 1")
                        _playback_cursor = session_start
                        await asyncio.sleep(3)
                        continue

            date_from = t_start.isoformat()
            date_to = t_end.isoformat()

            # Fetch positions
            raw_positions = openf1.get_positions_at(date_from, date_to)

            if raw_positions:
                # Build car data using pre-initialized scaler
                cars = []
                for p in raw_positions:
                    num = p.get("driver_number")
                    if num is None:
                        continue
                    driver_info = openf1.drivers.get(num, {
                        "acronym": f"D{num}",
                        "team": "Unknown",
                        "name": f"Driver {num}",
                        "color": "#FFFFFF"
                    })
                    sx, sy = _scaler.scale(p["x"], p["y"])
                    cars.append({
                        "driver": driver_info["acronym"],
                        "name": driver_info["name"],
                        "team": driver_info["team"],
                        "color": driver_info["color"],
                        "number": str(num),
                        "x": sx,
                        "y": sy,
                    })

                # Figure out current lap from timestamps
                current_lap = _determine_lap(date_from)
                progress = round((current_lap / total_laps) * 100, 1) if total_laps else 0

                await sio.emit("track_update", {
                    "lap": current_lap,
                    "cars": cars,
                    "progress": min(progress, 100),
                })

        except Exception as e:
            logger.error(f"⚠️  Feed error: {e}")

        await asyncio.sleep(POLL_INTERVAL)


def _determine_lap(current_date_str: str) -> int:
    """Work out which lap we're on based on timestamp."""
    if not _lap_timestamps:
        return 0
    try:
        current = datetime.fromisoformat(current_date_str)
        best_lap = 0
        for lt in _lap_timestamps:
            lap_dt = datetime.fromisoformat(lt["date_start"])
            if lap_dt <= current:
                best_lap = lt["lap_number"]
            else:
                break
        return best_lap
    except Exception:
        return 0
