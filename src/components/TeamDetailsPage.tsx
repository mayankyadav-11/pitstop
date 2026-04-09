import React, { useMemo } from 'react';
import { ArrowLeft, User, MapPin, Gauge } from 'lucide-react';
import { Team } from '../types';
import { DRIVERS } from '../constants';

interface TeamDetailsPageProps {
  team: Team;
  onBack: () => void;
}

// 2026 Championship Data Map
const teamData2026: Record<string, any> = {
  ferrari: {
    history: "Scuderia Ferrari charges into the 2026 era with a monumental pairing. The arrival of Lewis Hamilton alongside Charles Leclerc makes them an undeniable powerhouse. Equipped with an an all-new regulatory Power Unit built in Maranello.",
    base: "Maranello, Italy",
    principal: "Frédéric Vasseur",
    powerUnit: "Ferrari",
    carImage: "/logos/ferrari car.avif",
    drivers: [
      { role: "Driver 1", name: "Charles Leclerc", number: "16" },
      { role: "Driver 2", name: "Lewis Hamilton", number: "44" }
    ]
  },
  mercedes: {
    history: "Mercedes-AMG enters the new regulations seeking to return to their dominant ways. The team transitions into a new chapter coupling George Russell's experience with the electric debut of sensational rookie Andrea Kimi Antonelli.",
    base: "Brackley, UK",
    principal: "Toto Wolff",
    powerUnit: "Mercedes",
    carImage: "/logos/mercedes car.avif",
    drivers: [
      { role: "Driver 1", name: "George Russell", number: "63" },
      { role: "Driver 2", name: "Andrea Kimi Antonelli", number: "12" }
    ]
  },
  redbull: {
    history: "Oracle Red Bull Racing pushes into 2026 producing their own Red Bull Powertrains in conjunction with Ford. World Champion Max Verstappen leads the team into the unknown, alongside young prospect Isack Hadjar.",
    base: "Milton Keynes, UK",
    principal: "Christian Horner",
    powerUnit: "Red Bull Ford",
    carImage: "/logos/redbull car.avif",
    drivers: [
      { role: "Driver 1", name: "Max Verstappen", number: "1" },
      { role: "Driver 2", name: "Isack Hadjar", number: "TBD" }
    ]
  },
  mclaren: {
    history: "McLaren rides a wave of massive momentum into 2026 with an unchanged stellar driver lineup. Norris and Piastri look to dominate the new regulations under the Papaya banner with Mercedes power.",
    base: "Woking, UK",
    principal: "Andrea Stella",
    powerUnit: "Mercedes",
    carImage: "/logos/mclaren car.avif",
    drivers: [
      { role: "Driver 1", name: "Lando Norris", number: "4" },
      { role: "Driver 2", name: "Oscar Piastri", number: "81" }
    ]
  },
  aston: {
    history: "Aston Martin pairs its state-of-the-art Silverstone campus with an exclusive Works deal with Honda for 2026 power units. Fernando Alonso relentlessly continues his quest for victory alongside Lance Stroll.",
    base: "Silverstone, UK",
    principal: "Mike Krack",
    powerUnit: "Honda",
    carImage: "/logos/aston martin car.avif",
    drivers: [
      { role: "Driver 1", name: "Fernando Alonso", number: "14" },
      { role: "Driver 2", name: "Lance Stroll", number: "18" }
    ]
  },
  williams: {
    history: "Williams makes a massive statement for 2026 by securing Carlos Sainz alongside Alex Albon. The historic team continues to modernize seeking to fight its way back to the top of the grid.",
    base: "Grove, UK",
    principal: "James Vowles",
    powerUnit: "Mercedes",
    carImage: "/logos/williams car.avif",
    drivers: [
      { role: "Driver 1", name: "Alex Albon", number: "23" },
      { role: "Driver 2", name: "Carlos Sainz Jr.", number: "55" }
    ]
  },
  racingbulls: {
    history: "Racing Bulls re-establishes itself in 2026 with a fresh, highly aggressive lineup. Liam Lawson takes the helm alongside rookie Arvid Lindblad, carrying the Red Bull Powertrains banner.",
    base: "Faenza, Italy",
    principal: "Laurent Mekies",
    powerUnit: "Red Bull Ford",
    carImage: "/logos/racing bulls car.avif",
    drivers: [
      { role: "Driver 1", name: "Liam Lawson", number: "30" },
      { role: "Driver 2", name: "Arvid Lindblad", number: "TBD" }
    ]
  },
  audi: {
    history: "The historic entry of Audi into Formula 1. Taking over the Sauber entry, Audi arrives in 2026 as a full Works factory team with its own Power Unit, driven by the veteran Nico Hülkenberg and rising champion Gabriel Bortoleto.",
    base: "Hinwil, Switzerland",
    principal: "Mattia Binotto",
    powerUnit: "Audi",
    carImage: "/logos/audi car.avif",
    drivers: [
      { role: "Driver 1", name: "Nico Hülkenberg", number: "27" },
      { role: "Driver 2", name: "Gabriel Bortoleto", number: "TBD" }
    ]
  },
  alpine: {
    history: "Alpine faces the 2026 era by transitioning out of Works status and adopting Mercedes-customer power units. Pierre Gasly anchors the French squad alongside rookie Franco Colapinto.",
    base: "Enstone, UK",
    principal: "Oliver Oakes",
    powerUnit: "Mercedes",
    carImage: "/logos/alpine.avif",
    drivers: [
      { role: "Driver 1", name: "Pierre Gasly", number: "10" },
      { role: "Driver 2", name: "Franco Colapinto", number: "43" }
    ]
  },
  cadillac: {
    history: "An iconic, long-awaited moment as Cadillac Racing officially joins the Formula 1 grid as the 11th team in 2026. Bringing Sergio Pérez and Valtteri Bottas gives the highly-anticipated American entry incredible initial experience.",
    base: "Fishers, USA / UK",
    principal: "Mario Andretti",
    powerUnit: "Ferrari", // Customer engine until GM finishes PU
    carImage: "/logos/cadillac car.avif",
    drivers: [
      { role: "Driver 1", name: "Sergio Pérez", number: "11" },
      { role: "Driver 2", name: "Valtteri Bottas", number: "77" }
    ]
  },
  haas: {
    history: "Haas transitions into 2026 with a highly balanced setup. Combining the fierce experience of Esteban Ocon with the sheer potential of Ferrari-junior Oliver Bearman, the American team looks to maximize the new regulations.",
    base: "Kannapolis, USA / Banbury, UK",
    principal: "Ayao Komatsu",
    powerUnit: "Ferrari",
    carImage: "/logos/haas car.avif",
    drivers: [
      { role: "Driver 1", name: "Esteban Ocon", number: "31" },
      { role: "Driver 2", name: "Oliver Bearman", number: "87" }
    ]
  }
};

export default function TeamDetailsPage({ team, onBack }: TeamDetailsPageProps) {
  const data = useMemo(() => teamData2026[team.id] || teamData2026.ferrari, [team.id]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-body text-left pb-24 px-6 pt-6">
      
      {/* Header Area */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-surface-low rounded-xl border border-surface-high hover:bg-surface-high hover:text-white transition-colors text-on-surface-variant group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 flex items-center justify-center">
            <img src={team.logoUrl} alt={team.name} className="max-w-full max-h-full object-contain" />
          </div>
          <h1 className="font-headline font-bold text-3xl uppercase tracking-tighter" style={{ color: team.color }}>
            {team.name}
          </h1>
        </div>
      </div>

      {/* Hero 2026 Art Placeholder */}
      <div 
        className="w-full h-64 md:h-80 rounded-3xl mb-8 relative overflow-hidden flex items-center justify-center border-l-8 shadow-2xl group"
        style={{ backgroundColor: `${team.color}15`, borderLeftColor: team.color }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent pointer-events-none z-10" />
        
        {/* Subtle glowing logo in background */}
        <div className="absolute right-0 opacity-10 mix-blend-screen h-full z-0 transition-transform duration-1000 group-hover:scale-110">
            <img src={team.logoUrl} alt="" className="h-[150%] max-w-none opacity-50 filter grayscale -translate-y-1/4" />
        </div>

        {/* Car Render image taking complete space */}
        {data.carImage && (
          <img 
            src={data.carImage} 
            alt={`${team.name} 2026 Car`} 
            className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-transform duration-700 group-hover:scale-105" 
          />
        )}

        <div className="relative z-20 text-left w-full px-8 pointer-events-none">
          <p className="font-headline font-bold text-3xl md:text-4xl text-white uppercase tracking-widest drop-shadow-lg">
            2026 CHALLENGER
          </p>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-low rounded-2xl p-4 border border-surface-high flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-highest flex items-center justify-center text-on-surface">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Base</p>
            <p className="text-sm font-bold text-on-surface">{data.base}</p>
          </div>
        </div>
        
        <div className="bg-surface-low rounded-2xl p-4 border border-surface-high flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-highest flex items-center justify-center text-on-surface">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Team Principal</p>
            <p className="text-sm font-bold text-on-surface">{data.principal}</p>
          </div>
        </div>

        <div className="bg-surface-low rounded-2xl p-4 border border-surface-high flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-highest flex items-center justify-center text-on-surface">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Power Unit</p>
            <p className="text-sm font-bold text-on-surface">{data.powerUnit}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: History */}
        <section className="lg:col-span-1 border-t border-surface-high pt-6">
          <h3 className="flex items-center gap-2 font-headline font-bold text-base uppercase tracking-widest text-on-surface mb-4">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
            The 2026 Era
          </h3>
          <p className="text-on-surface-variant leading-relaxed text-sm">
            {data.history}
          </p>
        </section>

        {/* Right Column: Drivers */}
        <section className="lg:col-span-2 border-t border-surface-high pt-6">
          <h3 className="font-headline font-bold text-base uppercase tracking-widest text-on-surface mb-4">
            Driver Lineup
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.drivers.map((drv: any, idx: number) => (
              <DriverCard 
                key={idx} 
                team={team} 
                role={drv.role} 
                name={drv.name} 
                number={drv.number} 
              />
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}

interface DriverCardProps {
  team: Team;
  role: string;
  name: string;
  number: string;
}

function DriverCard({ team, role, name, number }: DriverCardProps) {
  const driverData = DRIVERS.find(d => d.name === name.toUpperCase());

  return (
    <div className="flex bg-surface-low border border-surface-high rounded-xl p-4 items-center gap-4 hover:border-surface-highest transition-colors cursor-pointer group hover:bg-surface-highest/20">
      <div 
        className="w-14 h-14 shrink-0 rounded-full bg-surface flex items-center justify-center border-[3px] border-transparent group-hover:border-current transition-colors shadow-inner overflow-hidden"
        style={{ color: team.color }}
      >
        {driverData ? (
          <img src={driverData.avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-on-surface-variant group-hover:text-current transition-colors" />
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">{role}</span>
        <span className="font-bold text-lg text-on-surface truncate tracking-tight">{name}</span>
      </div>
      <div className="font-headline font-bold text-3xl text-surface-highest group-hover:text-surface-bright transition-colors">
        {number}
      </div>
    </div>
  );
}
