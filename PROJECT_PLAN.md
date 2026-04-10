# PitStop F1 — AI-Powered Race Companion

## Project Vision
PitStop F1 is designed to be the ultimate second-screen experience for Formula 1 fans. By combining real-time telemetry from the OpenF1 API with the strategic analytical power of Gemini 2.0 Flash, PitStop provides fans with deep, instant insights into "Why it Happened" while they watch the race.

## Core Features
- **Live Telemetry & Track Map**: Real-time car positions on a GPS-accurate circuit map, synchronized across all fans via WebSockets.
- **AI Strategy Engine**: Instant AI-powered explanations for pit stops, overtakes, and race control incidents (Safety Cars, Virtual Safety Cars, etc.).
- **Interactive Schedule**: A complete 2026 F1 season calendar with real-time race data and session information.
- **Fan Engagement**: Community interactive features (Engage tab) designed to bring fans together during the heat of the race.
- **Team & Driver Exploration**: Deep dives into team history, current standings, and performance metrics.

## Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion (Motion)
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client

### Backend
- **Language**: Python 3.x
- **Framework**: FastAPI
- **Real-time**: Python-SocketIO
- **Data Client**: OpenF1 API (httpx)
- **AI Engine**: Google Gemini 2.0 Flash

## Project Roadmap

### Phase 1: Foundation (Completed)
- [x] Basic project structure and design system.
- [x] Sidebar navigation and layout implementation.
- [x] Initial OpenF1 API client for static data fetching.

### Phase 2: Live Experience (Completed)
- [x] FastAPI & Socket.IO backend implementation.
- [x] GPS-accurate track map rendering on the frontend.
- [x] Real-time coordinate scaling and car position broadcasting.

### Phase 3: AI Augmentation (Completed)
- [x] Gemini 2.0 Flash integration for strategy insights.
- [x] "/api/why" endpoint for deep-dive lap analysis.
- [x] AI analysis of race control events and pit strategies.

### Phase 4: Expansion (Current)
- [/] Polishing the "Engage" and "Explore" tabs.
- [/] Finalizing the 2026 schedule data integration.
- [/] Performance optimization and bug fixes.

### Phase 5: Polish & Deployment (Future)
- [ ] Mobile-responsive optimizations.
- [ ] Deployment to scalable cloud infrastructure.
- [ ] User authentication and personalized race alerts.
