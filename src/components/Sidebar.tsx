import React, { useState } from 'react';
import { X } from 'lucide-react';
import ShopTab from './ShopTab';
import TeamsTab from './TeamsTab';
import { Team } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamSelect?: (team: Team) => void;
}

export default function Sidebar({ isOpen, onClose, onTeamSelect }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'shop' | 'teams'>('shop');

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

        {/* Tabs */}
        <div className="flex p-4 gap-2">
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 px-4 rounded-xl font-headline font-bold uppercase tracking-wider text-sm transition-all duration-200 ${activeTab === 'shop' ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(225,6,0,0.4)]' : 'bg-surface hover:bg-surface-high text-on-surface-variant'}`}
          >
            Shop
          </button>
          <button 
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-3 px-4 rounded-xl font-headline font-bold uppercase tracking-wider text-sm transition-all duration-200 ${activeTab === 'teams' ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(225,6,0,0.4)]' : 'bg-surface hover:bg-surface-high text-on-surface-variant'}`}
          >
            Teams
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {activeTab === 'shop' && (
            <ShopTab />
          )}
          {activeTab === 'teams' && (
            <TeamsTab 
              onTeamClick={(team) => {
                onClose();
                if (onTeamSelect) onTeamSelect(team);
              }} 
            />
          )}
        </div>
      </aside>
    </>
  );
}
