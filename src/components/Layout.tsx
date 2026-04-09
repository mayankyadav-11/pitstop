import React from 'react';
import { Menu } from 'lucide-react';
import { Screen, Team } from '../types';
import { Home, MessageSquare, Calendar, Compass } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  onTeamSelect?: (team: Team) => void;
}

import { useLiveTrack } from '../lib/useLiveTrack';

export default function Layout({ children, activeScreen, setActiveScreen, onTeamSelect }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { isConnected } = useLiveTrack();

  return (
    <div className="min-h-screen flex flex-col bg-background relative z-0">
      {/* Global Background Image Layer */}
      {activeScreen !== 'team_details' && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: "url('/logos/background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: -1
          }}
        />
      )}
      
      {/* Top App Bar */}
      <header className="h-16 border-b border-surface-high flex items-center justify-between px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-surface-high rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-on-surface" />
          </button>
          <span className="font-headline font-bold text-2xl italic tracking-tighter text-primary uppercase">
            PITSTOP
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeScreen === 'home' && isConnected && (
            <div className="flex items-center gap-2 bg-error/10 px-3 py-1 rounded-full border border-error/20 mr-2">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="font-headline font-bold text-[10px] uppercase tracking-tighter text-error">LIVE</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-20 bg-surface/90 backdrop-blur-xl border-t border-surface-high flex justify-around items-center px-4 pb-4 z-50">
        <NavButton 
          active={activeScreen === 'home'} 
          onClick={() => setActiveScreen('home')}
          icon={<Home className="w-6 h-6" />}
          label="Home"
        />
        <NavButton 
          active={activeScreen === 'engage'} 
          onClick={() => setActiveScreen('engage')}
          icon={<MessageSquare className="w-6 h-6" />}
          label="Engage"
        />
        <NavButton 
          active={activeScreen === 'schedule'} 
          onClick={() => setActiveScreen('schedule')}
          icon={<Calendar className="w-6 h-6" />}
          label="Schedule"
        />
        <NavButton 
          active={activeScreen === 'explore'} 
          onClick={() => setActiveScreen('explore')}
          icon={<Compass className="w-6 h-6" />}
          label="Explore"
        />
      </nav>

      {/* Slide-out Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onTeamSelect={onTeamSelect}
      />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 active:scale-90 ${
        active ? 'text-primary bg-primary/10' : 'text-on-surface/60 hover:text-tertiary'
      }`}
    >
      {icon}
      <span className="font-body text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
