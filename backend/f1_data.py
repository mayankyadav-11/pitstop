"""
PitStop — FastF1 Data Pipeline
================================
Loads the 2021 Abu Dhabi Grand Prix and provides lap-by-lap context
for the AI engine. Uses fastf1 with local caching.

Since there's no live race, we simulate "live" data by querying
historical lap data from the 2021 Abu Dhabi GP (the Hamilton vs
Verstappen championship decider).
"""

import os
import fastf1
import pandas as pd
from functools import lru_cache

# ─── Cache Setup ────────────────────────────────────────────────
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "fastf1_cache")
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

# ─── Module-level session holder ───────────────────────────────
_session = None


def get_session():
    """
    Load and return the 2021 Abu Dhabi GP Race session.
    Cached after first call so we don't re-download every request.
    """
    global _session
    if _session is not None:
        return _session

    print("⏳ Loading 2021 Abu Dhabi GP session (first time may take ~60s)...")
    session = fastf1.get_session(2021, "Abu Dhabi", "R")
    session.load(
        laps=True,
        telemetry=True,
        weather=False,
        messages=False,
    )
    _session = session
    print("✅ Session loaded successfully!")
    return _session


def get_current_lap_context(lap_number: int) -> dict:
    """
    Get race context for a specific lap number.

    Returns a dictionary with:
      - lap_number: the requested lap
      - total_laps: total laps in the race
      - track_status: current track status (Green/Yellow/SC/VSC/Red)
      - leaders: top 2 drivers with position, name, team, gap, tire info
      - all_drivers: condensed standings for all drivers on that lap

    This is the data we'll inject into the Gemini prompt.
    """
    session = get_session()
    laps = session.laps

    # Validate lap number
    total_laps = int(laps["LapNumber"].max())
    if lap_number < 1 or lap_number > total_laps:
        return {
            "error": f"Lap {lap_number} is out of range. Valid: 1–{total_laps}",
            "total_laps": total_laps,
        }

    # ── Filter laps for the requested lap number ────────────────
    lap_data = laps[laps["LapNumber"] == lap_number].copy()

    if lap_data.empty:
        return {"error": f"No data available for lap {lap_number}"}

    # ── Sort by position to get race order ──────────────────────
    lap_data = lap_data.sort_values("Position")

    # ── Determine track status ──────────────────────────────────
    track_status = _get_track_status(lap_data)

    # ── Build driver entries ────────────────────────────────────
    drivers = []
    for _, row in lap_data.iterrows():
        driver_info = _build_driver_info(row, session)
        if driver_info:
            drivers.append(driver_info)

    # ── Get the top 2 leaders with gap info ─────────────────────
    leaders = drivers[:2] if len(drivers) >= 2 else drivers

    # ── Calculate gap between P1 and P2 ─────────────────────────
    if len(leaders) == 2:
        gap = _calculate_gap(lap_data, leaders)
        leaders[1]["gap_to_leader"] = gap

    return {
        "lap_number": lap_number,
        "total_laps": total_laps,
        "track_status": track_status,
        "leaders": leaders,
        "all_drivers": drivers[:10],  # Top 10 for the prompt
    }


def get_telemetry_for_lap(lap_number: int, driver_abbreviations: list[str] = None):
    """
    Get car telemetry (X, Y positions) for specified drivers on a given lap.
    Used by the Socket.IO track map feature in Phase 4.

    Returns list of dicts with driver abbreviation, X, Y scaled to 0-500.
    """
    session = get_session()
    laps = session.laps

    if driver_abbreviations is None:
        # Default: top 5 drivers by final classification
        driver_abbreviations = ["VER", "HAM", "NOR", "PER", "SAI"]

    results = []

    for abbr in driver_abbreviations:
        try:
            driver_laps = laps.pick_drivers(abbr)
            lap = driver_laps[driver_laps["LapNumber"] == lap_number]

            if lap.empty:
                continue

            telemetry = lap.iloc[0].get_telemetry()

            if telemetry.empty:
                continue

            # Extract X, Y coordinates and scale to 0–500 pixel range
            x_coords = telemetry["X"].values
            y_coords = telemetry["Y"].values

            # Normalize to 0–500 range
            x_min, x_max = x_coords.min(), x_coords.max()
            y_min, y_max = y_coords.min(), y_coords.max()

            x_range = x_max - x_min if x_max != x_min else 1
            y_range = y_max - y_min if y_max != y_min else 1

            x_scaled = ((x_coords - x_min) / x_range * 480 + 10).tolist()
            y_scaled = ((y_coords - y_min) / y_range * 480 + 10).tolist()

            results.append({
                "driver": abbr,
                "x": x_scaled,
                "y": y_scaled,
                "total_points": len(x_scaled),
            })

        except Exception as e:
            print(f"⚠️  Telemetry error for {abbr} on lap {lap_number}: {e}")
            continue

    return results


# ─── Helper Functions ───────────────────────────────────────────

def _get_track_status(lap_data: pd.DataFrame) -> str:
    """Determine the track status for a given lap."""
    if "TrackStatus" in lap_data.columns:
        status_val = lap_data["TrackStatus"].iloc[0]
        status_map = {
            "1": "🟢 Green Flag",
            "2": "🟡 Yellow Flag",
            "4": "⚠️ Safety Car",
            "5": "🔴 Red Flag",
            "6": "🟡 Virtual Safety Car",
            "7": "🟡 VSC Ending",
        }
        return status_map.get(str(status_val), "🟢 Green Flag")
    return "🟢 Green Flag"


def _build_driver_info(row, session) -> dict | None:
    """Build a driver info dict from a lap data row."""
    try:
        abbr = row["Driver"]

        # Get full driver name from session results
        driver_name = abbr  # fallback
        if hasattr(session, "results") and not session.results.empty:
            result_row = session.results[session.results["Abbreviation"] == abbr]
            if not result_row.empty:
                driver_name = f"{result_row.iloc[0]['FirstName']} {result_row.iloc[0]['LastName']}"

        # Tire compound info
        compound = str(row.get("Compound", "UNKNOWN"))
        tire_life = int(row.get("TyreLife", 0)) if pd.notna(row.get("TyreLife")) else 0

        # Lap time
        lap_time = row.get("LapTime")
        lap_time_str = str(lap_time).split(" ")[-1] if pd.notna(lap_time) else "N/A"

        return {
            "position": int(row["Position"]) if pd.notna(row["Position"]) else 0,
            "abbreviation": abbr,
            "name": driver_name,
            "team": str(row.get("Team", "Unknown")),
            "lap_time": lap_time_str,
            "compound": compound,
            "tire_life_laps": tire_life,
            "is_pit_out": bool(row.get("PitOutTime") is not pd.NaT and pd.notna(row.get("PitOutTime"))),
        }
    except Exception as e:
        print(f"⚠️  Error building driver info: {e}")
        return None


def _calculate_gap(lap_data: pd.DataFrame, leaders: list[dict]) -> str:
    """Calculate the time gap between P1 and P2."""
    try:
        p1_row = lap_data[lap_data["Position"] == 1].iloc[0]
        p2_row = lap_data[lap_data["Position"] == 2].iloc[0]

        p1_time = p1_row.get("LapTime")
        p2_time = p2_row.get("LapTime")

        if pd.notna(p1_time) and pd.notna(p2_time):
            gap_seconds = (p2_time - p1_time).total_seconds()
            return f"+{abs(gap_seconds):.3f}s"
    except Exception:
        pass

    return "+?.???s"
