import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLiveTrack, CarPosition } from "../lib/useLiveTrack";
import { useAnimationEngine } from "../lib/useAnimationEngine";
import { getCircuitByMeetingLocation } from "../constants/tracks";
import { StaticCircuit } from "./race-map/StaticCircuit";
import { LiveCircuit } from "./race-map/LiveCircuit";
import RaceStatusOverlay from "./race-map/RaceStatusOverlay";

interface TrackMapProps {
  upcomingCircuit?: string;
}

export default function TrackMap({ upcomingCircuit }: TrackMapProps) {
  const {
    positions,
    currentLap,
    progress,
    isConnected,
    sessionInfo,
    trackPath,
    sessionStatus,
  } = useLiveTrack();

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // Interpolate car positions at 60fps
  const animatedPositions = useAnimationEngine(positions);

  // Look up circuit data based on active session location, falling back to the upcoming circuit from the API
  const circuitData = useMemo(() => {
    const meetingName = sessionInfo?.meetingName || upcomingCircuit || "abu_dhabi";
    return getCircuitByMeetingLocation(meetingName);
  }, [sessionInfo, upcomingCircuit]);

  // Determine view mode automatically based on whether the session has started
  const isSessionStarted =
    sessionStatus !== "pre_race" && sessionStatus !== "connecting";
  const viewMode = isSessionStarted ? "live" : "static";

  // Sort positions for the leaderboard
  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => {
      const posA = a.position || 999;
      const posB = b.position || 999;
      return posA - posB;
    });
  }, [positions]);

  const circuitName =
    sessionInfo?.circuitShortName ||
    sessionInfo?.meetingName ||
    circuitData.name;
  const countryName = sessionInfo?.countryName || circuitData.country;
  const totalLaps = sessionInfo?.totalLaps || 58;

  return (
    <div className="relative w-full h-full bg-zinc-950/45 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
      {/* ── Main View Area ────────────────────────────── */}
      <div className="relative flex-1 min-h-[300px]">
        {/* Race Flag Event Banner */}
        <RaceStatusOverlay sessionStatus={sessionStatus} />

        <AnimatePresence mode="wait">
          {viewMode === "static" ? (
            <motion.div
              key="static-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full"
            >
              <StaticCircuit
                circuit={circuitData}
                sessionInfo={sessionInfo}
                isConnected={isConnected}
              />
            </motion.div>
          ) : (
            <motion.div
              key="live-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full"
            >
              <LiveCircuit
                animatedPositions={animatedPositions}
                trackPath={trackPath}
                selectedDriver={selectedDriver}
                onSelectDriver={setSelectedDriver}
                fallbackSvgPath={circuitData.svgPath}
                circuitName={circuitName}
                countryName={countryName}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Floating Leaderboard (Live Mode only) ────── */}
        {viewMode === "live" && sortedPositions.length > 0 && (
          <div className="absolute bottom-4 right-4 z-10">
            <MiniLeaderboard
              positions={sortedPositions}
              selectedDriver={selectedDriver}
              onSelect={setSelectedDriver}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-Components ────────────────────────────────────────────

interface MiniLeaderboardProps {
  positions: CarPosition[];
  selectedDriver: string | null;
  onSelect: (driver: string | null) => void;
}

function MiniLeaderboard({
  positions,
  selectedDriver,
  onSelect,
}: MiniLeaderboardProps) {
  const displayDrivers = positions.slice(0, 10);

  const formatGap = (car: CarPosition) => {
    if (car.position === 1) return "Leader";
    const gap = (car as any).gapToLeader;
    if (gap === undefined || gap === null) return "--";
    if (typeof gap === "number") {
      return `+${gap.toFixed(1)}s`;
    }
    return String(gap);
  };

  return (
    <div className="bg-zinc-950/90 backdrop-blur-md rounded-xl border border-zinc-800/80 overflow-hidden w-[150px] max-h-[220px] overflow-y-auto shadow-2xl flex flex-col">
      <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
          Standings
        </span>
        <span className="text-[8px] font-mono text-zinc-500">Gap</span>
      </div>

      <div className="divide-y divide-zinc-900/85">
        {displayDrivers.map((car) => {
          const isActive = selectedDriver === car.driver;

          return (
            <button
              key={car.driver}
              onClick={() => onSelect(isActive ? null : car.driver)}
              className={`w-full flex items-center justify-between px-3 py-1.5 transition-all text-left group ${
                isActive
                  ? "bg-red-950/30 text-white"
                  : "hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold w-4 text-zinc-500">
                  {car.position}
                </span>
                <div
                  className="w-1.5 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: car.color || "#FFF" }}
                />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {car.driver}
                </span>
              </div>
              <span className="text-[9px] font-mono font-medium text-zinc-500 group-hover:text-zinc-400">
                {formatGap(car)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
