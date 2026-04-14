import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Settings, Rocket, Radio, Loader2, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchWhyExplanation, fetchHomeLaps } from '../lib/api';
import { EventCard as EventType } from '../types';

const spotlightNews = [
  {
    id: 1,
    title: "Ferrari reveals aggressive aero upgrades for Singapore",
    url: "https://images.unsplash.com/photo-1541446700810-721fb65d6c29?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Verstappen dominates qualifying with blistering lap",
    url: "https://images.unsplash.com/photo-1536611413867-b87515d9da63?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Behind the scenes: McLaren's 1.8s pit stop",
    url: "https://images.unsplash.com/photo-1580274070966-28413de7e951?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Hamilton vs Alonso: The ultimate onboard perspective",
    url: "https://images.unsplash.com/photo-1508266497255-7da7574cc47b?auto=format&fit=crop&q=80&w=800",
  }
];

const mockLapsData2026: Record<string, EventType[]> = {
  "44": [{ id: "m1", lap: 44, title: "ANTONELLI PUSHING", description: "Antonelli sets personal best Sector 1", type: "warning", teamCarImage: "/logos/mercedes car.avif", impact: "MEDIUM" }],
  "45": [{ id: "m2", lap: 45, title: "NORRIS PIT STOP", description: "Norris boxes for fresh softs", type: "pit", teamCarImage: "/logos/mclaren car.avif", stat: "2.4s STOP" }],
  "46": [{ id: "m3", lap: 46, title: "SAINZ FASTEST LAP", description: "Carlos Sainz sets the fastest lap: 1:31.421", type: "warning", teamCarImage: "/logos/ferrari car.avif", impact: "MEDIUM" }],
  "47": [{ id: "m4", lap: 47, title: "DRS ENABLED", description: "Antonelli within DRS range of Verstappen", type: "radio", teamCarImage: "/logos/mercedes car.avif", impact: "HIGH" }],
  "48": [{ id: "m5", lap: 48, title: "OVERTAKE", description: "Antonelli overtakes Verstappen into Turn 1 for the lead", type: "overtake", teamCarImage: "/logos/mercedes car.avif", impact: "HIGH" }],
  "49": [{ id: "m6", lap: 49, title: "VERSTAPPEN LOCKUP", description: "Verstappen locks up at the Hairpin", type: "warning", teamCarImage: "/logos/redbull car.avif" }],
  "50": [{ id: "m7", lap: 50, title: "TSUNODA RETIRES", description: "Tsunoda pulls over with engine failure", type: "warning", teamCarImage: "/logos/racing bulls car.avif", impact: "HIGH" }],
  "51": [{ id: "m8", lap: 51, title: "YELLOW FLAG", description: "Sector 2 yellow flag due to Tsunoda's car", type: "warning", teamCarImage: "/logos/racing bulls car.avif", impact: "MEDIUM" }],
  "52": [{ id: "m9", lap: 52, title: "GREEN FLAG", description: "Track cleared. Racing resumes.", type: "warning" }],
  "53": [{ id: "m10", lap: 53, title: "CHEQUERED FLAG", description: "Kimi Antonelli wins the 2026 Japanese Grand Prix!", type: "warning", teamCarImage: "/logos/mercedes car.avif", impact: "HIGH" }]
};

export default function Home() {
  const [lapsData, setLapsData] = useState<Record<string, EventType[]>>({});
  const [selectedLap, setSelectedLap] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  async function init() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHomeLaps();
      
      // Fallback to mock 2026 data if API returns empty
      const finalData = Object.keys(data).length > 0 ? data : mockLapsData2026;
      setLapsData(finalData);
      
      const lapNums = Object.keys(finalData).map(Number).sort((a, b) => a - b);
      if (lapNums.length > 0) {
        // Select the latest lap by default
        setSelectedLap(lapNums[lapNums.length - 1]);
      }
    } catch (err) {
      console.error("Initialization failed:", err);
      setError("Unable to connect to the PitStop backend.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, []);


  const sortedLaps = Object.keys(lapsData).map(Number).sort((a, b) => a - b);
  const displayedLaps = sortedLaps.slice(-10);
  const currentEvents = selectedLap ? lapsData[selectedLap.toString()] || [] : [];

  const nextSpotlight = () => {
    setSpotlightIndex((prev) => (prev + 2 >= spotlightNews.length ? 0 : prev + 2));
  };
  
  const prevSpotlight = () => {
    setSpotlightIndex((prev) => (prev - 2 < 0 ? Math.max(0, spotlightNews.length - 2) : prev - 2));
  };

  const visibleNews = spotlightNews.slice(spotlightIndex, spotlightIndex + 2);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-headline font-bold text-on-surface-variant uppercase tracking-widest text-sm">
          Fetching Race Context...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center max-w-lg mx-auto gap-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group">
          <AlertTriangle className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-headline font-black text-on-surface uppercase italic italic">Connection Lost</h2>
            <p className="text-on-surface-variant leading-relaxed text-sm">
                The PitStop backend is currently unreachable. Strategic data and AI insights are unavailable.
            </p>
        </div>
        <div className="bg-surface-high/50 p-4 rounded-xl border border-white/5 w-full">
            <p className="text-[10px] font-mono text-on-surface-variant/60 mb-2 uppercase tracking-tight">Run this in your terminal:</p>
            <code className="text-xs text-primary font-mono block break-all">
                python -m uvicorn backend.main:app --reload --port 8000
            </code>
        </div>
        <button 
          onClick={() => init()}
          className="px-10 py-3 bg-primary text-white rounded-full font-headline font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,59,48,0.3)]"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-32">
      {/* ── Spotlight Section ────────────────────────────────────── */}
      <section className="px-8 mt-8 mb-4">
        <div className="flex flex-col gap-1 mb-6">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none">Trending</span>
            <h1 className="text-3xl font-headline font-black text-on-surface uppercase italic tracking-tight">Spotlight News</h1>
        </div>
        
        <div className="flex items-center gap-6">
            <button 
                onClick={prevSpotlight} 
                className="shrink-0 w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 flex items-center justify-center transition-all cursor-pointer group"
                aria-label="Previous news"
            >
                <ChevronLeft className="w-8 h-8 text-white group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex-1 relative overflow-hidden pb-4">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div 
                  key={spotlightIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {visibleNews.map((news) => (
                    <div key={news.id} className="relative rounded-[32px] overflow-hidden border border-white/5 group aspect-video bg-surface-highest shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      <img src={news.url} alt={news.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8">
                         <h3 className="text-xl md:text-2xl lg:text-3xl font-headline font-black text-white uppercase tracking-tight leading-none mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{news.title}</h3>
                         <div className="w-10 h-1 bg-primary rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <button 
                onClick={nextSpotlight} 
                className="shrink-0 w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 flex items-center justify-center transition-all cursor-pointer group"
                aria-label="Next news"
            >
                <ChevronRight className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </section>

      {/* ── Dynamic Lap Selector (Sticky Top) ────────────────────── */}
      <section className="bg-surface/90 backdrop-blur-3xl py-8 sticky top-0 z-40 border-y border-white/5 shadow-2xl">
        <div className="px-8 flex flex-col gap-1 mb-8">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none">JAPANESE GRAND PRIX</span>
            <h2 className="text-3xl font-headline font-black text-on-surface uppercase italic tracking-tight flex items-center gap-3">
              Race Replay <span className="text-xs text-on-surface-variant font-medium tracking-normal font-sans not-italic rounded-full px-3 py-1 bg-white/5 border border-white/10 uppercase">Showing last 10 laps</span>
            </h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar px-8 gap-10 items-end">
          {displayedLaps.map((lap) => (
            <button 
              key={lap} 
              onClick={() => setSelectedLap(lap)}
              className={`flex flex-col items-center min-w-[40px] transition-all duration-500 group relative ${lap === selectedLap ? 'opacity-100' : 'opacity-20 hover:opacity-40'}`}
            >
              <span className={`font-headline font-black text-sm mb-3 transition-colors ${lap === selectedLap ? 'text-white' : 'text-on-surface-variant'}`}>
                {lap}
              </span>
              <div className={`h-1 w-full rounded-full transition-all duration-500 ${lap === selectedLap ? 'bg-primary shadow-[0_0_15px_rgba(255,59,48,0.8)]' : 'bg-surface-highest group-hover:bg-on-surface-variant/20'}`} />
              {lap === selectedLap && (
                <motion.div 
                    layoutId="activeLapIndicator"
                    className="absolute -top-1 w-1 h-1 bg-primary rounded-full" 
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Event Feed ─────────────────────────────────────────── */}
      <div className="px-8 py-10 space-y-4">
        <AnimatePresence mode="wait">
          {currentEvents.length > 0 ? (
            <motion.div 
              key={selectedLap}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {currentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center"
            >
              <div className="w-16 h-16 bg-surface-high rounded-full flex items-center justify-center mx-auto opacity-10 mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <p className="text-on-surface-variant/30 font-headline font-bold uppercase tracking-[0.2em] text-xs italic">
                Clean Lap: No major incidents detected
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventType }) {
  const [showInsight, setShowInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const Icon = {
    pit: Settings,
    warning: AlertTriangle,
    overtake: Rocket,
    radio: Radio
  }[event.type || 'warning'];

  const handleWhyClick = async () => {
    if (showInsight) {
      setShowInsight(false);
      return;
    }

    setShowInsight(true);
    setIsLoadingInsight(true);

    try {
      const result = await fetchWhyExplanation(event.lap, `${event.title}: ${event.description}`);
      setAiInsight(result.explanation);
    } catch (err) {
      setAiInsight("Unable to fetch strategic analysis at this moment.");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <div className="group relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden transition-all duration-700 hover:border-white/30 hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)]">
      {/* ── Background Car Image (Glassmorphism integration) ──── */}
      {event.teamCarImage && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[32px]">
          <img 
            src={event.teamCarImage} 
            className="w-full h-[150%] object-cover object-center absolute -top-1/4 opacity-[0.15] mix-blend-screen group-hover:scale-105 transition-transform duration-1000"
            alt="Team Car" 
          />
          {/* Gradients to blend the car cleanly into the card */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      )}

      {/* ── Main Content Area ──────────────────────────────────── */}
      <div className="relative z-10 p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
        
        {/* Status Icon */}
        <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
           <Icon className="w-6 h-6 text-yellow-500" />
        </div>

        {/* Text Info */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-[#FF3B30] uppercase tracking-widest leading-none">Lap {event.lap}</span>
          </div>
          <h2 className="text-3xl font-headline font-black text-on-surface uppercase italic tracking-tight leading-none">
            {event.title}
          </h2>
          <p className="text-on-surface-variant/80 text-sm font-medium leading-relaxed max-w-xl pr-4">
            {event.description}
          </p>
        </div>

        {/* Static Spacing for Layout Consistency */}
        <div className="w-48 shrink-0 hidden lg:block" />
      </div>

      {/* ── Footer Actions ─────────────────────────────────────── */}
      <div className="relative z-10 px-8 pb-8 flex items-center gap-4">
        <button 
          onClick={handleWhyClick}
          disabled={isLoadingInsight}
          className={`px-8 py-2.5 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10 hover:bg-white/5 active:scale-95 flex items-center gap-2 ${isLoadingInsight ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isLoadingInsight ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Why?'}
        </button>

        {event.impact && (
          <div className="px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <span className="text-[7px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Race Impact</span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{event.impact}</span>
          </div>
        )}
      </div>

      {/* ── AI Insight Reveal ──────────────────────────────────── */}
      <AnimatePresence>
        {showInsight && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-on-surface/[0.02]"
          >
            <div className="p-8 pt-0 mt-8">
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <Zap className="w-20 h-20 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="font-headline font-black text-[10px] text-primary uppercase tracking-[0.2em]">
                            PitStop AI Strategy
                        </span>
                    </div>
                    <p className="text-sm text-on-surface font-medium leading-relaxed italic pr-4">
                        "{aiInsight || 'Analyzing race data...'}"
                    </p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

