import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DRIVERS } from '../constants';
import { Settings2 } from 'lucide-react';

export default function Explore() {
  const [drivers, setDrivers] = useState(DRIVERS);

  useEffect(() => {
    async function fetchStandings() {
      try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
        if (!response.ok) throw new Error('API fetch failed');
        const data = await response.json();
        
        const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings;
        if (!standings) return;

        const updatedDrivers = [...DRIVERS].map(driver => {
          const normalizeString = (str: string) => 
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

          const localName = normalizeString(driver.name);
          
          const apiDriver = standings.find((s: any) => {
            const apiFamilyName = normalizeString(s.Driver.familyName);
            // Some edge cases for drivers with multipart family names if needed
            return localName.includes(apiFamilyName);
          });

          if (apiDriver) {
            return {
              ...driver,
              points: parseFloat(apiDriver.points),
              wins: parseInt(apiDriver.wins, 10),
            };
          }
          return driver;
        });

        // Arrange in descending order
        updatedDrivers.sort((a, b) => b.points - a.points);
        
        // Re-assign positions
        updatedDrivers.forEach((d, i) => {
            d.pos = String(i + 1).padStart(2, '0');
        });

        setDrivers(updatedDrivers);
      } catch (error) {
        console.error("Failed to fetch live standings", error);
      }
    }

    fetchStandings();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-12"
    >
      {/* Standings Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
            <span className="text-tertiary font-headline font-bold text-sm tracking-widest uppercase">Live Standings</span>
            <h2 className="text-4xl font-headline font-bold tracking-tight">World Championship</h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-surface-container shadow-2xl">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-high border-b border-surface-high/10">
                  <th className="px-6 py-4 text-left font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Pos</th>
                  <th className="px-6 py-4 text-left font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Driver</th>
                  <th className="px-6 py-4 text-left font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Constructor</th>
                  <th className="px-6 py-4 text-right font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Wins</th>
                  <th className="px-6 py-4 text-right font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-high/5">
                {drivers.map((driver) => (
                  <tr key={driver.pos} className={`group transition-colors ${driver.pos === '01' ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-surface-bright/20'}`}>
                    <td className="px-6 py-5">
                      <span className={`font-headline font-bold text-xl ${driver.pos === '01' ? 'text-primary' : 'text-on-surface-variant'}`}>{driver.pos}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${driver.pos === '01' ? 'border-primary shadow-[0_0_15px_rgba(255,180,167,0.3)]' : 'border-surface-high'}`}>
                          <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-headline font-bold text-on-surface">{driver.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter">
                            {driver.country} • {driver.birthplace}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-on-surface/80">{driver.team}</span>
                    </td>
                    <td className="px-6 py-5 text-right font-headline font-medium text-on-surface">{driver.wins}</td>
                    <td className="px-6 py-5 text-right">
                      <span className={`inline-block px-4 py-1 rounded-full font-headline font-bold text-lg ${driver.pos === '01' ? 'bg-primary text-on-primary' : driver.pos === '02' ? 'text-tertiary' : 'text-on-surface'}`}>
                        {driver.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>


    </motion.div>
  );
}

function DriverSpotlightCard({ name, team, number, stats, image, color }: { name: string, team: string, number: string, stats: any, image: string, color?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-surface-low border border-surface-high/10 hover:border-primary/30 transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 z-10">
        <span className="font-headline font-black text-6xl text-on-surface/5 italic select-none group-hover:text-primary/10 transition-colors">{number}</span>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-high shadow-xl">
            <img src={image} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="pt-2">
            <h4 className="font-headline font-bold text-xl leading-tight">{name.split(' ')[0]}<br/>{name.split(' ')[1]}</h4>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: color || 'var(--color-tertiary)' }}>{team}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 py-4 border-t border-surface-high/10">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key}>
              <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant">{key}</p>
              <p className="font-headline font-bold text-lg">{value as any}</p>
            </div>
          ))}
        </div>
        <button className="w-full py-3 rounded-lg bg-surface-highest text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all">
          {stats.titles ? 'Season History' : 'View Telemetry'}
        </button>
      </div>
    </div>
  );
}
