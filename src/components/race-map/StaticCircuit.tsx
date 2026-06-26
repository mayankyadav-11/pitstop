/**
 * PitStop — Pre-Race Static Circuit View
 * ========================================
 * Displays only the circuit image or SVG layout centered in the panel.
 */

import React from "react";
import { CircuitData } from "../../constants/tracks";
import { SessionInfo } from "../../lib/useLiveTrack";

interface StaticCircuitProps {
  circuit: CircuitData;
  sessionInfo: SessionInfo | null;
  isConnected: boolean;
}

export const StaticCircuit: React.FC<StaticCircuitProps> = ({
  circuit,
}) => {
  const imageUrl = circuit.trackImage ? `/track/${circuit.trackImage}` : null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-950/20 backdrop-blur-sm overflow-hidden p-6 rounded-3xl">
      {/* Radial ambient glow behind track */}
      <div className="absolute w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {imageUrl ? (
          <div className="relative group p-4 overflow-hidden flex items-center justify-center w-full h-full max-h-[460px] aspect-video">
            <img
              src={imageUrl}
              alt={`${circuit.name} Layout`}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>
        ) : (
          // Fallback Vector Rendering if image doesn't exist
          <div className="w-full h-full max-w-[450px] max-h-[450px] relative flex items-center justify-center">
            <svg
              viewBox="0 0 550 500"
              className="w-full h-full text-red-500/20 drop-shadow-[0_0_20px_rgba(239,68,68,0.25)]"
            >
              <path
                d={circuit.svgPath}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={circuit.svgPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-dash"
                style={{
                  strokeDasharray: "1000",
                  strokeDashoffset: "1000",
                  animation: "draw 10s linear infinite",
                }}
              />
            </svg>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          to {
            strokeDashoffset: 0;
          }
        }
        .animate-dash {
          animation: draw 8s linear infinite;
        }
      ` }} />
    </div>
  );
};
