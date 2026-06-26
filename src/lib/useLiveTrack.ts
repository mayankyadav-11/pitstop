/**
 * PitStop — Socket.IO Live Track Hook (v3)
 * ==========================================
 * Connects to the backend Socket.IO server and provides:
 *  - Real-time car positions (scaled to SVG coordinates)
 *  - Current lap number & race progress
 *  - Session metadata (circuit name, country, etc.)
 *  - The GPS-accurate track path for rendering the circuit
 *  - Session status (pre_race / started / safety_car / vsc / red_flag / finished)
 *  - Race control events (flags, SC, VSC)
 *  - Exponential-backoff reconnection
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface CarPosition {
  driver: string;
  name: string;
  team: string;
  color: string;
  number: string;
  x: number;
  y: number;
  position: number;
}

export interface TrackUpdate {
  lap: number;
  cars: CarPosition[];
  progress: number;
  sessionStatus: string;
}

export interface SessionInfo {
  sessionName: string;
  circuitKey: number;
  meetingName: string;
  circuitShortName: string;
  countryName: string;
  totalLaps: number;
}

export interface TrackPoint {
  x: number;
  y: number;
}

export interface RaceControlEvent {
  flag: string;
  message: string;
  category: string;
  lap_number: number | null;
  driver_number: number | null;
}

export type SessionStatus = 
  | "pre_race"
  | "started"
  | "safety_car"
  | "vsc"
  | "red_flag"
  | "finished"
  | "connecting";

export function useLiveTrack() {
  const [positions, setPositions] = useState<CarPosition[]>([]);
  const [currentLap, setCurrentLap] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [trackPath, setTrackPath] = useState<TrackPoint[]>([]);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("connecting");
  const [raceControlEvents, setRaceControlEvents] = useState<RaceControlEvent[]>([]);
  const [latestFlag, setLatestFlag] = useState<RaceControlEvent | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptRef = useRef(0);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io/socket.io",
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to PitStop live feed");
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from PitStop live feed");
      setIsConnected(false);
    });

    socket.on("reconnect_attempt", (attempt: number) => {
      reconnectAttemptRef.current = attempt;
      console.log(`🔄 Reconnection attempt ${attempt}...`);
    });

    socket.on("reconnect", () => {
      console.log("✅ Reconnected to PitStop live feed");
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
    });

    socket.on("track_update", (data: TrackUpdate) => {
      setPositions(data.cars);
      setCurrentLap(data.lap);
      setProgress(data.progress);
      if (data.sessionStatus) {
        setSessionStatus(data.sessionStatus as SessionStatus);
      }
    });

    socket.on("session_info", (data: SessionInfo) => {
      setSessionInfo(data);
      console.log("📡 Session:", data.meetingName, `(${data.circuitShortName})`);
    });

    socket.on("session_status", (data: { status: string }) => {
      setSessionStatus(data.status as SessionStatus);
      console.log("📡 Session status:", data.status);
    });

    socket.on("track_path", (data: TrackPoint[]) => {
      console.log(`🗺️ Track path received: ${data.length} points`);
      setTrackPath(data);
    });

    socket.on("race_control", (events: RaceControlEvent[]) => {
      setRaceControlEvents(prev => [...prev.slice(-50), ...events]);
      // Track latest flag-type event for the overlay
      const flagEvent = events.find(e => e.flag);
      if (flagEvent) {
        setLatestFlag(flagEvent);
      }
      console.log("🏁 Race control:", events.map(e => e.message).join(", "));
    });

    socket.on("status", (data: { message: string }) => {
      console.log("📡 Server:", data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearLatestFlag = useCallback(() => {
    setLatestFlag(null);
  }, []);

  return {
    positions,
    currentLap,
    progress,
    isConnected,
    sessionInfo,
    trackPath,
    sessionStatus,
    raceControlEvents,
    latestFlag,
    clearLatestFlag,
  };
}
