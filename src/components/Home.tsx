import { useState } from 'react';
import { motion } from 'motion/react';
import { Timer, TrendingUp, Zap, ChevronRight, Settings, AlertTriangle, Rocket, Radio, Loader2 } from 'lucide-react';
import { EVENTS } from '../constants';
import { fetchWhyExplanation } from '../lib/api';

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      {/* Race Timeline */}
      <section className="bg-surface-low py-4 sticky top-0 z-40 border-b border-surface-high/30">
        <div className="flex overflow-x-auto hide-scrollbar px-6 gap-6 items-center">
          {[15, 16, 17, 18, 19, 20, 21, 22].map((lap) => (
            <div key={lap} className={`flex flex-col items-center min-w-[48px] transition-opacity ${lap === 17 ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`font-headline font-bold text-xs ${lap === 17 ? 'text-primary' : ''}`}>L{lap}</span>
              <div className={`h-1 w-full rounded-full mt-1 ${lap === 17 ? 'kinetic-gradient h-1.5' : 'bg-surface-high'}`} />
              {lap === 17 && <Settings className="w-3 h-3 text-primary mt-1" />}
              {lap === 19 && <AlertTriangle className="w-3 h-3 text-yellow-400 mt-1" />}
            </div>
          ))}
        </div>
      </section>

      {/* Event Cards */}
      <div className="px-4 py-6 space-y-6">
        {EVENTS.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </motion.div>
  );
}

function EventCard({ event }: { event: typeof EVENTS[0] } & { key?: string | number }) {
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
    pit: 'bg-surface-high',
    warning: 'bg-surface',
    overtake: 'bg-surface-high border-l-4 border-tertiary',
    radio: 'bg-surface-low'
  }[event.type];

  // ─── "Why?" button handler → calls backend AI ──────────────
  const handleWhyClick = async () => {
    if (showInsight) {
      setShowInsight(false);
      return;
    }

    setShowInsight(true);
    setIsLoading(true);

    try {
      const result = await fetchWhyExplanation(event.lap);
      setAiInsight(result.explanation);
    } catch (err) {
      setAiInsight(event.insight || "Unable to fetch AI analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  // Use AI insight if available, otherwise fall back to hardcoded
  const displayInsight = aiInsight || event.insight;

  return (
    <div className={`rounded-2xl overflow-hidden border border-surface-high/10 shadow-xl ${bgColor}`}>
      {event.image && (
        <div className="h-48 w-full relative">
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
      
      <div className={`p-6 ${event.image ? '-mt-8 relative z-10' : ''}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
            event.type === 'pit' ? 'kinetic-gradient shadow-primary/20' : 
            event.type === 'warning' ? 'bg-yellow-500/20' :
            event.type === 'overtake' ? 'bg-tertiary/20' : 'bg-surface-high'
          }`}>
            <Icon className={`w-5 h-5 ${
              event.type === 'pit' ? 'text-on-primary' :
              event.type === 'warning' ? 'text-yellow-500' :
              event.type === 'overtake' ? 'text-tertiary' : 'text-on-surface-variant'
            }`} />
          </div>
          <h2 className="font-headline font-bold text-xl tracking-tight text-on-surface uppercase italic">
            LAP {event.lap}: {event.title}
          </h2>
        </div>
        
        <p className={`text-on-surface/80 text-sm leading-relaxed mb-6 ${event.type === 'radio' ? 'italic' : ''}`}>
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          {event.type !== 'radio' ? (
            <button 
              onClick={handleWhyClick}
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-surface-high/20 flex items-center gap-2 ${
              event.type === 'overtake' ? 'kinetic-gradient text-on-primary border-none' : 'bg-surface-bright text-on-surface'
            } ${isLoading ? 'opacity-70' : ''}`}>
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing...
                </>
              ) : showInsight ? 'Close' : 'Why?'}
            </button>
          ) : (
            <button className="text-on-surface/40 font-headline font-bold text-[10px] uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
              View Transcript <ChevronRight className="w-3 h-3" />
            </button>
          )}

          {event.type === 'pit' && (
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface-high bg-tertiary-container flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface-high bg-primary-container flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
          )}

          {event.impact && (
            <span className="text-[10px] font-headline font-bold text-on-surface/40 uppercase tracking-widest">Impact: {event.impact}</span>
          )}

          {event.posGained && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-headline font-bold text-tertiary uppercase tracking-widest">{event.posGained}</span>
              <span className="text-[8px] font-body text-on-surface/40 uppercase">Gained</span>
            </div>
          )}
        </div>

        {showInsight && displayInsight && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-tertiary" />
              <span className="font-headline font-bold text-xs text-tertiary uppercase tracking-widest">
                {aiInsight ? '🤖 AI Strategy Insight' : 'Strategy Insight'}
              </span>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-on-surface/60">
                <Loader2 className="w-4 h-4 animate-spin text-tertiary" />
                PitStop AI is analyzing lap {event.lap}...
              </div>
            ) : (
              <p className="text-sm text-on-surface/90 leading-relaxed font-medium">
                {displayInsight}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
