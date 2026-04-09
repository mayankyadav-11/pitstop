import { motion, AnimatePresence } from 'motion/react';
import { useLiveTrack, CarPosition, TrackPoint } from '../lib/useLiveTrack';
import { Wifi, WifiOff, Flag } from 'lucide-react';
import { useState, useMemo } from 'react';

// Team colors — the backend sends hex colors but we also need glows
const TEAM_GLOWS: Record<string, string> = {
  'Red Bull Racing': 'rgba(54,113,198,0.6)',
  'Mercedes': 'rgba(108,211,191,0.6)',
  'McLaren': 'rgba(255,128,0,0.6)',
  'Ferrari': 'rgba(232,0,32,0.6)',
  'Alpine': 'rgba(34,147,209,0.6)',
  'Aston Martin': 'rgba(0,111,98,0.6)',
  'Haas F1 Team': 'rgba(182,186,189,0.6)',
  'RB': 'rgba(102,146,255,0.6)',
  'Williams': 'rgba(0,82,255,0.6)',
  'Kick Sauber': 'rgba(82,226,82,0.6)',
};

function getGlow(team: string): string {
  return TEAM_GLOWS[team] || 'rgba(255,255,255,0.4)';
}


export default function TrackMap() {
  const { positions, currentLap, progress, isConnected, sessionInfo, trackPath } = useLiveTrack();
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // Build SVG path string from GPS track points
  const svgTrackPath = useMemo(() => {
    if (trackPath.length < 2) return '';
    const first = trackPath[0];
    let d = `M ${first.x},${first.y}`;
    for (let i = 1; i < trackPath.length; i++) {
      d += ` L ${trackPath[i].x},${trackPath[i].y}`;
    }
    d += ' Z'; // close the loop
    return d;
  }, [trackPath]);

  // Sort positions for leaderboard
  const sortedPositions = useMemo(() => {
    return [...positions];
  }, [positions]);

  const circuitName = sessionInfo?.circuitShortName || sessionInfo?.meetingName || 'Waiting for data...';
  const countryName = sessionInfo?.countryName || '';
  const totalLaps = sessionInfo?.totalLaps || 0;

  return (
    <div className="relative w-full bg-surface-container rounded-2xl overflow-hidden border border-surface-high/20 shadow-2xl">
      {/* ── Header Bar ───────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-surface-high/50 border-b border-surface-high/30">
        <div className="flex items-center gap-3">
          <ConnectionBadge isConnected={isConnected} />
          {isConnected && currentLap > 0 && (
            <div className="flex items-center gap-2">
              <Flag className="w-3.5 h-3.5 text-primary" />
              <span className="font-headline font-bold text-xs text-on-surface uppercase tracking-widest">
                Lap {currentLap}{totalLaps ? ` / ${totalLaps}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        {isConnected && progress > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-surface-highest rounded-full overflow-hidden">
              <motion.div
                className="h-full kinetic-gradient rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* ── Main Track View ──────────────────────────── */}
      <div className="relative p-4 min-h-[350px]">
        <svg
          viewBox="0 0 550 500"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 20px rgba(220,38,38,0.05))' }}
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
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
            </linearGradient>
          </defs>

          {svgTrackPath ? (
            <>
              {/* Track shadow/glow */}
              <path
                d={svgTrackPath}
                fill="none"
                stroke="rgba(220,38,38,0.08)"
                strokeWidth="28"
                strokeLinejoin="round"
                strokeLinecap="round"
                filter="url(#trackGlow)"
              />
              {/* Track asphalt */}
              <path
                d={svgTrackPath}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="22"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Racing line */}
              <path
                d={svgTrackPath}
                fill="none"
                stroke="url(#trackStroke)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="8 4"
              />
            </>
          ) : (
            /* Loading placeholder */
            <text
              x="275" y="250"
              textAnchor="middle"
              fill="rgba(255,255,255,0.2)"
              fontSize="14"
              fontWeight="bold"
              style={{ fontFamily: 'var(--font-headline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Loading track telemetry...
            </text>
          )}

          {/* ── Car positions ──────────────────── */}
          {positions.map((car) => (
            <LiveCarDot
              key={car.driver}
              car={car}
              isSelected={selectedDriver === car.driver}
              onSelect={() => setSelectedDriver(
                selectedDriver === car.driver ? null : car.driver
              )}
            />
          ))}
        </svg>

        {/* ── Floating Leaderboard ─────────────────── */}
        {sortedPositions.length > 0 && (
          <div className="absolute bottom-3 right-3 z-10">
            <MiniLeaderboard
              positions={sortedPositions}
              selectedDriver={selectedDriver}
              onSelect={setSelectedDriver}
            />
          </div>
        )}

        {/* ── Circuit Name ──────────────────────────── */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-headline font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">
              {circuitName}
            </span>
            {countryName && (
              <span className="text-[7px] font-body text-on-surface-variant/30 uppercase tracking-widest">
                {countryName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Sub-Components ────────────────────────────────────────────

function ConnectionBadge({ isConnected }: { isConnected: boolean }) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
      isConnected
        ? 'bg-green-500/10 text-green-400 border-green-500/20'
        : 'bg-surface-high/50 text-on-surface-variant border-surface-high/30'
    }`}>
      {isConnected ? (
        <><Wifi className="w-3 h-3" /><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Live</>
      ) : (
        <><WifiOff className="w-3 h-3" /> Connecting...</>
      )}
    </span>
  );
}


function LiveCarDot({
  car,
  isSelected,
  onSelect,
}: {
  car: CarPosition;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const teamGlow = getGlow(car.team);
  const teamColor = car.color || '#FFFFFF';

  return (
    <g onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Glow ring */}
      <motion.circle
        r={isSelected ? 16 : 12}
        fill={teamGlow}
        animate={{ cx: car.x, cy: car.y }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        filter="url(#carGlow)"
        opacity={isSelected ? 0.8 : 0.4}
      />

      {/* Car dot */}
      <motion.circle
        r={isSelected ? 10 : 7}
        fill={teamColor}
        stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
        strokeWidth={isSelected ? 2 : 1}
        animate={{ cx: car.x, cy: car.y }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 4px ${teamColor})` }}
      />

      {/* Driver number */}
      <motion.text
        fontSize={isSelected ? 8 : 6}
        fontWeight="900"
        fill="white"
        textAnchor="middle"
        dy=".35em"
        animate={{ x: car.x, y: car.y }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ pointerEvents: 'none', fontFamily: 'var(--font-headline)' }}
      >
        {car.number}
      </motion.text>

      {/* Name label (when selected) */}
      <AnimatePresence>
        {isSelected && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.rect
              rx="4"
              width="80"
              height="20"
              fill="rgba(0,0,0,0.85)"
              stroke={teamColor}
              strokeWidth="1"
              animate={{ x: car.x - 40, y: car.y - 28 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            <motion.text
              fontSize="7"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              dy=".35em"
              animate={{ x: car.x, y: car.y - 18 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{ pointerEvents: 'none', fontFamily: 'var(--font-headline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {car.name}
            </motion.text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}


function MiniLeaderboard({
  positions,
  selectedDriver,
  onSelect,
}: {
  positions: CarPosition[];
  selectedDriver: string | null;
  onSelect: (d: string | null) => void;
}) {
  if (positions.length === 0) return null;

  // Show max 10 drivers in the mini leaderboard
  const display = positions.slice(0, 10);

  return (
    <div className="bg-black/70 backdrop-blur-md rounded-xl border border-surface-high/20 overflow-hidden min-w-[130px] max-h-[280px] overflow-y-auto hide-scrollbar">
      <div className="px-3 py-1.5 bg-surface-high/30 border-b border-surface-high/20">
        <span className="text-[8px] font-headline font-bold text-on-surface-variant uppercase tracking-[0.15em]">
          Positions
        </span>
      </div>
      {display.map((car, idx) => {
        const isActive = selectedDriver === car.driver;
        return (
          <button
            key={car.driver}
            onClick={() => onSelect(isActive ? null : car.driver)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors ${
              isActive ? 'bg-white/10' : 'hover:bg-white/5'
            } ${idx < display.length - 1 ? 'border-b border-surface-high/10' : ''}`}
          >
            <span className="text-[9px] font-headline font-bold text-on-surface-variant/60 w-4">
              P{idx + 1}
            </span>
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: car.color, boxShadow: `0 0 4px ${getGlow(car.team)}` }}
            />
            <span className={`text-[10px] font-headline font-bold uppercase tracking-wider flex-1 text-left ${
              isActive ? 'text-on-surface' : 'text-on-surface/70'
            }`}>
              {car.driver}
            </span>
          </button>
        );
      })}
    </div>
  );
}
