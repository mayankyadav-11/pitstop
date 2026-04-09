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
          <div className="hidden md:block text-right">
            <p className="text-surface-variant text-sm font-medium">Round 14 / 23</p>
            <p className="text-on-surface-variant font-headline font-bold">SPA-FRANCORCHAMPS</p>
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

      {/* Spotlight Section */}
      <section className="space-y-8 pb-12">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-headline font-bold uppercase tracking-wide">Paddock Spotlight</h3>
          <div className="h-px flex-1 bg-surface-high/20" />
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-full bg-surface-high text-xs font-bold uppercase tracking-widest text-primary border border-primary/20">Drivers</button>
            <button className="px-4 py-1.5 rounded-full bg-transparent text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">Teams</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Driver Card */}
          <DriverSpotlightCard 
            name="LANDO NORRIS"
            team="MCLAREN F1 TEAM"
            number="04"
            stats={{ podiums: 12, fastLaps: 3, avgPos: 4.2 }}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuD6oMbe2MqRFbs-V1XekLWacnjc8OkYU2FUYaboiboYYsNoHai3AWcA2k4OlFdxYzfD_W6t9Qt4JCIAJo0A0Bh3U66Ual4qlxs8BrRYI4ARkXfck-pMka0W6Bl3iUUXRqqULh3r_RS1kzj7KWO6kS4cYuDif8y3yY7dtv4ra9qwN6lm_T9K5PwwRgrWf6wt39SWoPiRu5HT1wMvwovtS4Lvt6AX5XbzQ21M661uKsj39xt2TZIBGPTIyEOYyrRNl-6cyihokhH0kR8"
          />

          {/* Team Spotlight Card */}
          <div className="group relative overflow-hidden rounded-xl bg-surface-low border border-surface-high/10 hover:border-tertiary/30 transition-all duration-300">
            <div className="h-32 w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-surface-low to-transparent z-10" />
              <img 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU-cAudCI4U4Y3oDqCxsdkVXkeX_MMamolxG6h4STmbb8yL6civ-EBMo67k79-bBTUGJFB8TQ7HE5Xr9AFOg9gAqcMH0xmyP9K8-ux34Ufl5b0K7Mfs7LRsF4DNKsyocOqmHHXsC2GsSVC_qap0l1ZekhuNz6gGX9kU0qnU3-zqfzdlntzUEpa4vxjZpbbFagcXtoR0YQW3uaYcGWNwxt138N7OxUIc42ulO3eXlXIxHxP6NsAEbRXiGATFmw6sGzUxGk31uUvoqA"
                alt="Ferrari"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="px-6 pb-6 space-y-4 -mt-8 relative z-20">
              <div className="flex items-end justify-between">
                <div className="bg-surface p-2 rounded-lg shadow-2xl border border-surface-high/20">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Settings2 className="w-8 h-8 text-error" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Constructor</p>
                  <h4 className="font-headline font-bold text-xl leading-tight">SCUDERIA FERRARI</h4>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Pit Stop Avg</span>
                  <span className="font-headline font-bold">2.41s</span>
                </div>
                <div className="w-full h-1.5 bg-surface-highest rounded-full overflow-hidden">
                  <div className="h-full bg-error rounded-full w-[85%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Veteran Spotlight Card */}
          <DriverSpotlightCard 
            name="LEWIS HAMILTON"
            team="MERCEDES-AMG"
            number="44"
            stats={{ titles: 7, wins: 103, poles: 104 }}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuC_map96Poe4vf3LLLrYHnNV8utUh1YIums8q9Ev5ULBk40kazcMJGl7ffhyDX5QkGfj4CwqWNSj33m4WzAmyq9yD4LeVBCVyQtNmYz5aQD7cE5gfAtxZyJzdYhyDoBxAUF7Ag7s_dThhtiUmt9CV2h-gyv9yzLEJy3RYheLl3TqGbOICzgmHI4mU4yTPWI5K19C-_ntI5LLf831WCfqHqAF6Pi1uCjCocmIcL1i6O4f_ezJnESUUpl9y12-vkhwKLkvgFsbqOGl3Y"
            color="#00D2BE"
          />
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
