"""
PitStop — OpenF1 Real-Time Client
====================================
Connects to the OpenF1 API to fetch real-time (or historical playback)
telemetry for any F1 session.  All queries use time-windowed requests
so responses stay fast (< 1 s).

Key design:
 - On startup we resolve the *target session* (latest race, or a specific
   year/country combo for historical demo).
 - We cache driver metadata so we don't re-fetch it every tick.
 - Location queries are bounded by a sliding time cursor so we never
   pull the entire race.
 - A helper builds the "true track path" by tracing one full lap of a
   single driver — used by the frontend to draw a GPS-accurate circuit.
"""

import httpx
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

OPENF1_BASE = "https://api.openf1.org/v1"

# Mapping for 30% opacity car backgrounds
TEAM_CAR_MAP = {
    "Red Bull Racing": "redbull car.avif",
    "McLaren": "mclaren car.avif",
    "Ferrari": "ferrari car.avif",
    "Mercedes": "mercedes car.avif",
    "Aston Martin": "aston martin car.avif",
    "Alpine": "alpine.avif",
    "Williams": "williams car.avif",
    "Haas": "haas car.avif",
    "RB": "racing bulls car.avif",
    "VCARB": "racing bulls car.avif",
    "Sauber": "audi car.avif",
    "Audi": "audi car.avif",
    "Cadillac": "cadillac car.avif",
}

class OpenF1Client:
    def __init__(self):
        self.client = httpx.Client(base_url=OPENF1_BASE, timeout=15.0)

        # Session state
        self.session_key: Optional[int] = None
        self.meeting_name: str = "Unknown"
        self.circuit_short_name: str = "Unknown"
        self.circuit_key: int = 0
        self.country_name: str = ""
        self.date_start: Optional[str] = None  # ISO-8601
        self.date_end: Optional[str] = None
        self.total_laps: int = 0

        # Driver cache  {driver_number: {acronym, team, name, color, ...}}
        self.drivers: Dict[int, Dict[str, Any]] = {}

        # Track path cache (list of {x, y} points forming the racing line)
        self.track_path: List[Dict[str, float]] = []

    # ── Session resolution ────────────────────────────────────────

    def resolve_session(self, year: int = 0, country: str = ""):
        """
        Find the best session to target.
        Priority:
          1. If a live session is happening right now → use it.
          2. If year+country are given → find that specific race.
          3. Otherwise → find the most recent completed race.
        """
        try:
            now = datetime.now(timezone.utc)

            # 1. Try to find a LIVE session happening RIGHT NOW
            for yr in [2026, 2025]:
                try:
                    res = self.client.get(f"/sessions?session_name=Race&year={yr}")
                    data = res.json()
                    if isinstance(data, list) and data:
                        for s in data:
                            start = datetime.fromisoformat(s["date_start"])
                            end = datetime.fromisoformat(s["date_end"]) if s.get("date_end") else start + timedelta(hours=3)
                            if start <= now <= end:
                                self._apply_session(s)
                                logger.info(f"Live session found: {self.meeting_name}")
                                return
                except Exception:
                    pass

            # 2. Specific year + country
            if year and country:
                res = self.client.get(f"/sessions?session_name=Race&year={year}&country_name={country}")
                data = res.json()
                if isinstance(data, list) and data:
                    self._apply_session(data[-1])
                    logger.info(f"Targeted session: {self.meeting_name} {year}")
                    return

            # 3. Fallback — most recent COMPLETED race (date_start in the past)
            for yr in [2026, 2025, 2024]:
                try:
                    res = self.client.get(f"/sessions?session_name=Race&year={yr}")
                    data = res.json()
                    if isinstance(data, list) and data:
                        # Filter to sessions whose start date is already past
                        completed = [s for s in data if datetime.fromisoformat(s["date_start"]) < now]
                        if completed:
                            self._apply_session(completed[-1])  # most recent completed
                            logger.info(f"Latest completed race: {self.meeting_name} ({yr})")
                            return
                except Exception:
                    pass

            logger.warning("No session found from OpenF1")
        except Exception as e:
            logger.error(f"Error resolving session: {e}")

    def _apply_session(self, s: dict):
        self.session_key = s["session_key"]
        self.meeting_name = s.get("meeting_name", s.get("circuit_short_name", "Unknown"))
        self.circuit_short_name = s.get("circuit_short_name", "Unknown")
        self.circuit_key = s.get("circuit_key", 0)
        self.country_name = s.get("country_name", "")
        self.date_start = s.get("date_start")
        self.date_end = s.get("date_end")

    # ── Driver metadata ───────────────────────────────────────────

    def fetch_drivers(self):
        """Cache all driver info for the current session."""
        if not self.session_key:
            return
        try:
            res = self.client.get(f"/drivers?session_key={self.session_key}")
            data = res.json()
            if not isinstance(data, list):
                return
            for d in data:
                num = d.get("driver_number")
                if num is None:
                    continue
                self.drivers[num] = {
                    "acronym": d.get("name_acronym", f"D{num}"),
                    "team": d.get("team_name", "Unknown"),
                    "name": d.get("full_name", f"Driver {num}"),
                    "color": "#" + d.get("team_colour", "FFFFFF"),
                }
            logger.info(f"Cached {len(self.drivers)} drivers")
        except Exception as e:
            logger.error(f"Error fetching drivers: {e}")

    # ── Lap info ──────────────────────────────────────────────────

    def fetch_total_laps(self):
        """Get the total lap count for the session (from any driver)."""
        if not self.session_key:
            return
        try:
            res = self.client.get(f"/laps?session_key={self.session_key}&driver_number=1")
            data = res.json()
            if isinstance(data, list) and data:
                self.total_laps = max(l.get("lap_number", 0) for l in data)
                logger.info(f"Total laps: {self.total_laps}")
        except Exception as e:
            logger.error(f"Error fetching total laps: {e}")

    def get_lap_timestamps(self) -> List[Dict[str, Any]]:
        """
        Return a list of {lap_number, date_start} from driver 1's lap data.
        Used by the live feed to know when each lap began.
        """
        if not self.session_key:
            return []
        try:
            res = self.client.get(f"/laps?session_key={self.session_key}&driver_number=1")
            data = res.json()
            if isinstance(data, list):
                return [
                    {"lap_number": l.get("lap_number", 0), "date_start": l.get("date_start", "")}
                    for l in data
                    if l.get("date_start")
                ]
            return []
        except Exception as e:
            logger.error(f"Error fetching lap timestamps: {e}")
            return []

    # ── Time-windowed positions ───────────────────────────────────

    def get_positions_at(self, date_from: str, date_to: str) -> List[Dict[str, Any]]:
        """
        Fetch car positions for ALL drivers within a narrow time window.
        Returns the *last* reported position per driver in that window.
        """
        if not self.session_key:
            return []
        try:
            res = self.client.get(
                f"/location?session_key={self.session_key}"
                f"&date>={date_from}&date<{date_to}"
            )
            data = res.json()
            if not isinstance(data, list):
                return []

            # Keep only the latest entry per driver
            latest: Dict[int, dict] = {}
            for entry in data:
                num = entry.get("driver_number")
                if num is not None:
                    latest[num] = entry
            return list(latest.values())
        except Exception as e:
            logger.error(f"Error fetching positions: {e}")
            return []

    # ── True track path (GPS racing line) ─────────────────────────

    def build_track_path(self):
        """
        Trace one full lap from a single driver to define the track shape for the current session.
        Uses lap 3 (when drivers are up to speed after formation laps).
        """
        if not self.session_key or self.track_path:
            return  # already built or no session

        self.track_path = self.get_raw_track_points(self.session_key)

    def get_raw_track_points(self, session_key: int) -> List[Dict[str, float]]:
        """
        Fetch every position sample for driver 1 during lap 3 of a specific session.
        Returns raw GPS {x, y} coordinates.
        """
        try:
            # Get lap 3 timestamps for driver 1
            res = self.client.get(
                f"/laps?session_key={session_key}&driver_number=1&lap_number=3"
            )
            laps = res.json()
            if not isinstance(laps, list) or not laps:
                logger.warning(f"No lap 3 data for session {session_key}")
                return []

            lap_start = laps[0].get("date_start")
            # For end, get lap 4 start or add ~120s
            res2 = self.client.get(
                f"/laps?session_key={session_key}&driver_number=1&lap_number=4"
            )
            laps4 = res2.json()
            if isinstance(laps4, list) and laps4:
                lap_end = laps4[0].get("date_start")
            else:
                dt = datetime.fromisoformat(lap_start) + timedelta(seconds=120)
                lap_end = dt.isoformat()

            # Fetch positions
            res3 = self.client.get(
                f"/location?session_key={session_key}&driver_number=1"
                f"&date>={lap_start}&date<{lap_end}"
            )
            points = res3.json()
            if isinstance(points, list) and points:
                return [{"x": p["x"], "y": p["y"]} for p in points if "x" in p and "y" in p]
        except Exception as e:
            logger.error(f"Error getting raw track points for {session_key}: {e}")
        return []

    # ── Race control & pits (for AI) ──────────────────────────────

    def get_race_control(self, date_from: str = "", date_to: str = "") -> List[Dict]:
        if not self.session_key:
            return []
        try:
            url = f"/race_control?session_key={self.session_key}"
            if date_from:
                url += f"&date>={date_from}"
            if date_to:
                url += f"&date<{date_to}"
            res = self.client.get(url)
            data = res.json()
            return data if isinstance(data, list) else []
        except Exception as e:
            logger.error(f"Error fetching race control: {e}")
            return []

    def get_pit_stops(self, lap_number: int = 0) -> List[Dict]:
        if not self.session_key:
            return []
        try:
            url = f"/pit?session_key={self.session_key}"
            if lap_number:
                url += f"&lap_number={lap_number}"
            res = self.client.get(url)
            data = res.json()
            return data if isinstance(data, list) else []
        except Exception as e:
            logger.error(f"Error fetching pits: {e}")
            return []

    def get_lap_context(self, lap_number: int) -> Dict[str, Any]:
        """Build AI-ready context for a specific lap."""
        return {
            "lap": lap_number,
            "meeting": self.meeting_name,
            "circuit": self.circuit_short_name,
            "events": self.get_race_control()[-10:],
            "pit_stops": self.get_pit_stops(lap_number),
        }

    def get_last_10_laps_events(self) -> Dict[int, List[Dict[str, Any]]]:
        """
        Groups race control and pit events for the last 10 laps of the race.
        Returns a dict: { lap_number: [events_list] }
        """
        if not self.session_key:
            return {}

        if self.total_laps == 0:
            self.fetch_total_laps()

        start_lap = max(1, self.total_laps - 9)
        all_laps_events = {}

        # 1. Fetch Race Control
        rc_events = self.get_race_control()
        
        # 2. Fetch Pit Stops (all for session, then filter)
        pits = self.get_pit_stops()

        # Helper to find car image
        def get_car_img(driver_num: Optional[int], message: str = "") -> Optional[str]:
            team_name = ""
            if driver_num and driver_num in self.drivers:
                team_name = self.drivers[driver_num]["team"]
            else:
                # Try to find team name in message
                for team in TEAM_CAR_MAP.keys():
                    if team.lower() in message.lower():
                        team_name = team
                        break
            
            if not team_name:
                return None
            
            # Match team_name to TEAM_CAR_MAP
            for key, img in TEAM_CAR_MAP.items():
                if key.lower() in team_name.lower():
                    return f"/logos/{img}"
            return None

        for lap in range(start_lap, self.total_laps + 1):
            lap_events = []
            
            # Filter Race Control for this lap
            for rc in rc_events:
                if rc.get("lap_number") == lap:
                    lap_events.append({
                        "id": f"rc_{rc.get('event_id', lap)}",
                        "lap": lap,
                        "title": rc.get("category", "Incident").upper(),
                        "description": rc.get("message", ""),
                        "type": "warning" if rc.get("flag") else "pit" if "PIT" in rc.get("message", "") else "overtake",
                        "teamCarImage": get_car_img(rc.get("driver_number"), rc.get("message", "")),
                        "impact": "HIGH" if rc.get("flag") in ["RED", "SAFETY CAR"] else "MEDIUM"
                    })

            # Filter Pits for this lap
            for p in pits:
                if p.get("lap_number") == lap:
                    dr_num = p.get("driver_number")
                    dr_name = self.drivers.get(dr_num, {}).get("name", f"Driver {dr_num}")
                    lap_events.append({
                        "id": f"pit_{dr_num}_{lap}",
                        "lap": lap,
                        "title": f"PIT STOP: {dr_name}",
                        "description": f"Pit stop confirmed for {dr_name}. Duration: {p.get('pit_duration', 'N/A')}s",
                        "type": "pit",
                        "teamCarImage": get_car_img(dr_num),
                        "stat": f"{p.get('pit_duration', 'N/A')}s STOP"
                    })

            if lap_events:
                all_laps_events[lap] = lap_events
            else:
                # Add a default entry so the lap shows up in the UI
                all_laps_events[lap] = []

        return all_laps_events

    def get_session_info(self) -> Dict[str, Any]:
        return {
            "session_key": self.session_key,
            "meeting_name": self.meeting_name,
            "circuit_short_name": self.circuit_short_name,
            "circuit_key": self.circuit_key,
            "country_name": self.country_name,
            "total_laps": self.total_laps,
        }


# Module-level singleton
openf1 = OpenF1Client()
