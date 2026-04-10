# Home Tab Development Tasks

This document tracks the completed tasks for the Home Tab overhaul, including the dynamic lap explorer and AI integration.

## Phase 1: Overhaul & Integration
- [x] **Backend**: Update `openf1_client.py` with `get_last_10_laps_events()` to fetch and group historical race data.
- [x] **Backend**: Add `/api/home/laps` endpoint to `main.py` to serve lap-grouped events.
- [x] **Frontend**: Update `types.ts` to include `teamCarImage` property for event cards.
- [x] **Frontend**: Add `fetchHomeLaps()` REST call to `api.ts` to interface with the new backend endpoint.
- [x] **Frontend**: Redesign `Home.tsx` with a dynamic Lap Selector top-bar for browsing the last 10 laps.
- [x] **Frontend**: Update `EventCard` UI to display team car background images at 30% opacity.
- [x] **Verification**: Confirmed data flow from OpenF1 -> FastAPI -> React for the final sequence of the race.

## Phase 2: AI Insights & Real-Time Filtering
- [x] **Backend**: Update `openf1_client.py` to filter `get_lap_context` by specific lap number to avoid cross-lap data leak.
- [x] **Backend**: Update `ai_engine.py` to accept high-level event context for targeted Gemini strategy analysis.
- [x] **Backend**: Update `main.py` to expose an `event` focus parameter in the `/api/why` endpoint.
- [x] **Frontend**: Update `api.ts` to send the exact event title/description to the AI engine.
- [x] **Frontend**: Modify `Home.tsx` to pass the clicked event's details to the AI analysis flow.
- [x] **Verification**: Verified unique, contextually relevant AI responses for different types of incidents (Pit Stops vs. Yellow Flags).
