/**
 * PitStop — Socket.IO Live Track Hook (v2)
 * ==========================================
 * Connects to the backend Socket.IO server and provides:
 *  - Real-time car positions (scaled to SVG coordinates)
 *  - Current lap number & race progress
 *  - Session metadata (circuit name, country, etc.)
 *  - The GPS-accurate track path for rendering the circuit
 */

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

export interface CarPosition {
  driver: string;
  name: string;
  team: string;
  color: string;
  number: string;
  x: number;
  y: number;
}

export interface TrackUpdate {
  lap: number;
  cars: CarPosition[];
  progress: number;
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

export function useLiveTrack() {
  const [positions, setPositions] = useState<CarPosition[]>([]);
  const [currentLap, setCurrentLap] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [trackPath, setTrackPath] = useState<TrackPoint[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io/socket.io",
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to PitStop live feed");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from PitStop live feed");
      setIsConnected(false);
    });

    socket.on("track_update", (data: TrackUpdate) => {
      setPositions(data.cars);
      setCurrentLap(data.lap);
      setProgress(data.progress);
    });

    socket.on("session_info", (data: SessionInfo) => {
      setSessionInfo(data);
      console.log("📡 Session:", data.meetingName, `(${data.circuitShortName})`);
    });

    socket.on("track_path", (data: TrackPoint[]) => {
      console.log(`🗺️ Track path received: ${data.length} points`);
      setTrackPath(data);
    });

    socket.on("status", (data: { message: string }) => {
      console.log("📡 Server:", data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { positions, currentLap, progress, isConnected, sessionInfo, trackPath };
}
