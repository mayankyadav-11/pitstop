import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, Trophy, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   Types for the Ergast/Jolpi API response
   ────────────────────────────────────────────────────────────── */
interface ApiCircuit {
  circuitId: string;
  circuitName: string;
  Location: {
    locality: string;
    country: string;
  };
}

interface ApiRace {
  season: string;
  round: string;
  raceName: string;
  Circuit: ApiCircuit;
  date: string;               // "2026-03-08"
  time?: string;              // "04:00:00Z"
  FirstPractice?: { date: string };
  Sprint?: { date: string };
}

interface Race {
  round: number;
  raceName: string;
  circuitName: string;
  locality: string;
  country: string;
  circuitId: string;
  raceDate: Date;
  firstPracticeDate: string;
  dateLabel: string;           // e.g. "06 – 08 MAR"
  flag: string;
  hasSprint: boolean;
}

/* ─────────────────────────────────────────────────────────────
   Country → Flag code mapping
   ────────────────────────────────────────────────────────────── */
const COUNTRY_FLAGS: Record<string, string> = {
  'Australia':    'au',
  'China':        'cn',
  'Japan':        'jp',
  'USA':          'us',
  'Canada':       'ca',
  'Monaco':       'mc',
  'Spain':        'es',
  'Austria':      'at',
  'UK':           'gb',
  'Belgium':      'be',
  'Hungary':      'hu',
  'Netherlands':  'nl',
  'Italy':        'it',
  'Azerbaijan':   'az',
  'Singapore':    'sg',
  'Mexico':       'mx',
  'Brazil':       'br',
  'Qatar':        'qa',
  'UAE':          'ae',
  'Bahrain':      'bh',
  'Saudi Arabia': 'sa',
  'France':       'fr',
  'Portugal':     'pt',
};

const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

/* ─────────────────────────────────────────────────────────────
   Parse API data into our Race type
   ────────────────────────────────────────────────────────────── */
function parseRaces(apiRaces: ApiRace[]): Race[] {
  return apiRaces.map((r) => {
    const raceDate = new Date(r.date + 'T' + (r.time || '12:00:00Z'));
    const fp1Date = r.FirstPractice?.date || r.date;

    // Build date label like "06 – 08 MAR"
    const fpDay = new Date(fp1Date).getUTCDate().toString().padStart(2, '0');
    const raceDay = raceDate.getUTCDate().toString().padStart(2, '0');
    const fpMonth = MONTH_NAMES[new Date(fp1Date).getUTCMonth()];
    const raceMonth = MONTH_NAMES[raceDate.getUTCMonth()];

    let dateLabel: string;
    if (fpMonth === raceMonth) {
      dateLabel = `${fpDay} – ${raceDay} ${raceMonth}`;
    } else {
      dateLabel = `${fpDay} ${fpMonth} – ${raceDay} ${raceMonth}`;
    }

    return {
      round: parseInt(r.round),
      raceName: r.raceName,
      circuitName: r.Circuit.circuitName,
      locality: r.Circuit.Location.locality,
      country: r.Circuit.Location.country,
      circuitId: r.Circuit.circuitId,
      raceDate,
      firstPracticeDate: fp1Date,
      dateLabel,
      flag: COUNTRY_FLAGS[r.Circuit.Location.country] || 'un',
      hasSprint: !!r.Sprint,
    };
  });
}

/* ─────────────────────────────────────────────────────────────
   Find next race index
   ────────────────────────────────────────────────────────────── */
function getNextRaceIndex(races: Race[]): number {
  const now = new Date();
  for (let i = 0; i < races.length; i++) {
    if (now <= races[i].raceDate) return i;
  }
  return races.length - 1;
}


/* ─────────────────────────────────────────────────────────────
   Schedule Component
   ────────────────────────────────────────────────────────────── */
export default function Schedule() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.jolpi.ca/ergast/f1/current.json')
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const apiRaces = data.MRData.RaceTable.Races as ApiRace[];
        setRaces(parseRaces(apiRaces));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch F1 schedule:', err);
        setError('Unable to load schedule. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-headline text-on-surface-variant/60 uppercase tracking-widest">
          Loading 2026 Calendar…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-sm font-headline text-primary uppercase">{error}</p>
      </div>
    );
  }

  const nextIdx = getNextRaceIndex(races);
  const season = races[0]?.raceDate.getUTCFullYear() || 2026;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen"
    >
      {/* ── F1 Car Hero Background ─────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src="/f1-hero.png"
          alt=""
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] max-w-[1400px] opacity-[0.07] object-contain"
          style={{ filter: 'blur(1px)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(225,6,0,0.06) 0%, transparent 60%)',
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* ── Header ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl kinetic-gradient flex items-center justify-center shadow-xl shadow-primary/30">
              <Calendar className="w-6 h-6 text-on-primary" />
            </div>
            <div>
              <h1 className="font-headline font-bold text-2xl uppercase tracking-wider text-on-surface">
                {season} Season
              </h1>
              <p className="text-[11px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.15em]">
                {races.length} Rounds · FIA Formula 1 World Championship
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-widest">
              Next: Round {races[nextIdx]?.round}
            </span>
          </div>
        </motion.div>

        {/* ── Race Grid ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {races.map((race, idx) => (
              <RaceCard
                key={race.round}
                race={race}
                isPast={idx < nextIdx}
                isNext={idx === nextIdx}
                isHovered={hoveredIdx === idx}
                index={idx}
                onHover={() => setHoveredIdx(idx)}
                onLeave={() => setHoveredIdx(null)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <p className="text-center text-[9px] font-headline text-on-surface-variant/25 uppercase tracking-widest mt-10">
          Data sourced from Ergast F1 API · All times local · Subject to FIA confirmation
        </p>
      </div>
    </motion.div>
  );
}


/* ─────────────────────────────────────────────────────────────
   Race Card
   ────────────────────────────────────────────────────────────── */
function RaceCard({
  race,
  isPast,
  isNext,
  isHovered,
  index,
  onHover,
  onLeave,
}: {
  race: Race;
  isPast: boolean;
  isNext: boolean;
  isHovered: boolean;
  index: number;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
        ${isNext
          ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/40 shadow-2xl shadow-primary/15'
          : 'bg-surface border border-surface-high/15 hover:border-surface-high/30 shadow-lg hover:shadow-xl'
        }
      `}
    >
      <div className="relative p-5 pb-4 min-h-[160px] flex flex-col justify-between z-10">
        {/* Top: Round + badges */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-headline font-bold uppercase tracking-widest ${
              isNext ? 'text-primary' : 'text-on-surface-variant/35'
            }`}>
              Round {race.round}
            </span>
            {race.hasSprint && (
              <span className="text-[8px] font-headline font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-on-surface-variant/10 text-on-surface-variant/50">
                Sprint
              </span>
            )}
          </div>
          {isNext && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-[9px] font-headline font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary text-on-primary shadow-md shadow-primary/30"
            >
              Next Race <ChevronRight className="w-3 h-3" />
            </motion.span>
          )}
          {isPast && (
            <span className="flex items-center gap-1 text-[9px] font-headline font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-green-500 text-white shadow-md shadow-green-500/30">
              COMPLETED
            </span>
          )}
          {!isPast && !isNext && <Trophy className="w-3.5 h-3.5 text-on-surface-variant/20" />}
        </div>

        {/* Race name with flag */}
        <div className="mb-1">
          <div className="flex items-center gap-2.5 mb-1.5">
            <img
              src={`https://flagcdn.com/w40/${race.flag}.png`}
              srcSet={`https://flagcdn.com/w80/${race.flag}.png 2x`}
              alt={race.country}
              className="w-5 h-4 object-cover rounded-sm shadow border border-white/10"
            />
            <h2 className={`font-headline font-bold text-lg tracking-tight leading-tight ${
              isNext ? 'text-on-surface' : isPast ? 'text-on-surface' : 'text-on-surface/90'
            }`}>
              {race.raceName}
            </h2>
          </div>

          {/* Circuit name + locality */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <MapPin className={`w-3 h-3 flex-shrink-0 ${
              isNext ? 'text-primary/60' : 'text-on-surface-variant/25'
            }`} />
            <p className={`text-[10px] font-body leading-snug ${
              isNext ? 'text-on-surface-variant/60' : isPast ? 'text-on-surface-variant/60' : 'text-on-surface-variant/30'
            }`}>
              {race.circuitName}
            </p>
          </div>
          <p className={`text-[10px] font-body pl-[18px] ${
            isNext ? 'text-on-surface-variant/40' : isPast ? 'text-on-surface-variant/40' : 'text-on-surface-variant/20'
          }`}>
            {race.locality}, {race.country}
          </p>
        </div>

        {/* Date */}
        <div className="mt-auto pt-3">
          <span className={`text-sm font-headline font-bold uppercase tracking-wider ${
            isNext ? 'text-primary' : isPast ? 'text-on-surface' : 'text-on-surface-variant/60'
          }`}>
            {race.dateLabel}
          </span>
        </div>
      </div>

      {/* Hover glow */}
      {isHovered && !isPast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: isNext
              ? 'radial-gradient(circle at 80% 80%, rgba(225,6,0,0.12) 0%, transparent 60%)'
              : 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 60%)',
          }}
        />
      )}
    </motion.div>
  );
}
