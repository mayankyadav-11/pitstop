import { motion } from 'motion/react';
import { Share2, MessagesSquare, Send, Trophy, MapPin, ChevronRight, User, Timer } from 'lucide-react';
import { MESSAGES, DRIVERS } from '../constants';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLiveTrack } from '../lib/useLiveTrack';

interface RacePodium {
  pos: number;
  name: string;
  team: string;
  constructorId: string;
}

interface GridDriver {
  pos: number;
  name: string;
  team: string;
  driverId: string;
}

interface NextRace {
  round: string;
  name: string;
  circuit: string;
  date: string;
  time: string;
}

const TRACK_MAP: Record<string, string> = {
  "budapest": "Budapest-1.png",
  "hungaroring": "Budapest-1.png",
  "silverstone": "Silverstone-1.png",
  "marina bay": "Singapore-1.png",
  "singapore": "Singapore-1.png",
  "yas marina": "abu_dhabi-1.png",
  "abu dhabi": "abu_dhabi-1.png",
  "americas": "austin-1.png",
  "austin": "austin-1.png",
  "baku": "baku-1.png",
  "barcelona": "barcelona-1.png",
  "catalunya": "barcelona-1.png",
  "las vegas": "las_Vegas-1.png",
  "lusail": "lusail-1.png",
  "qatar": "lusail-1.png",
  "madrid": "madrid-1.png",
  "albert park": "melbourne-1.png",
  "melbourne": "melbourne-1.png",
  "hermanos rodriguez": "mexico_city-1.png",
  "mexico city": "mexico_city-1.png",
  "miami": "miami-1.png",
  "monte carlo": "monte_carlo-1.png",
  "monaco": "monte_carlo-1.png",
  "gilles villeneuve": "montreal-1.png",
  "montreal": "montreal-1.png",
  "monza": "monza-1.png",
  "interlagos": "sao_Paulo-1.png",
  "sao paulo": "sao_Paulo-1.png",
  "jose carlos pace": "sao_Paulo-1.png",
  "shanghai": "shanghai-1.png",
  "spa": "spa-1.png",
  "francorchamps": "spa-1.png",
  "red bull ring": "spielberg-1.png",
  "spielberg": "spielberg-1.png",
  "suzuka": "suzuka-1.png",
  "zandvoort": "zandvoort-1.png",
};

import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Shape for messages stored in Supabase
interface ChatMsg {
  id: string;
  user: string;
  handle: string;
  time: string;
  text: string;
  avatar?: string;
  isMe?: boolean;
  isMod?: boolean;
  initials?: string;
}

export default function Engage({ user }: { user?: SupabaseUser | null }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [nextRace, setNextRace] = useState<NextRace | null>(null);
  const [podium, setPodium] = useState<RacePodium[]>([]);
  const [grid, setGrid] = useState<GridDriver[]>([]);
  const [isQualyData, setIsQualyData] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number }>({ d: 0, h: 0, m: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const { currentLap, sessionInfo, isConnected } = useLiveTrack();

  // ─── Subscribe to Realtime only (fresh chat each visit) ─────────
  useEffect(() => {
    // Start with empty chat — only show messages that arrive while the page is open
    setMessages([]);

    // 2. Subscribe to new inserts via Supabase Realtime
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const row = payload.new;
          const newMsg: ChatMsg = {
            id: row.id,
            user: row.user_name,
            handle: row.handle,
            time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: row.text,
            avatar: row.avatar_url,
            isMe: user ? row.user_id === user.id : false,
            initials: row.user_name.substring(0, 2).toUpperCase()
          };
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ─── Fetch Next & Last Race Details ────────────────────────────
  useEffect(() => {
    // 1. Next Race
    fetch('https://api.jolpi.ca/ergast/f1/current/next.json')
      .then(res => res.json())
      .then(data => {
        const race = data.MRData.RaceTable.Races[0];
        if (race) {
          const round = race.round;
          setNextRace({
            round,
            name: race.raceName,
            circuit: race.Circuit.circuitName,
            date: race.date,
            time: race.time || '12:00:00Z'
          });

          // Fetch Qualifying Results for Grid
          fetch(`https://api.jolpi.ca/ergast/f1/current/${round}/qualifying.json`)
            .then(res => res.json())
            .then(gridData => {
              const results = gridData.MRData.RaceTable.Races[0]?.QualifyingResults;
              if (results && results.length > 0) {
                const mappedGrid = results.map((r: any) => ({
                  pos: parseInt(r.position),
                  name: `${r.Driver.givenName} ${r.Driver.familyName}`,
                  team: r.Constructor.name,
                  driverId: r.Driver.driverId
                }));
                setGrid(mappedGrid);
                setIsQualyData(true);
              } else {
                // Fallback: Fetch Standings if Grid is Pending
                fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json')
                  .then(res => res.json())
                  .then(standingsData => {
                    const standings = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings;
                    if (standings) {
                      const mappedStandings = standings.map((s: any) => ({
                        pos: parseInt(s.position),
                        name: `${s.Driver.givenName} ${s.Driver.familyName}`,
                        team: s.Constructors[0].name,
                        driverId: s.Driver.driverId
                      })).slice(0, 20);
                      setGrid(mappedStandings);
                      setIsQualyData(false);
                    }
                  });
              }
            });
        }
      });

    // 2. Last Race Podium
    fetch('https://api.jolpi.ca/ergast/f1/current/last/results.json')
      .then(res => res.json())
      .then(data => {
        const results = data.MRData.RaceTable.Races[0]?.Results?.slice(0, 3);
        if (results) {
          const podiumData = results.map((r: any) => ({
            pos: parseInt(r.position),
            name: `${r.Driver.givenName} ${r.Driver.familyName}`,
            team: r.Constructor.name,
            constructorId: r.Constructor.constructorId
          }));
          setPodium(podiumData);
        }
      });
  }, []);

  // ─── Countdown Logic ─────────────────────────────────────────────
  useEffect(() => {
    // Override target to exactly May 4th at 01:30 AM local time as requested
    const target = new Date('2026-05-04T01:30:00+05:30');

    const timer = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!user) {
      alert('Please log in to send messages!');
      return;
    }
    
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'F1_Fan';
    const handle = `@${displayName.replace(/\s+/g, '')}`;

    // Insert into Supabase — the realtime subscription will add it to the UI
    const { error } = await supabase.from('messages').insert({
      user_id: user.id,
      user_name: displayName,
      handle: handle,
      avatar_url: user.user_metadata?.avatar_url || null,
      text: input
    });

    if (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
    
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const meetingName = sessionInfo?.meetingName || 'Connecting...';
  const totalLaps = sessionInfo?.totalLaps || 0;

  // Robust track image lookup
  const trackImage = useMemo(() => {
    if (!nextRace?.circuit) return 'suzuka-1.png';
    const normalized = nextRace.circuit.toLowerCase();
    const key = Object.keys(TRACK_MAP).find(k => normalized.includes(k));
    return key ? TRACK_MAP[key] : 'suzuka-1.png';
  }, [nextRace?.circuit]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-[1600px] mx-auto px-4 py-2 h-[calc(100vh-140px)] max-h-[900px] flex flex-col lg:flex-row gap-4 relative overflow-hidden"
    >
      {/* Global Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a001a] via-[#1a0033] to-[#3a0000] -z-10 rounded-3xl opacity-50" />

      {/* Left Column: Upcoming Grand Prix */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm relative h-full">

        {/* Top Header Row (Grand Prix Name on Left, Timer on Right) */}
        <div className="p-5 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 shrink-0 bg-black/20 gap-4">

          {/* Left: Grand Prix Info */}
          <div className="flex flex-col items-start text-left z-10 relative">
            <div className="w-10 h-[2px] bg-primary mb-2" />
            <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[0.4em] block mb-1 drop-shadow-md">Upcoming Grand Prix</span>
            <h2 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-xl block">
              MIAMI
            </h2>
            <p className="text-[10px] md:text-xs font-headline font-bold text-white/60 uppercase tracking-[0.4em] mt-2 drop-shadow-md">
              Miami Int. Autodrome
            </p>
          </div>

          {/* Right: Timer Dashboard */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col z-10 min-w-[280px]">
            <div className="flex gap-4 justify-between md:justify-center md:gap-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-headline font-black text-white leading-none tracking-tighter">{timeLeft.d}</p>
                <p className="text-[9px] md:text-[10px] font-headline font-bold text-primary uppercase tracking-[0.3em] mt-1">Days</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-headline font-black text-white leading-none tracking-tighter">{timeLeft.h}</p>
                <p className="text-[9px] md:text-[10px] font-headline font-bold text-primary uppercase tracking-[0.3em] mt-1">Hours</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-headline font-black text-white leading-none tracking-tighter">{timeLeft.m}</p>
                <p className="text-[9px] md:text-[10px] font-headline font-bold text-primary uppercase tracking-[0.3em] mt-1">Mins</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
              <Timer className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" />
              <span className="text-[9px] md:text-[10px] font-headline font-black text-white/90 uppercase tracking-widest italic whitespace-nowrap">Starts: May 4 • 1:30 AM</span>
            </div>
          </div>
        </div>

        {/* Bottom Split Content (Left: Leaderboard, Right: Map) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

          {/* Bottom-Left: Live Position Leaderboard (Top 10) */}
          <div className="w-full md:w-[300px] lg:w-[340px] bg-black/30 border-r border-white/10 p-4 md:p-6 flex flex-col h-full overflow-hidden shrink-0 relative z-10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 shrink-0">
              <h3 className="text-white font-headline font-black text-sm md:text-base uppercase tracking-wider italic flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                Current Field
              </h3>
              <span className="text-[9px] font-headline font-bold text-white/40 uppercase tracking-widest">Top 10</span>
            </div>

            <div 
              className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pb-4"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
              }}
            >
              {grid.length > 0 ? grid.slice(0, 10).map((driver) => (
                <GridCard key={driver.driverId || driver.pos} driver={driver} />
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 mb-3">
                    <User className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/30 text-[10px] font-headline font-bold uppercase tracking-[0.3em]">Grid Data Pending</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom-Right: Track Map Layer */}
          <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-transparent">
            <img
              src={`/track/${trackImage}`}
              alt={nextRace?.circuit || 'Circuit Map'}
              className="w-full h-full object-contain scale-[1.15] opacity-90 hover:opacity-100 hover:scale-[1.20] transition-all duration-700 pointer-events-none"
              style={{
                filter: "drop-shadow(0 0 25px rgba(255,255,255,0.15))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Paddock Chat */}
      <div className="w-full lg:w-[450px] xl:w-[550px] flex flex-col bg-gradient-to-br from-white/10 to-transparent rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm h-full">
        <div className="px-8 py-7 flex flex-col border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
              <MessagesSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-headline font-black text-white text-2xl uppercase tracking-tighter">Paddock Chat</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                <p className="text-[11px] font-headline font-bold text-white/50 uppercase tracking-[0.25em]">Global Live Feed</p>
              </div>
            </div>
          </div>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth hide-scrollbar bg-black/10">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
        </div>

        <div className="p-6 bg-black/40 backdrop-blur-2xl border-t border-white/10">
          <div className="flex gap-4 p-2.5 bg-black/40 rounded-2xl border border-white/10 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-500 shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the paddock..."
              className="bg-transparent border-none focus:ring-0 flex-1 text-white placeholder-white/40 px-4 text-[15px] outline-none font-medium"
            />
            <button
              onClick={handleSend}
              className="bg-primary hover:bg-primary/80 text-white px-8 py-3.5 rounded-xl font-headline font-black uppercase tracking-widest text-xs transition-all shadow-[0_4px_15px_rgba(225,6,0,0.4)] flex items-center justify-center"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ChatMessage({ msg }: { msg: typeof MESSAGES[0] }) {
  return (
    <div className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-white/10 overflow-hidden shadow-xl ${msg.isMe ? 'bg-primary text-white' : 'bg-[#1a0033] text-white'}`}>
        {msg.avatar ? (
          <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="font-headline font-black text-lg">{msg.initials || 'ME'}</span>
        )}
      </div>
      <div className={`space-y-1.5 max-w-[75%] ${msg.isMe ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-3 ${msg.isMe ? 'justify-end' : ''}`}>
          {!msg.isMe && <span className={`text-[11px] font-black uppercase tracking-widest ${msg.isMod ? 'text-primary' : 'text-white/60'}`}>{msg.handle}</span>}
          <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{msg.time}</span>
          {msg.isMe && <span className="text-[11px] font-black uppercase tracking-widest text-white/80">{msg.handle}</span>}
        </div>
        <p className={`text-white/95 leading-relaxed text-[15px] px-6 py-4 rounded-3xl shadow-lg transition-all border ${msg.isMe ? 'bg-gradient-to-r from-primary to-[#ff3b3b] text-left rounded-tr-sm border-primary/30' : 'bg-gradient-to-r from-white/10 to-white/5 rounded-tl-sm border-white/10 backdrop-blur-md'
          }`}>
          {msg.text}
        </p>
      </div>
    </div>
  );
}

function GridCard({ driver }: { driver: GridDriver }) {
  const localDriver = DRIVERS.find(d =>
    d.name.toLowerCase().includes(driver.name.toLowerCase()) ||
    driver.name.toLowerCase().includes(d.name.toLowerCase())
  );

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
      <div className="w-8 flex justify-center shrink-0">
        <span className="text-white font-headline font-black text-2xl italic leading-none">{driver.pos}</span>
      </div>

      <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-black/40 shadow-inner relative shrink-0">
        <img
          src={localDriver?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.driverId}`}
          className="w-full h-full object-cover"
          alt={driver.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white font-headline font-black text-sm uppercase truncate tracking-tight mb-0.5 group-hover:text-primary transition-colors">{driver.name}</h4>
        <div className="flex items-center gap-2">
          <div className="w-2 h-0.5 rounded-full" style={{ backgroundColor: localDriver?.color || '#E10600' }} />
          <p className="text-white/40 text-[9px] font-headline font-bold uppercase tracking-widest truncate">{driver.team}</p>
        </div>
      </div>
    </div>
  );
}
