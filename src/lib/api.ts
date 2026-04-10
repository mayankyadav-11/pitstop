import { EventCard } from "../types";

/**
 * PitStop — Backend API Client
 * ==============================
 * Connects the React frontend to the FastAPI backend.
 * Handles REST calls (/api/why) and Socket.IO (live track).
 */

const API_BASE = "http://localhost:8000";

// ─── REST: "Why?" Button ───────────────────────────────────────
export async function fetchWhyExplanation(lap: number): Promise<{
  lap: number;
  explanation: string;
  source: string;
  track_status?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/why?lap=${lap}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("PitStop API error:", error);
    return {
      lap,
      explanation: "Unable to reach PitStop AI. Make sure the backend is running on port 8000.",
      source: "error",
    };
  }
}

// ─── REST: Home Laps (Last 10 Laps) ───────────────────────────
export async function fetchHomeLaps(): Promise<Record<string, EventCard[]>> {
  try {
    const response = await fetch(`${API_BASE}/api/home/laps`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Home laps error:", error);
    return {};
  }
}

// ─── REST: Lap Context (raw data) ─────────────────────────────
export async function fetchLapContext(lap: number) {
  try {
    const response = await fetch(`${API_BASE}/api/lap/${lap}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Lap context error:", error);
    return null;
  }
}

// ─── Health Check ──────────────────────────────────────────────
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
