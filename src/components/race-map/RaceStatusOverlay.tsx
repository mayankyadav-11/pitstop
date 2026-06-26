/**
 * PitStop — Race Status Overlay
 * ================================
 * Displays animated banners for flag events:
 *  - Safety Car (amber)
 *  - Virtual Safety Car (amber)
 *  - Red Flag (red)
 *  - Finished (chequered)
 * Auto-dismisses when green flag resumes.
 */

import { motion, AnimatePresence } from 'motion/react';
import type { SessionStatus } from '../../lib/useLiveTrack';

interface RaceStatusOverlayProps {
  sessionStatus: SessionStatus;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  bg: string;
  border: string;
  textColor: string;
  pulseColor: string;
  icon: string;
}> = {
  safety_car: {
    label: 'SAFETY CAR DEPLOYED',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    textColor: 'text-amber-400',
    pulseColor: 'bg-amber-400',
    icon: '🟡',
  },
  vsc: {
    label: 'VIRTUAL SAFETY CAR',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    textColor: 'text-amber-300',
    pulseColor: 'bg-amber-300',
    icon: '🟡',
  },
  red_flag: {
    label: 'RED FLAG — SESSION STOPPED',
    bg: 'bg-red-600/25',
    border: 'border-red-500/60',
    textColor: 'text-red-400',
    pulseColor: 'bg-red-500',
    icon: '🔴',
  },
  finished: {
    label: 'CHEQUERED FLAG',
    bg: 'bg-white/10',
    border: 'border-white/30',
    textColor: 'text-white',
    pulseColor: 'bg-white',
    icon: '🏁',
  },
};

export default function RaceStatusOverlay({ sessionStatus }: RaceStatusOverlayProps) {
  const config = STATUS_CONFIG[sessionStatus];
  const shouldShow = !!config;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 px-5 py-2 rounded-full 
            ${config.bg} backdrop-blur-xl border ${config.border} 
            flex items-center gap-3 shadow-2xl`}
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.pulseColor}`} />
          </span>

          {/* Icon */}
          <span className="text-sm">{config.icon}</span>

          {/* Label */}
          <span className={`font-headline font-black text-[10px] uppercase tracking-[0.2em] ${config.textColor}`}>
            {config.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
