import React from 'react';
import { Team } from '../types';
import { DRIVERS } from '../constants';

interface TeamsTabProps {
  onTeamClick?: (team: Team) => void;
}

const teamsList: Team[] = [
  { id: 'ferrari', name: 'Scuderia Ferrari', color: '#dc0000', logoUrl: '/logos/ferrari loog.png' },
  { id: 'mercedes', name: 'Mercedes-AMG', color: '#00d2be', logoUrl: '/logos/mercedes logo.png' },
  { id: 'redbull', name: 'Red Bull Racing', color: '#0600ef', logoUrl: '/logos/redbull logo.png' },
  { id: 'mclaren', name: 'McLaren', color: '#ff8700', logoUrl: '/logos/mclaren logo.png' },
  { id: 'aston', name: 'Aston Martin', color: '#006f62', logoUrl: '/logos/aston martin logo.png' },
  { id: 'alpine', name: 'Alpine', color: '#0090ff', logoUrl: '/logos/alpine logo.png' },
  { id: 'williams', name: 'Williams', color: '#005aff', logoUrl: '/logos/williams logo.png' },
  { id: 'racingbulls', name: 'Racing Bulls', color: '#6692ff', logoUrl: '/logos/racing bulls logo.png' },
  { id: 'audi', name: 'Audi', color: '#f50537', logoUrl: '/logos/audi logo.png' },
  { id: 'haas', name: 'Haas F1 Team', color: '#ffffff', logoUrl: '/logos/haas logo.png' },
  { id: 'cadillac', name: 'Cadillac Racing', color: '#c5b358', logoUrl: '/logos/cadillac logo.png' },
];

export default function TeamsTab({ onTeamClick }: TeamsTabProps) {
  return (
    <div className="animate-in fade-in duration-500 font-body text-left pb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline font-bold text-lg uppercase tracking-wider text-on-surface">
          2026 Grid
        </h2>
        <span className="text-xs font-bold bg-surface-high px-2 py-1 rounded text-on-surface-variant">
          11 TEAMS
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {teamsList.map((team) => {
          const teamDrivers = DRIVERS.filter(d => team.name.includes(d.team) || d.team.includes(team.name));
          return (
          <button
            key={team.id}
            onClick={() => onTeamClick?.(team)}
            className="group relative flex flex-col items-center justify-center p-4 bg-surface-low rounded-2xl border border-surface-high transition-all duration-300 overflow-hidden transform hover:scale-[1.02]"
            style={{ 
              ['--hover-border-color' as any]: team.color,
              ['--hover-shadow' as any]: `0 0 15px ${team.color}40`
            }}
          >
            {/* Color accent line on hover */}
            <div 
              className="absolute inset-0 border-2 border-transparent transition-colors duration-300 rounded-2xl pointer-events-none group-hover:border-[var(--hover-border-color)] group-hover:shadow-[var(--hover-shadow)]"
            />
            
            {/* Team Logo Placeholder */}
            <div className="w-16 h-12 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 z-10">
              <img src={team.logoUrl} alt={team.name} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100" />
            </div>

            {/* Drivers Images Section */}
            <div className="flex justify-center -space-x-6 mb-3 z-20">
              {teamDrivers.map(d => (
                <img key={d.name} src={d.avatar} alt={d.name} title={d.name} className="w-20 h-20 object-cover rounded-full border-4 border-surface-low shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1" style={{ borderColor: 'var(--color-surface-low)' }} />
              ))}
            </div>
            
            {/* Team Name */}
            <h3 className="font-bold text-xs uppercase tracking-wide text-on-surface text-center z-10">
              {team.name}
            </h3>
            
            {/* Background Glow */}
            <div 
              className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
              style={{ backgroundColor: team.color }}
            />
          </button>
        )})}
      </div>
    </div>
  );
}
