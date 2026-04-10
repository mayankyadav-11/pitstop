import { motion } from 'motion/react';
import { Share2, MessagesSquare, Send } from 'lucide-react';
import { MESSAGES } from '../constants';
import TrackMap from './TrackMap';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLiveTrack } from '../lib/useLiveTrack';

interface RacePodium {
  pos: number;
  name: string;
  team: string;
  constructorId: string;
}

interface NextRace {
  name: string;
  circuit: string;
  date: string;
  time: string;
}

export default function Engage() {
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState('');
  const [nextRace, setNextRace] = useState<NextRace | null>(null);
  const [podium, setPodium] = useState<RacePodium[]>([]);
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
          setNextRace({
            name: race.raceName,
            circuit: race.Circuit.circuitName,
            date: race.date,
            time: race.time || '12:00:00Z'
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
    
    const target = new Date(`${nextRace.date}T${nextRace.time}`);
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-7xl mx-auto px-4 pt-6 space-y-6"
    >
      {/* Live Status */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isConnected ? 'bg-error/10 border border-error/20' : 'bg-surface-high border border-surface-high/30'}`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-error animate-pulse' : 'bg-on-surface-variant/40'}`} />
          <span className={`font-headline font-bold text-xs uppercase tracking-widest ${isConnected ? 'text-error' : 'text-on-surface-variant'}`}>
            {isConnected ? `Live Race: ${meetingName}` : 'Connecting...'}
          </span>
        </div>
        {currentLap > 0 && (
          <div className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">
            Lap {currentLap}{totalLaps ? ` / ${totalLaps}` : ''}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Upcoming Track & Podium */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Race Section */}
          <div className="bg-surface p-6 rounded-2xl border border-surface-high shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Share2 className="w-12 h-12 text-primary" />
            </div>
            
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3 block">Upcoming Grand Prix</span>
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight mb-1">
              {nextRace?.name.replace(' Grand Prix', '') || 'CALCULATING...'}
            </h2>
            <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest mb-6">
              {nextRace?.circuit || 'Loading circuit data...'}
            </p>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-surface-high/20">
              <div className="text-center">
                <p className="text-2xl font-headline font-bold text-white tracking-widest">{timeLeft.d}</p>
                <p className="text-[8px] font-headline font-bold text-on-surface-variant uppercase tracking-tighter">Days</p>
              </div>
              <div className="text-center border-x border-surface-high/20">
                <p className="text-2xl font-headline font-bold text-white tracking-widest">{timeLeft.h}</p>
                <p className="text-[8px] font-headline font-bold text-on-surface-variant uppercase tracking-tighter">Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-headline font-bold text-white tracking-widest">{timeLeft.m}</p>
                <p className="text-[8px] font-headline font-bold text-on-surface-variant uppercase tracking-tighter">Minutes</p>
              </div>
            </div>

            <button className="w-full mt-6 py-3 rounded-xl bg-surface-high hover:bg-surface-highest text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface transition-all border border-surface-high flex items-center justify-center gap-2 group">
              View Event Ticket <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Podium Showcase */}
          <div className="bg-surface p-6 rounded-2xl border border-surface-high shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em]">Previous Race Results</span>
              <span className="text-[8px] font-headline font-bold text-on-surface-variant/30 uppercase">Suzuka Track</span>
            </div>
            
            <div className="space-y-4">
              {podium.map((winner) => (
                <PodiumCard key={winner.pos} winner={winner} />
              ))}
              {podium.length === 0 && (
                <div className="py-8 text-center text-on-surface-variant/40 text-xs font-headline uppercase tracking-widest">
                  Loading podium data...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-7 flex flex-col h-[650px] bg-surface rounded-xl border border-surface-high overflow-hidden shadow-2xl">
          <div className="bg-surface-high px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessagesSquare className="w-5 h-5 text-tertiary" />
              <h2 className="font-headline font-bold text-on-surface uppercase tracking-wider">Paddock Chat</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-tertiary" />
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">4.8k Online</span>
            </div>
          </div>

          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar"
          >
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
          </div>

          <div className="p-6 bg-surface-container border-t border-surface-high">
            <div className="flex gap-3 bg-surface-low rounded-xl p-2 border border-surface-high focus-within:border-primary transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Join the discussion..." 
                className="bg-transparent border-none focus:ring-0 flex-1 text-on-surface placeholder-on-surface-variant/50 px-3 text-sm outline-none"
              />
              <button 
                onClick={handleSend}
                className="kinetic-gradient text-on-primary px-6 py-2 rounded-lg font-headline font-bold uppercase tracking-wider text-xs active:scale-95 duration-150 shadow-lg shadow-primary/20 flex items-center justify-center"
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

function PodiumCard({ winner }: { winner: RacePodium }) {
  const normalizedName = winner.name.toLowerCase();
  const driverImg = `/drivers/${normalizedName}.jpeg`;
  
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
    <div className="group relative flex items-center gap-4 bg-surface-low/50 p-4 rounded-xl border border-surface-high/20 hover:border-tertiary/30 transition-all">
      <div className="flex flex-col items-center justify-center w-8">
        <span className={`font-headline font-black text-2xl ${
          winner.pos === 1 ? 'text-primary' : 
          winner.pos === 2 ? 'text-tertiary' : 'text-on-surface-variant'
        }`}>
          {winner.pos}
        </span>
        <span className="text-[8px] font-headline font-bold text-on-surface-variant uppercase -mt-1">
          {winner.pos === 1 ? 'st' : winner.pos === 2 ? 'nd' : 'rd'}
        </span>
      </div>

      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-highest shadow-xl">
        <img src={driverImg} alt={winner.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-headline font-bold text-sm text-on-surface uppercase truncate">{winner.name}</h4>
        <p className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">{winner.team}</p>
      </div>

      <div className="w-32 h-12 relative overflow-hidden flex items-center justify-end">
        <img 
          src={carImg} 
          alt={winner.team} 
          className="h-full object-contain filter grayscale group-hover:grayscale-0 transition-all -mr-4 group-hover:mr-0 duration-500" 
        />
      </div>
    </div>
  );
}

function ChatMessage({ msg }: { msg: typeof MESSAGES[0] }) {
  return (
    <div className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-surface-high/30 overflow-hidden ${msg.isMe ? 'bg-tertiary-container text-on-tertiary-container' : msg.initials ? 'bg-primary-container text-on-primary' : 'bg-surface-highest'}`}>
        {msg.avatar ? (
          <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="font-headline font-bold text-sm">{msg.initials || 'YOU'}</span>
        )}
      </div>
      <div className={`space-y-1 ${msg.isMe ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 ${msg.isMe ? 'justify-end' : ''}`}>
          {!msg.isMe && <span className={`text-sm font-bold ${msg.isMod ? 'text-on-surface' : 'text-tertiary'}`}>{msg.handle}</span>}
          <span className="text-[10px] text-on-surface-variant font-medium">{msg.time}</span>
          {msg.isMe && <span className="text-sm font-bold text-primary">{msg.handle}</span>}
          {msg.isMod && <span className="bg-yellow-500/20 text-yellow-500 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Mod</span>}
        </div>
        <p className={`text-on-surface leading-relaxed text-sm p-3 rounded-b-xl border border-surface-high ${
          msg.isMe ? 'kinetic-gradient text-left rounded-tl-xl' : 'bg-surface-container rounded-tr-xl'
        }`}>
          {msg.text}
        </p>
      </div>
    </div>
  );
}
