import { motion } from 'motion/react';
import { Share2, MessagesSquare, Send } from 'lucide-react';
import { MESSAGES } from '../constants';
import TrackMap from './TrackMap';
import { useState, useRef, useEffect } from 'react';
import { useLiveTrack } from '../lib/useLiveTrack';

export default function Engage() {
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const { currentLap, sessionInfo, isConnected } = useLiveTrack();

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Track Map & Strategy */}
        <div className="lg:col-span-5 space-y-6">
          <TrackMap />

          <div className="bg-surface-low p-6 rounded-xl border-l-4 border-primary">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Trending Strategy</span>
            <h3 className="text-lg font-headline font-bold text-on-surface leading-tight">Soft tires showing 15% more degradation than expected.</h3>
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-7 flex flex-col h-[500px] bg-surface-container-lowest rounded-xl border border-surface-high overflow-hidden">
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
