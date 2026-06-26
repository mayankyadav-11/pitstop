/**
 * PitStop — Live Race Circuit Component
 * =====================================
 * Renders the live interactive circuit (SVG path + driver dots).
 * Supports standard GP track paths and backend telemetry track paths.
 */

import React, { useMemo } from "react";
import { CarPosition, TrackPoint } from "../../lib/useLiveTrack";
import DriverMarker from "./DriverMarker";

interface LiveCircuitProps {
  animatedPositions: CarPosition[];
  trackPath: TrackPoint[];
  selectedDriver: string | null;
  onSelectDriver: (driver: string | null) => void;
  fallbackSvgPath?: string;
  circuitName: string;
  countryName: string;
}

export const LiveCircuit: React.FC<LiveCircuitProps> = ({
  animatedPositions,
  trackPath,
  selectedDriver,
  onSelectDriver,
  fallbackSvgPath,
  circuitName,
  countryName,
}) => {
  // Build SVG path string from GPS track points if available
  const svgTrackPath = useMemo(() => {
    if (trackPath.length < 2) return fallbackSvgPath || "";
    const first = trackPath[0];
    let d = `M ${first.x},${first.y}`;
    for (let i = 1; i < trackPath.length; i++) {
      d += ` L ${trackPath[i].x},${trackPath[i].y}`;
    }
    d += " Z"; // Close the loop
    return d;
  }, [trackPath, fallbackSvgPath]);

  return (
    <div className="relative w-full h-[500px] bg-zinc-950/40 border border-zinc-800/40 rounded-2xl overflow-hidden flex items-center justify-center p-4">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 550 500"
        className="w-full h-full max-h-[460px] max-w-[500px] select-none"
        style={{ filter: "drop-shadow(0 0 20px rgba(239,68,68,0.03))" }}
      >
        <defs>
          <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="carGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <linearGradient id="trackStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
            <stop offset="50%" stopColor="rgba(239, 68, 68, 0.15)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.4)" />
          </linearGradient>
        </defs>

        {svgTrackPath ? (
          <>
            {/* Track Outer Highlight Glow */}
            <path
              d={svgTrackPath}
              fill="none"
              stroke="rgba(239, 68, 68, 0.08)"
              strokeWidth="26"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#trackGlow)"
            />
            {/* Track Asphalt Base */}
            <path
              d={svgTrackPath}
              fill="none"
              stroke="rgba(20, 20, 23, 0.85)"
              strokeWidth="20"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Racing/Guide Line */}
            <path
              d={svgTrackPath}
              fill="none"
              stroke="url(#trackStroke)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="6 3"
            />
          </>
        ) : (
          <text
            x="275"
            y="250"
            textAnchor="middle"
            fill="rgba(255,255,255,0.25)"
            fontSize="14"
            fontWeight="bold"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Fetching Live Circuit...
          </text>
        )}

        {/* ── Driver Markers ──────────────── */}
        {animatedPositions.map((car) => (
          <DriverMarker
            key={car.driver}
            x={car.x}
            y={car.y}
            driver={car.driver}
            color={car.color}
            team={car.team}
            number={car.number}
            name={car.name}
            position={car.position}
            isLeader={car.position === 1}
            isSelected={selectedDriver === car.driver}
            onSelect={() => onSelectDriver(selectedDriver === car.driver ? null : car.driver)}
          />
        ))}
      </svg>
    </div>
  );
};
