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
  "budapest": "Budapest.png",
  "hungaroring": "Budapest.png",
  "silverstone": "Silverstone.png",
  "marina bay": "Singapore.png",
  "singapore": "Singapore.png",
  "yas marina": "abu dhabi.png",
  "abu dhabi": "abu dhabi.png",
  "americas": "austin.png",
  "austin": "austin.png",
  "baku": "baku.png",
  "barcelona": "barcelona.png",
  "catalunya": "barcelona.png",
  "las vegas": "las Vegas.png",
  "lusail": "lusail.png",
  "qatar": "lusail.png",
  "madrid": "madrid.png",
  "albert park": "melbourne.png",
  "melbourne": "melbourne.png",
  "hermanos rodriguez": "mexico city.png",
  "mexico city": "mexico city.png",
  "miami": "miami.png",
  "monte carlo": "monte carlo.png",
  "monaco": "monte carlo.png",
  "gilles villeneuve": "montreal.png",
  "montreal": "montreal.png",
  "monza": "monza.png",
  "interlagos": "sao Paulo.png",
  "sao paulo": "sao Paulo.png",
  "jose carlos pace": "sao Paulo.png",
  "shanghai": "shanghai.png",
  "spa": "spa.png",
  "francorchamps": "spa.png",
  "red bull ring": "spielberg.png",
  "spielberg": "spielberg.png",
  "suzuka": "suzuka.png",
  "zandvoort": "zandvoort.png",
};

export default function Engage() {
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState('');
  const [nextRace, setNextRace] = useState<NextRace | null>(null);
  const [podium, setPodium] = useState<RacePodium[]>([]);
  const [grid, setGrid] = useState<GridDriver[]>([]);
  const [isQualyData, setIsQualyData] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number }>({ d: 0, h: 0, m: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const { currentLap, sessionInfo, isConnected } = useLiveTrack();

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
    if (!nextRace) return;
    
    // Ensure the date string is clean
    const dateStr = nextRace.date.includes('T') ? nextRace.date : `${nextRace.date}T${nextRace.time}`;
    const target = new Date(dateStr);
    
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
  }, [nextRace]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      user: 'PitCrew_88',
      handle: '@PitCrew_88',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: input,
      isMe: true
    };
    setMessages([...messages, newMsg]);
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
    if (!nextRace?.circuit) return 'suzuka.png';
    const normalized = nextRace.circuit.toLowerCase();
    const key = Object.keys(TRACK_MAP).find(k => normalized.includes(k));
    return key ? TRACK_MAP[key] : 'suzuka.png';
  }, [nextRace?.circuit]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-7xl mx-auto px-4 pt-6 space-y-6 min-h-screen pb-20"
    >
      {/* Dynamic Reddish Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Live Status */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isConnected ? 'bg-tertiary/10 border border-tertiary/20' : 'bg-surface-high border border-surface-high/30'}`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-tertiary animate-pulse' : 'bg-on-surface-variant/40'}`} />
          <span className={`font-headline font-bold text-xs uppercase tracking-widest ${isConnected ? 'text-tertiary' : 'text-on-surface-variant'}`}>
            {isConnected ? `Live Session: ${meetingName}` : 'Standby'}
          </span>
        </div>
        {currentLap > 0 && (
          <div className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
            Lap {currentLap}{totalLaps ? ` / ${totalLaps}` : ''}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Grid & Podium */}
        <div className="lg:col-span-12 space-y-6">
          {/* Hero Section with Track Image (Full Visibility) */}
          <div className="bg-black rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden h-[400px] group">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-primary/5 z-10" />
            <img 
              src={`/tracks/${trackImage}`} 
              alt={nextRace?.circuit} 
              className="absolute inset-0 w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-1000 scale-90 group-hover:scale-100 transform -translate-y-4"
              style={{ filter: 'drop-shadow(0 0 20px rgba(225,6,0,0.2))' }}
            />
            
            <div className="relative p-10 h-full flex flex-col justify-between z-20">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-[2px] bg-primary" />
                  <span className="text-[12px] font-bold text-primary uppercase tracking-[0.4em] block">Upcoming Grand Prix</span>
                </div>
                <h2 className="text-6xl font-headline font-black text-white tracking-tighter uppercase italic leading-none">
                  {nextRace?.name.replace(' Grand Prix', '') || 'LOADING...'}
                </h2>
                <p className="text-[14px] font-headline font-bold text-white/40 uppercase tracking-[0.3em] mt-3">
                  {nextRace?.circuit} • {nextRace?.date && new Date(nextRace.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              
              <div className="flex items-center justify-between bg-black/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 w-full lg:w-1/2">
                <div className="flex gap-12">
                   <div className="text-center">
                    <p className="text-4xl font-headline font-black text-white leading-none tracking-tighter">{timeLeft.d}</p>
                    <p className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em] mt-2">Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-headline font-black text-white leading-none tracking-tighter">{timeLeft.h}</p>
                    <p className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em] mt-2">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-headline font-black text-white leading-none tracking-tighter">{timeLeft.m}</p>
                    <p className="text-[10px] font-headline font-bold text-primary uppercase tracking-[0.2em] mt-2">Mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-xl border border-primary/20">
                  <Timer className="w-5 h-5 text-primary animate-pulse" />
                  <span className="text-xs font-headline font-black text-white uppercase tracking-widest italic">Race Start</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Starting Grid Section (Deep Black Aesthetic) */}
          <div className="bg-black p-8 rounded-3xl shadow-2xl overflow-hidden border border-white/5 relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Trophy className="w-32 h-32 text-white" />
             </div>
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-white font-headline font-black text-3xl uppercase tracking-tighter italic">Starting Grid</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className={`w-2 h-2 rounded-full ${isQualyData ? 'bg-green-500 animate-pulse' : 'bg-on-surface-variant/20'}`} />
                    <p className="text-on-surface-variant/60 text-[10px] font-headline font-bold uppercase tracking-widest">
                      {isQualyData ? 'Confirmed Qualifying Order' : 'Projected Orders (Standings)'}
                    </p>
                  </div>
                </div>
             </div>

             <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {grid.length > 0 ? grid.map((driver) => (
                  <GridCard key={driver.driverId || driver.pos} driver={driver} />
                )) : (
                  <div className="py-24 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <User className="w-10 h-10 text-on-surface-variant/20" />
                    </div>
                    <p className="text-on-surface-variant/30 text-[11px] font-headline font-bold uppercase tracking-[0.4em]">Grid Data Pending</p>
                  </div>
                )}
             </div>
          </div>

          {/* Podium Showcase (Deep Black) */}
          <div className="bg-black p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                <Trophy className="w-4 h-4" /> Previous Race Podium
              </span>
            </div>
            
            <div className="space-y-4 relative z-10">
              {podium.map((winner, idx) => (
                <PodiumCard key={`${winner.constructorId}-${idx}`} winner={winner} />
              ))}
              {podium.length === 0 && (
                <div className="py-16 text-center text-on-surface-variant/20 text-[10px] font-headline font-bold uppercase tracking-[0.4em]">
                  Awaiting race results...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-7 flex flex-col h-[850px] bg-black rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="bg-black px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <MessagesSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-headline font-black text-white text-xl uppercase tracking-tighter">Paddock Chat</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Global Live Feed</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth hide-scrollbar relative z-10"
          >
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
          </div>

          <div className="p-8 bg-black/40 backdrop-blur-md border-t border-white/5 relative z-10">
            <div className="flex gap-4 p-2 bg-white/5 rounded-2xl border border-white/10 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-500">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message the paddock..." 
                className="bg-transparent border-none focus:ring-0 flex-1 text-white placeholder-white/20 px-6 text-sm outline-none font-medium"
              />
              <button 
                onClick={handleSend}
                className="bg-primary hover:bg-primary/80 text-white px-10 py-3.5 rounded-xl font-headline font-black uppercase tracking-tighter text-xs active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GridCard({ driver }: { driver: GridDriver }) {
  const localDriver = DRIVERS.find(d => 
    d.name.toLowerCase().includes(driver.name.toLowerCase()) || 
    driver.name.toLowerCase().includes(d.name.toLowerCase())
  );

  return (
    <div className="flex items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-500 group cursor-default">
      <div className="w-12 flex flex-col items-center">
        <span className="text-white font-headline font-black text-3xl leading-none italic group-hover:text-primary transition-colors">{driver.pos}</span>
      </div>
      
      <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-surface-highest ring-4 ring-black shadow-2xl relative">
        <img 
          src={localDriver?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.driverId}`} 
          className="w-full h-full object-cover" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="flex-1">
        <h4 className="text-white font-headline font-black text-sm uppercase leading-none mb-1.5 tracking-tight group-hover:translate-x-1 transition-transform">{driver.name}</h4>
        <div className="flex items-center gap-2.5">
           <div className="w-3 h-[2px] rounded-full" style={{ backgroundColor: localDriver?.color || '#333' }} />
           <p className="text-on-surface-variant/50 text-[10px] font-headline font-bold uppercase tracking-widest italic">{driver.team}</p>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
         <ChevronRight className="w-6 h-6 text-primary" />
      </div>
    </div>
  );
}

function PodiumCard({ winner }: { winner: RacePodium }) {
  const normalizedApiName = winner.name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const driver = DRIVERS.find(d => {
    const normalizedD = d.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizedD === normalizedApiName || 
           normalizedD.includes(normalizedApiName) || 
           normalizedApiName.includes(normalizedD);
  });

  const driverImg = driver?.avatar || `/drivers/${normalizedApiName}.jpeg`;
  
  const constructorMap: Record<string, string> = {
    'ferrari': 'ferrari car.avif',
    'red_bull': 'redbull car.avif',
    'mclaren': 'mclaren car.avif',
    'mercedes': 'mercedes car.avif',
    'aston_martin': 'aston martin car.avif',
    'alpine': 'alpine.avif',
    'williams': 'williams car.avif',
    'haas': 'haas car.avif',
    'rb': 'racing bulls car.avif',
    'vcarb': 'racing bulls car.avif',
    'sauber': 'audi car.avif'
  };

  const carImg = `/logos/${constructorMap[winner.constructorId] || 'redbull car.avif'}`;

  return (
    <div className="group relative flex items-center gap-6 bg-white/[0.03] p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-500">
      <div className="flex flex-col items-center justify-center w-12 shrink-0">
        <span className={`font-headline font-black text-4xl italic leading-none ${
          winner.pos === 1 ? 'text-primary' : 
          winner.pos === 2 ? 'text-white' : 'text-white/40'
        }`}>
          {winner.pos}
        </span>
        <span className="text-[10px] font-headline font-black text-white/20 uppercase tracking-tighter mt-1">
          POS
        </span>
      </div>

      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-surface-highest relative">
        <img src={driverImg} alt={winner.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-headline font-black text-lg text-white uppercase truncate tracking-tight group-hover:text-primary transition-colors">{winner.name}</h4>
        <p className="text-[10px] font-headline font-bold text-white/30 uppercase tracking-[0.3em] mt-1">{winner.team}</p>
      </div>

      <div className="w-40 h-16 relative overflow-hidden flex items-center justify-end">
        <img 
          src={carImg} 
          alt={winner.team} 
          className="h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-20 group-hover:opacity-100 translate-x-8 group-hover:translate-x-0" 
        />
      </div>
    </div>
  );
}

function ChatMessage({ msg }: { msg: typeof MESSAGES[0] }) {
  return (
    <div className={`flex gap-6 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 overflow-hidden shadow-2xl relative ${msg.isMe ? 'bg-primary text-white' : 'bg-white/5 text-white'}`}>
        {msg.avatar ? (
          <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
        ) : (
          <span className="font-headline font-black text-xl">{msg.initials || 'ME'}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className={`space-y-2.5 max-w-[80%] ${msg.isMe ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-4 ${msg.isMe ? 'justify-end' : ''}`}>
          {!msg.isMe && <span className={`text-[12px] font-black uppercase tracking-widest ${msg.isMod ? 'text-primary' : 'text-white/60'}`}>{msg.handle}</span>}
          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{msg.time}</span>
          {msg.isMe && <span className="text-[12px] font-black uppercase tracking-widest text-white/60">{msg.handle}</span>}
          {msg.isMod && (
            <span className="bg-primary/10 text-primary text-[8px] px-2.5 py-1 rounded-full font-black uppercase border border-primary/20">
              Staff
            </span>
          )}
        </div>
        <p className={`text-white/90 leading-relaxed text-sm px-6 py-5 rounded-3xl border border-white/5 shadow-inner transition-all duration-500 ${
          msg.isMe ? 'bg-primary/10 text-left rounded-tr-none border-primary/20' : 'bg-white/5 rounded-tl-none'
        }`}>
          {msg.text}
        </p>
      </div>
    </div>
  );
}
