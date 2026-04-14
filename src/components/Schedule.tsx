import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, Trophy, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DRIVERS } from '../constants';

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
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl kinetic-gradient flex items-center justify-center shadow-xl shadow-primary/30">
              <Calendar className="w-7 h-7 md:w-8 md:h-8 text-on-primary" />
            </div>
            <div>
              <h1 className="font-headline font-bold text-3xl md:text-4xl uppercase tracking-wider text-white">
                {season} Season
              </h1>
              <p className="text-xs md:text-sm font-headline font-bold text-white/60 uppercase tracking-[0.1em] mt-1.5">
                {races.length} Rounds · FIA Formula 1 World Championship
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Race Grid ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [hoveredDriverIdx, setHoveredDriverIdx] = useState<number | null>(null);

  const handleClick = async () => {
    if (!isPast) return;
    
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }
    
    setIsExpanded(true);
    if (!results) {
      setLoadingResults(true);
      try {
        const res = await fetch(`https://api.jolpi.ca/ergast/f1/2026/${race.round}/results.json`);
        const data = await res.json();
        const apiResults = data.MRData.RaceTable.Races[0]?.Results?.slice(0, 3) || [];
        setResults(apiResults);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoadingResults(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`
        relative rounded-3xl overflow-hidden transition-all duration-300 backdrop-blur-sm
        ${isPast ? 'cursor-pointer' : isNext ? 'cursor-default' : 'cursor-default'}
        ${isNext
          ? 'bg-gradient-to-br from-primary/40 via-primary/20 to-primary/10 border border-primary/50 shadow-[0_0_30px_rgba(225,6,0,0.3)]'
          : 'bg-gradient-to-br from-white/10 to-transparent bg-black/40 border border-white/10 shadow-2xl hover:border-white/30 hover:bg-white/[0.05]'
        }
      `}
      onClick={handleClick}
    >
      <div className="relative p-6 md:p-8 min-h-[220px] flex flex-col justify-between z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="race-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full justify-between"
            >
              {/* Top: Round + badges */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] md:text-xs font-headline font-bold uppercase tracking-widest ${
                    isNext ? 'text-primary' : 'text-white/80'
                  }`}>
                    Round {race.round}
                  </span>
                  {race.hasSprint && (
                    <span className="text-[9px] md:text-[10px] font-headline font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 text-white shadow-inner">
                      Sprint
                    </span>
                  )}
                </div>
                {isNext && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-[9px] md:text-[10px] font-headline font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary text-white shadow-md shadow-primary/30"
                  >
                    Next Race <ChevronRight className="w-3 h-3" />
                  </motion.span>
                )}
                {isPast && (
                  <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-headline font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-green-500 text-white shadow-md shadow-green-500/30">
                    COMPLETED
                  </span>
                )}
                {!isPast && !isNext && <Trophy className="w-4 h-4 text-white/50" />}
              </div>

              {/* Race name with flag */}
              <div className="mb-2">
                <div className="flex items-center gap-3 mb-2.5">
                  <img
                    src={`https://flagcdn.com/w40/${race.flag}.png`}
                    srcSet={`https://flagcdn.com/w80/${race.flag}.png 2x`}
                    alt={race.country}
                    className="w-6 h-4 object-cover rounded shadow border border-white/20"
                  />
                  <h2 className={`font-headline font-black italic text-xl md:text-2xl tracking-tighter leading-none ${
                    isNext ? 'text-white' : isPast ? 'text-white' : 'text-white/90'
                  }`}>
                    {race.raceName}
                  </h2>
                </div>

                {/* Circuit name + locality */}
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isNext ? 'text-white/80' : 'text-white/70'
                  }`} />
                  <p className={`text-[11px] md:text-xs font-headline font-bold uppercase tracking-wider ${
                    isNext ? 'text-white/90' : isPast ? 'text-white/90' : 'text-white/80'
                  }`}>
                    {race.circuitName}
                  </p>
                </div>
                <p className={`text-[10px] md:text-[11px] font-headline font-bold uppercase tracking-widest pl-[22px] ${
                  isNext ? 'text-white/70' : isPast ? 'text-white/70' : 'text-white/60'
                }`}>
                  {race.locality}, {race.country}
                </p>
              </div>

              {/* Date */}
              <div className="mt-auto pt-4 flex justify-between items-center">
                <span className={`text-sm md:text-base font-headline font-black uppercase tracking-widest ${
                  isNext ? 'text-white' : isPast ? 'text-white' : 'text-white/90'
                }`}>
                  {race.dateLabel}
                </span>
                {isPast && (
                   <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">Click for Results</span>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="race-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h3 className="font-headline font-black text-white uppercase tracking-widest flex items-center gap-2 shadow-sm italic text-sm">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Race Results
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Top 3 Podium</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center gap-2 relative">
                {loadingResults ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : results && results.length > 0 ? (
                  results.map((res: any, i: number) => {
                    const normalizedApiName = res.Driver.familyName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const localDriver = DRIVERS.find(d => {
                      const normalizedD = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                      return normalizedD.includes(normalizedApiName) || normalizedApiName.includes(normalizedD);
                    });
                    const color = localDriver?.color || '#555';
                    const hoverSelected = hoveredDriverIdx === i;

                    return (
                      <div 
                        key={res.position}
                        onMouseEnter={() => setHoveredDriverIdx(i)}
                        onMouseLeave={() => setHoveredDriverIdx(null)}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 transition-all duration-300 relative overflow-hidden"
                      >
                        <div 
                          className="absolute inset-0 transition-opacity duration-500 z-0"
                          style={{
                            backgroundColor: color,
                            opacity: hoverSelected ? 0.3 : 0,
                          }}
                        />
                        <span className="relative z-10 w-4 font-headline font-black text-lg italic text-white/80 shrink-0 text-center">{res.position}</span>
                        <div className="relative z-10 w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0 shadow-inner">
                          <img 
                            src={localDriver?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.Driver.driverId}`}
                            className="w-full h-full object-cover"
                            alt={res.Driver.familyName}
                          />
                        </div>
                        <div className="relative z-10 flex-1 min-w-0">
                           <h4 className="font-headline font-black text-sm uppercase truncate tracking-tight text-white mb-0.5">{res.Driver.givenName} {res.Driver.familyName}</h4>
                           <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                             <p className="text-[9px] font-headline font-bold uppercase tracking-widest text-white/50 truncate">{res.Constructor.name}</p>
                           </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-white/50 uppercase tracking-widest font-headline">No results pending</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
