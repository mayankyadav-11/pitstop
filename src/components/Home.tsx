import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, TrendingUp, Zap, ChevronRight, Settings, AlertTriangle, Rocket, Radio, Loader2 } from 'lucide-react';
import { fetchWhyExplanation, fetchHomeLaps } from '../lib/api';
import { EventCard as EventType } from '../types';

export default function Home() {
  const [lapsData, setLapsData] = useState<Record<string, EventType[]>>({});
  const [selectedLap, setSelectedLap] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const data = await fetchHomeLaps();
      setLapsData(data);
      
      const lapNums = Object.keys(data).map(Number).sort((a, b) => a - b);
      if (lapNums.length > 0) {
        setSelectedLap(lapNums[lapNums.length - 1]);
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const sortedLaps = Object.keys(lapsData).map(Number).sort((a, b) => a - b);
  const currentEvents = selectedLap ? lapsData[selectedLap.toString()] || [] : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-headline font-bold text-on-surface-variant uppercase tracking-widest text-sm">
          Fetching Last 10 Laps...
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto pb-20"
    >
      {/* Dynamic Lap Selector */}
      <section className="bg-surface-low py-6 sticky top-0 z-40 border-b border-surface-high/30 backdrop-blur-md">
        <div className="px-6 mb-4 flex items-center justify-between">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Lap Explorer</span>
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Previous Race Results</span>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar px-6 gap-8 items-center">
          {sortedLaps.map((lap) => (
            <button 
              key={lap} 
              onClick={() => setSelectedLap(lap)}
              className={`flex flex-col items-center min-w-[56px] transition-all duration-300 group ${lap === selectedLap ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-60'}`}
            >
              <span className={`font-headline font-black text-sm mb-1 ${lap === selectedLap ? 'text-white' : 'text-on-surface-variant'}`}>
                L{lap}
              </span>
              <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${lap === selectedLap ? 'kinetic-gradient shadow-[0_0_10px_rgba(255,59,48,0.3)]' : 'bg-surface-high group-hover:bg-surface-highest'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* Event Cards */}
      <div className="px-4 py-8 space-y-6">
        <AnimatePresence mode="wait">
          {currentEvents.length > 0 ? (
            <motion.div 
              key={selectedLap}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
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
              className="py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-surface-high rounded-full flex items-center justify-center mx-auto opacity-20">
                <Zap className="w-8 h-8" />
              </div>
              <p className="text-on-surface-variant/40 font-headline font-bold uppercase tracking-widest text-sm italic">
                No major incidents or pits in Lap {selectedLap}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function EventCard({ event }: { event: EventType }) {
  const [showInsight, setShowInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const Icon = {
    pit: Settings,
    warning: AlertTriangle,
    overtake: Rocket,
    radio: Radio
  }[event.type];

  const bgColor = {
    pit: 'bg-surface-high/80 backdrop-blur-sm',
    warning: 'bg-surface/80 backdrop-blur-sm',
    overtake: 'bg-surface-high/80 border-l-4 border-tertiary backdrop-blur-sm',
    radio: 'bg-surface-low/80 backdrop-blur-sm'
  }[event.type];

  const handleWhyClick = async () => {
    if (showInsight) {
      setShowInsight(false);
      return;
    }

    setShowInsight(true);
    setIsLoading(true);

    try {
      const result = await fetchWhyExplanation(event.lap, `${event.title}: ${event.description}`);
      setAiInsight(result.explanation);
    } catch (err) {
      setAiInsight(event.insight || "Unable to fetch AI analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayInsight = aiInsight || event.insight;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-surface-high/20 shadow-2xl ${bgColor} group transition-all duration-500 hover:border-surface-highest/50`}>
      {/* Car background - 30% Opacity */}
      {event.teamCarImage && (
        <div className="absolute inset-0 opacity-30 pointer-events-none flex items-center justify-end overflow-hidden z-0">
          <img 
            src={event.teamCarImage} 
            className="h-[140%] object-contain -mr-16 transition-transform duration-700 group-hover:scale-105 group-hover:-translate-x-4" 
            alt="Team Car" 
          />
        </div>
      )}

      {event.image && (
        <div className="h-48 w-full relative z-10">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-high via-surface-high/40 to-transparent" />
          {event.stat && (
            <div className="absolute top-4 right-4 glass-panel px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
              <Timer className="w-3 h-3 text-primary" />
              <span className="font-headline font-bold text-[10px] tracking-widest uppercase">{event.stat}</span>
            </div>
          )}
        </div>
      )}
      
      <div className={`p-6 relative z-10 ${event.image ? '-mt-8' : ''}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110 ${
            event.type === 'pit' ? 'kinetic-gradient shadow-primary/20' : 
            event.type === 'warning' ? 'bg-yellow-500/20' :
            event.type === 'overtake' ? 'bg-tertiary/20' : 'bg-surface-high'
          }`}>
            <Icon className={`w-6 h-6 ${
              event.type === 'pit' ? 'text-on-primary' :
              event.type === 'warning' ? 'text-yellow-500' :
              event.type === 'overtake' ? 'text-tertiary' : 'text-on-surface-variant'
            }`} />
          </div>
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">Lap {event.lap}</span>
            <h2 className="font-headline font-black text-2xl tracking-tight text-on-surface uppercase italic leading-none">
              {event.title}
            </h2>
          </div>
        </div>
        
        <p className={`text-on-surface/80 text-sm leading-relaxed mb-6 font-medium max-w-2xl ${event.type === 'radio' ? 'italic' : ''}`}>
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          <button 
            onClick={handleWhyClick}
            disabled={isLoading}
            className={`px-8 py-3 rounded-xl font-headline font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 border border-surface-high/30 flex items-center gap-3 shadow-lg ${
            event.type === 'overtake' ? 'kinetic-gradient text-on-primary border-none text-shadow-sm' : 'bg-surface-bright text-on-surface hover:bg-surface-highest'
          } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}>
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing...
              </>
            ) : showInsight ? 'Close' : 'Why?'}
          </button>

          {event.impact && (
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest mb-1">Race Impact</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                event.impact === 'HIGH' ? 'bg-error/20 text-error' : 'bg-surface-highest text-on-surface-variant'
              }`}>
                {event.impact}
              </span>
            </div>
          )}

          {event.posGained && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-headline font-bold text-tertiary uppercase tracking-widest">{event.posGained}</span>
              <span className="text-[8px] font-body text-on-surface/40 uppercase font-black">Position Gained</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showInsight && displayInsight && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="p-5 bg-tertiary/10 border border-tertiary/20 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap className="w-12 h-12 text-tertiary" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span className="font-headline font-black text-xs text-tertiary uppercase tracking-widest">
                  {aiInsight ? 'PitStop AI Strategy Insight' : 'Strategy Insight'}
                </span>
              </div>
              <p className="text-sm text-on-surface/90 leading-relaxed font-bold italic">
                "{displayInsight}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
