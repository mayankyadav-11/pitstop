import React, { useState } from 'react';
import { X } from 'lucide-react';
import ShopTab from './ShopTab';
import TeamsTab from './TeamsTab';
import { Team } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamSelect?: (team: Team) => void;
  onNavigate?: (screen: 'shop' | 'home') => void;
}

export default function Sidebar({ isOpen, onClose, onTeamSelect, onNavigate }: SidebarProps) {
  const [teamsOpen, setTeamsOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 h-full w-full max-w-sm bg-surface-low border-r border-surface-high z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-surface-high">
          <span className="font-headline font-bold text-xl italic tracking-tighter text-on-surface uppercase">
            Menu
          </span>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-high rounded-full transition-colors text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Links Area */}
        <div className="flex flex-col p-6 gap-4 flex-1 overflow-y-auto hide-scrollbar">
          <button 
            onClick={() => { onClose(); if(onNavigate) onNavigate('shop'); }}
            className="w-full py-4 px-6 text-left rounded-xl font-headline font-black text-xl uppercase tracking-wider bg-surface-high/50 hover:bg-surface-high border border-white/5 transition-all text-on-surface hover:text-primary shadow-lg"
          >
            Shop
          </button>
          
          <div className="flex flex-col rounded-xl bg-surface-high/50 border border-white/5 overflow-hidden transition-all shadow-lg">
            <button 
              onClick={() => setTeamsOpen(!teamsOpen)}
              className="w-full py-4 px-6 flex justify-between items-center text-left font-headline font-black text-xl uppercase tracking-wider hover:bg-surface-high/80 transition-all text-on-surface hover:text-primary"
            >
              Teams
              <span className="text-2xl leading-none font-light text-on-surface-variant">{teamsOpen ? '−' : '+'}</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${teamsOpen ? 'max-h-[100vh] p-4 overflow-y-auto' : 'max-h-0'}`}>
              <TeamsTab 
                onTeamClick={(team) => {
                  onClose();
                  if (onTeamSelect) onTeamSelect(team);
                }} 
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
