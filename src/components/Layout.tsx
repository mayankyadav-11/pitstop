import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, ChevronDown } from 'lucide-react';
import { Screen, Team } from '../types';
import Sidebar from './Sidebar';
import TeamsTab from './TeamsTab';

import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  onTeamSelect?: (team: Team) => void;
  user?: SupabaseUser | null;
}

import { useLiveTrack } from '../lib/useLiveTrack';

export default function Layout({ children, activeScreen, setActiveScreen, onTeamSelect, user }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Hardcoded to false for now unless a current race is strictly ongoing.
  const isRaceOngoing = false; 

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
      
      {/* Top App Bar - Premium Glassmorphic Navbar */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 bg-background/50 backdrop-blur-2xl border-b border-white/5 shadow-sm">
        
        {/* Left: Logo */}
        <div className="flex items-center">
          <span 
            className="font-headline font-black text-3xl md:text-4xl italic tracking-tighter text-white uppercase cursor-pointer hover:text-primary transition-colors"
            onClick={() => setActiveScreen('home')}
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
          >
            PITSTOP
          </span>
          {isRaceOngoing && (
            <div className="ml-6 hidden md:flex items-center gap-2 bg-error/10 px-3 py-1 rounded-full border border-error/20">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="font-headline font-bold text-[10px] uppercase tracking-tighter text-error">LIVE</span>
            </div>
          )}
        </div>

        {/* Center: Links */}
        <div className="hidden lg:flex items-center gap-8 bg-black/20 px-8 py-3 rounded-full border border-white/5 shadow-inner">
          <NavText active={activeScreen === 'home' && !isDropdownOpen} onClick={() => { setActiveScreen('home'); setIsDropdownOpen(false); }} label="Home" />
          <NavText active={activeScreen === 'explore' && !isDropdownOpen} onClick={() => { setActiveScreen('explore'); setIsDropdownOpen(false); }} label="Explore" />
          <NavText active={activeScreen === 'engage' && !isDropdownOpen} onClick={() => { setActiveScreen('engage'); setIsDropdownOpen(false); }} label="Engage" />
          <NavText active={activeScreen === 'schedule' && !isDropdownOpen} onClick={() => { setActiveScreen('schedule'); setIsDropdownOpen(false); }} label="Schedule" />
          <NavText active={activeScreen === 'shop' && !isDropdownOpen} onClick={() => { setActiveScreen('shop' as Screen); setIsDropdownOpen(false); }} label="Shop" />
          
          {/* Team Info Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors relative group py-1 ${
                isDropdownOpen || activeScreen === 'team_details' ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Team Info <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-white transition-all duration-300 rounded-full ${isDropdownOpen || activeScreen === 'team_details' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>

            {/* Teams Mega Menu Panel */}
            <div 
              className={`absolute top-full mt-6 w-[600px] left-1/2 -translate-x-1/2 bg-surface/95 border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-3xl transition-all duration-300 origin-top ${
                isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
              } max-h-[70vh] overflow-y-auto hide-scrollbar`}
            >
              <TeamsTab 
                onTeamClick={(team) => { 
                  setIsDropdownOpen(false);
                  if (onTeamSelect) onTeamSelect(team);
                }} 
              />
            </div>
          </div>
        </div>

        {/* Right: Login Button & Mobile Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <button 
              onClick={async () => await supabase.auth.signOut()}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 text-white font-bold uppercase text-xs tracking-wider hover:bg-error/20 hover:text-error transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 border border-white/5"
            >
              <User className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <button 
              onClick={() => setActiveScreen('login')}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <User className="w-4 h-4" />
              Login
            </button>
          )}
          
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Slide-out Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onTeamSelect={onTeamSelect}
        onNavigate={(screen: any) => setActiveScreen(screen)}
      />
    </div>
  );
}

function NavText({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`text-xs font-bold uppercase tracking-widest transition-colors relative group py-1 ${
        active ? 'text-white' : 'text-white/60 hover:text-white'
      }`}
    >
      {label}
      <span className={`absolute -bottom-1 left-0 h-[2px] bg-white transition-all duration-300 rounded-full ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
    </button>
  );
}
