'use client';

import { Bus as BusIcon, Info, Loader2, MapPin, History } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { SectionHeader } from './SectionHeader';

// --- Types ---

interface IBus {
  _id: string;
  name: string;
  plateNumber: string;
}

interface ITimeSlot {
  time: string;
  bus: IBus | string; // from backend populate
}

interface IStopage {
  _id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

interface IRoute {
  _id: string;
  name: string;
  activeHoursComing?: ITimeSlot[];
  activeHoursGoing?: ITimeSlot[];
  isActive?: boolean;
  stopages?: IStopage[] | string[];
}

interface ScheduleItem {
  id: string;
  time: string;
  route: string;
  busType: string; // Bus name or fallback
  period: 'AM' | 'PM';
  direction: 'To University' | 'From University';
  isPeak?: boolean;
  isNextBus?: boolean;
  routeName: string; // Added to enable route-wise sorting
}

// --- Helpers ---

const parseTime = (timeStr: string) => {
  // Try parsing "08:15 AM" or "02:30 PM"
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return { period: 'AM' as const, minutes: 0, formatted: timeStr };

  const hours = parseInt(m[1], 10);
  const mins = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase() as 'AM' | 'PM';

  let totalMins = hours * 60 + mins;
  if (ampm === 'PM' && hours !== 12) totalMins += 12 * 60;
  if (ampm === 'AM' && hours === 12) totalMins -= 12 * 60;

  // Determine if peak (e.g., 7-9 AM, 4-6 PM)
  const isPeak =
    (totalMins >= 7 * 60 && totalMins <= 9 * 60) || (totalMins >= 16 * 60 && totalMins <= 18 * 60);

  return { period: ampm, minutes: totalMins, formatted: timeStr, isPeak };
};

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const ScheduleCard = ({ item }: { item: ScheduleItem }) => (
  <div
    className={`relative bg-white/15 backdrop-blur-xl p-4 rounded-xl border ${
      item.isNextBus
        ? 'border-brick-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
        : 'border-white/20 shadow-white/5'
    } shadow-2xl flex items-center justify-between group active:scale-[0.99] transition-all hover:bg-white/20 cursor-pointer overflow-hidden`}
  >
    {/* Subtle pulsing background for the next bus card */}
    {item.isNextBus && (
      <div className="absolute inset-0 bg-brick-500/10 animate-pulse pointer-events-none"></div>
    )}

    <div className="flex items-center gap-4 relative z-10">
      <div
        className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center border ${item.isNextBus ? 'bg-brick-600/30 border-brick-500/40' : 'bg-white/10 border-white/20 shadow-inner'}`}
      >
        <span
          className={`text-lg font-black leading-none ${item.isNextBus ? 'text-brick-400' : 'text-white'}`}
        >
          {item.time.split(' ')[0]} {/* Show just the HH:MM */}
        </span>
        <span className="text-[10px] font-bold text-gray-500 uppercase">{item.period}</span>
      </div>

      <div>
        <h4 className="font-bold text-gray-200 text-sm leading-tight mb-1">{item.route}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <BusIcon size={10} className={item.isNextBus ? 'text-brick-500' : 'text-gray-500'} />
          {item.busType}
          {item.isNextBus && (
            <span className="text-brick-400 font-black px-1.5 py-0.5 bg-brick-900/50 rounded text-[10px] border border-brick-500/50 whitespace-nowrap animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]">
              NEXT BUS
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const SchedulesSection = () => {
  const [filter, setFilter] = useState<'All' | 'From University' | 'To University'>('All');
  const [showAll, setShowAll] = useState(false);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMinutes, setCurrentMinutes] = useState(0);
  const [closestStops, setClosestStops] = useState<{ name: string; distanceKm: number }[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime(); // Initial set
    const interval = setInterval(updateTime, 60000); // 1-minute interval update
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/route`
        );
        const json = await res.json();
        if (json.success && json.data) {
          setRoutes(json.data.filter((r: IRoute) => r.isActive !== false));
        }
      } catch (err) {
        console.error('Failed to fetch routes for schedule:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (routes.length === 0) return;

    // Flatten all stopages
    const allStopsMap = new Map<string, IStopage>();
    routes.forEach((r) => {
      if (Array.isArray(r.stopages)) {
        r.stopages.forEach((s) => {
          if (typeof s === 'object' && s !== null && s.latitude && s.longitude) {
            allStopsMap.set((s as IStopage).name, s as IStopage);
          }
        });
      }
    });

    const uniqueStops = Array.from(allStopsMap.values());

    if ('geolocation' in navigator && uniqueStops.length > 0) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const distances = uniqueStops.map((stop) => {
            const dist = getDistanceFromLatLonInKm(
              latitude,
              longitude,
              Number(stop.latitude),
              Number(stop.longitude)
            );
            return { name: stop.name, distanceKm: dist };
          });

          distances.sort((a, b) => a.distanceKm - b.distanceKm);
          setClosestStops(distances.slice(0, 2));
        },
        (error) => {
          console.error('Error getting location: ', error);
        }
      );
    }
  }, [routes]);

  // Format API data into ScheduleItems
  const scheduleData = useMemo(() => {
    const items: ScheduleItem[] = [];

    routes.forEach((route) => {
      // Determine the 'last stop' name for more descriptive titles
      let lastStopName = route.name;
      if (Array.isArray(route.stopages) && route.stopages.length > 0) {
        const lastStop = route.stopages[route.stopages.length - 1];
        if (typeof lastStop === 'object' && lastStop !== null && 'name' in lastStop) {
          lastStopName = (lastStop as IStopage).name;
        } else if (typeof lastStop === 'string') {
          // Fallback if route.stopages was NOT populated and just has string IDs
          // though based on the service it should be populated.
          // In that rare string fallback, we just stick to route.name
        }
      }

      // Outbound (Going) - From University
      if (route.activeHoursGoing && Array.isArray(route.activeHoursGoing)) {
        route.activeHoursGoing.forEach((slot, i) => {
          if (!slot.time || !slot.time.trim()) return;
          const parsed = parseTime(slot.time);
          const busName =
            typeof slot.bus === 'object' && slot.bus !== null ? slot.bus.name : 'Standard Bus';

          items.push({
            id: `go-${route._id}-${i}`,
            time: parsed.formatted,
            route: `Campus -> ${lastStopName}`,
            busType: busName,
            period: parsed.period,
            direction: 'From University',
            isPeak: parsed.isPeak,
            routeName: route.name,
          });
        });
      }

      // Inbound (Coming) - To University
      if (route.activeHoursComing && Array.isArray(route.activeHoursComing)) {
        route.activeHoursComing.forEach((slot, i) => {
          if (!slot.time || !slot.time.trim()) return;
          const parsed = parseTime(slot.time);
          const busName =
            typeof slot.bus === 'object' && slot.bus !== null ? slot.bus.name : 'Standard Bus';

          items.push({
            id: `come-${route._id}-${i}`,
            time: parsed.formatted,
            route: `${lastStopName} -> Campus`,
            busType: busName,
            period: parsed.period,
            direction: 'To University',
            isPeak: parsed.isPeak,
            routeName: route.name,
          });
        });
      }
    });

    // Sort: Route Name -> Direction (Outbound then Inbound) -> Time
    items.sort((a, b) => {
      if (a.routeName !== b.routeName) return a.routeName.localeCompare(b.routeName);
      if (a.direction !== b.direction) return b.direction.localeCompare(a.direction); // 'From University' comes before 'To University' alphabetically, so b-a works or we could do a direct check. Let's do a direct check to be safe: return a.direction === 'From University' ? -1 : 1;
      const timeA = parseTime(a.time).minutes;
      const timeB = parseTime(b.time).minutes;
      return timeA - timeB;
    });

    return items;
  }, [routes]);

  // Filter Data
  const displayData = useMemo(() => {
    let filtered =
      filter === 'All' ? scheduleData : scheduleData.filter((s) => s.direction === filter);

    // Only show upcoming buses (unless showAll)
    if (!showAll && currentMinutes > 0) {
      filtered = filtered.filter((s) => {
        const timeParts = parseTime(s.time);
        return timeParts.minutes >= currentMinutes;
      });

      // Find the absolute next bus times
      const fromBuses = filtered.filter((s) => s.direction === 'From University');
      const toBuses = filtered.filter((s) => s.direction === 'To University');

      const nextFromTime =
        fromBuses.length > 0 ? Math.min(...fromBuses.map((s) => parseTime(s.time).minutes)) : -1;
      const nextToTime =
        toBuses.length > 0 ? Math.min(...toBuses.map((s) => parseTime(s.time).minutes)) : -1;

      filtered = filtered.map((s) => {
        const timeParts = parseTime(s.time);
        return {
          ...s,
          isNextBus:
            (s.direction === 'From University' && timeParts.minutes === nextFromTime) ||
            (s.direction === 'To University' && timeParts.minutes === nextToTime),
        };
      });
    }

    return filtered;
  }, [scheduleData, filter, currentMinutes, showAll]);

  return (
    <section id="schedules" className="mb-20 scroll-mt-24">
      {/* Closest Stopages */}
      {closestStops.length > 0 && (
        <div className="my-10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 px-1">
            <MapPin className="text-brick-500" size={20} /> Closest Stoppages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {closestStops.map((stop, idx) => {
              // Time = Distance / Speed * 60 (to get minutes)
              // Speeds roughly: Walk 5km/h, Rickshaw 10km/h, CNG/Bike 30km/h
              const walkTime = Math.ceil((stop.distanceKm / 5) * 60);
              const rickshawTime = Math.ceil((stop.distanceKm / 10) * 60);
              const cngTime = Math.ceil((stop.distanceKm / 30) * 60);

              return (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:bg-white/15 transition-all shadow-white/5"
                >
                  <div className="absolute -top-4 -right-4 p-3 opacity-5 group-hover:scale-150 transition-transform duration-700 ease-out text-white">
                    <MapPin size={100} />
                  </div>

                  <div className="relative z-10">
                    <h4 className="font-bold text-xl text-white mb-1 shadow-black max-w-[85%] truncate">
                      {stop.name}
                    </h4>
                    <div className="text-brick-400 font-bold mb-5 flex items-center gap-1.5 text-sm bg-brick-900/30 w-max px-2 py-0.5 rounded-full border border-brick-500/20">
                      <MapPin size={12} /> {stop.distanceKm.toFixed(2)} km away
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/30 rounded-xl p-2.5 text-center border border-white/10 group-hover:border-white/20 transition-colors">
                        <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">
                          Walk
                        </span>
                        <span className="text-white font-bold text-sm">
                          {walkTime < 1 ? '<1m' : `${walkTime}m`}
                        </span>
                      </div>
                      <div className="bg-black/30 rounded-xl p-2.5 text-center border border-white/10 group-hover:border-white/20 transition-colors">
                        <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">
                          Rickshaw
                        </span>
                        <span className="text-white font-bold text-sm">
                          {rickshawTime < 1 ? '<1m' : `${rickshawTime}m`}
                        </span>
                      </div>
                      <div className="bg-black/30 rounded-xl p-2.5 text-center border border-white/10 group-hover:border-white/20 transition-colors">
                        <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">
                          CNG/Bike
                        </span>
                        <span className="text-white font-bold text-sm">
                          {cngTime < 1 ? '<1m' : `${cngTime}m`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SectionHeader number="1" title="Schedules" subtitle="When is the next bus?" />

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'From University', 'To University'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as 'All' | 'From University' | 'To University')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
              filter === f
                ? 'bg-brick-600 text-white border-brick-600 shadow-lg shadow-brick-900/40'
                : 'bg-white/10 text-gray-400 border-white/20 hover:bg-white/15 backdrop-blur-md cursor-pointer'
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => setShowAll((v) => !v)}
          className={`ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
            showAll
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-white/10 text-gray-400 border-white/20 hover:bg-white/15 backdrop-blur-md cursor-pointer'
          }`}
          title={showAll ? 'Showing all time slots' : 'Show full day schedule'}
        >
          <History className="w-3.5 h-3.5" />
          {showAll ? 'All Slots' : 'Full Day'}
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-16 gap-3">
          <Loader2 className="animate-spin text-brick-500" size={32} />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">
            Routing Data...
          </p>
        </div>
      ) : filter === 'All' && displayData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: From University */}
          <div>
            <h4 className="font-bold text-gray-400 mb-3 px-1 uppercase tracking-wider text-xs border-b border-white/10 pb-2">
              From University
            </h4>
            <div className="flex flex-col gap-3">
              {displayData
                .filter((item) => item.direction === 'From University')
                .map((item) => (
                  <ScheduleCard key={item.id} item={item} />
                ))}
              {displayData.filter((item) => item.direction === 'From University').length === 0 && (
                <p className="text-gray-500 text-xs italic">No upcoming buses from university.</p>
              )}
            </div>
          </div>

          {/* Right Column: To University */}
          <div>
            <h4 className="font-bold text-gray-400 mb-3 px-1 uppercase tracking-wider text-xs border-b border-white/10 pb-2">
              To University
            </h4>
            <div className="flex flex-col gap-3">
              {displayData
                .filter((item) => item.direction === 'To University')
                .map((item) => (
                  <ScheduleCard key={item.id} item={item} />
                ))}
              {displayData.filter((item) => item.direction === 'To University').length === 0 && (
                <p className="text-gray-500 text-xs italic">No upcoming buses to university.</p>
              )}
            </div>
          </div>
        </div>
      ) : displayData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayData.map((item) => (
            <ScheduleCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
          <p className="text-gray-400 font-semibold mb-1">No schedules available right now.</p>
          <p className="text-gray-500 text-xs">
            Try selecting a different filter or check back later.
          </p>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400 flex items-center gap-1.5 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md shadow-lg shadow-white/5">
        <Info size={14} className="text-brick-500 flex-shrink-0" />
        Schedules are subject to change during holidays and semester breaks.
      </p>
    </section>
  );
};
