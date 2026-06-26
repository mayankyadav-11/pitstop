/**
 * PitStop — Driver Marker (SVG Component)
 * ==========================================
 * Pure SVG <g> element for a single driver dot on the live circuit.
 * Uses raw SVG transforms for position — no React state on movement.
 */

import React, { memo } from 'react';

interface DriverMarkerProps {
  x: number;
  y: number;
  driver: string;
  color: string;
  team: string;
  number: string;
  name: string;
  position: number;
  isLeader: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

// Team color -> glow color mapping
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

const DriverMarker = memo(function DriverMarker({
  x,
  y,
  driver,
  color,
  team,
  number,
  name,
  position,
  isLeader,
  isSelected,
  onSelect,
}: DriverMarkerProps) {
  const glow = getGlow(team);
  const dotRadius = isSelected ? 10 : 7;
  const glowRadius = isSelected ? 16 : 12;

  return (
    <g
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
      transform={`translate(${x}, ${y})`}
    >
      {/* Glow ring */}
      <circle
        r={glowRadius}
        fill={glow}
        filter="url(#carGlow)"
        opacity={isSelected ? 0.8 : 0.4}
      />

      {/* Leader crown indicator */}
      {isLeader && (
        <g transform="translate(0, -16)">
          <polygon
            points="-5,0 -3,-6 0,-3 3,-6 5,0"
            fill="#FFD700"
            stroke="#B8860B"
            strokeWidth="0.5"
            opacity={0.9}
          />
        </g>
      )}

      {/* Car dot */}
      <circle
        r={dotRadius}
        fill={color}
        stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
        strokeWidth={isSelected ? 2 : 1}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />

      {/* Driver abbreviation */}
      <text
        fontSize={isSelected ? 7 : 5.5}
        fontWeight="900"
        fill="white"
        textAnchor="middle"
        dy=".35em"
        style={{
          pointerEvents: 'none',
          fontFamily: 'var(--font-headline)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        {driver}
      </text>

      {/* Position badge (when not selected) */}
      {!isSelected && position > 0 && (
        <g transform="translate(8, -8)">
          <circle r="5" fill="rgba(0,0,0,0.8)" stroke={color} strokeWidth="0.5" />
          <text
            fontSize="5"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            dy=".35em"
            style={{ pointerEvents: 'none', fontFamily: 'var(--font-headline)' }}
          >
            {position}
          </text>
        </g>
      )}

      {/* Expanded info tooltip (when selected) */}
      {isSelected && (
        <g transform="translate(0, -28)">
          <rect
            x={-45}
            y={-12}
            rx="6"
            width="90"
            height="24"
            fill="rgba(0,0,0,0.9)"
            stroke={color}
            strokeWidth="1"
          />
          <text
            fontSize="6"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            dy="-2"
            style={{
              pointerEvents: 'none',
              fontFamily: 'var(--font-headline)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {name}
          </text>
          <text
            fontSize="5"
            fontWeight="600"
            fill="rgba(255,255,255,0.6)"
            textAnchor="middle"
            dy="7"
            style={{
              pointerEvents: 'none',
              fontFamily: 'var(--font-headline)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            P{position} · #{number}
          </text>
        </g>
      )}
    </g>
  );
});

export default DriverMarker;
