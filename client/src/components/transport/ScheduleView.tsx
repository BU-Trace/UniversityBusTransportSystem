'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, ArrowRight, ArrowLeft, Loader2, Info, CalendarClock, History } from 'lucide-react';

// ── Types (mirrors SchedulesSection) ──────────────────────────────────────────
interface IBus {
  _id: string;
  name: string;
  plateNumber: string;
}
interface ITimeSlot {
  time: string;
  bus: IBus | string;
}
interface IStopage {
  _id: string;
  name: string;
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
  busType: string;
  period: 'AM' | 'PM';
  direction: 'To University' | 'From University';
  isPeak?: boolean;
  isNextBus?: boolean;
  minutes: number;
}

type Filter = 'All' | 'From University' | 'To University';

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseTime = (timeStr: string) => {
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return { period: 'AM' as const, minutes: 0, formatted: timeStr, isPeak: false };
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase() as 'AM' | 'PM';
  let total = h * 60 + min;
  if (ampm === 'PM' && h !== 12) total += 720;
  if (ampm === 'AM' && h === 12) total -= 720;
  const isPeak = (total >= 420 && total <= 540) || (total >= 960 && total <= 1080);
  return { period: ampm, minutes: total, formatted: timeStr, isPeak };
};

// ── Compact card ─────────────────────────────────────────────────────────────
const ScheduleCard = ({ item, index }: { item: ScheduleItem; index: number }) => {
  const isFrom = item.direction === 'From University';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04 }}
      className={`relative flex items-center gap-3 rounded-2xl border p-3 overflow-hidden transition-all group ${
        item.isNextBus
          ? 'bg-brick-500/10 border-brick-500/40 shadow-[0_0_14px_rgba(220,38,38,0.25)]'
          : 'bg-white/5 border-white/8 hover:bg-white/8'
      }`}
    >
      {/* Pulsing bg for next bus */}
      {item.isNextBus && (
        <div className="absolute inset-0 bg-brick-500/5 animate-pulse pointer-events-none" />
      )}

      {/* Direction accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl ${
          isFrom ? 'bg-brick-500' : 'bg-blue-500'
        }`}
      />

      {/* Time block */}
      <div
        className={`ml-1 flex flex-col items-center justify-center w-14 h-14 rounded-xl border shrink-0 ${
          item.isNextBus
            ? 'bg-brick-600/25 border-brick-500/30'
            : isFrom
              ? 'bg-brick-500/8 border-brick-500/15'
              : 'bg-blue-500/8 border-blue-500/15'
        }`}
      >
        <span
          className={`text-base font-black leading-none tabular-nums ${
            item.isNextBus ? 'text-brick-300' : 'text-white'
          }`}
        >
          {item.time.split(' ')[0]}
        </span>
        <span
          className={`text-[9px] font-black uppercase mt-0.5 ${item.isNextBus ? 'text-brick-400' : 'text-gray-500'}`}
        >
          {item.period}
        </span>
      </div>

      {/* Route info */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isFrom ? (
            <ArrowRight className="w-3 h-3 shrink-0 text-brick-500" />
          ) : (
            <ArrowLeft className="w-3 h-3 shrink-0 text-blue-400" />
          )}
          <p className="text-xs font-black text-white truncate">{item.route}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
            <Bus className="w-2.5 h-2.5" />
            {item.busType}
          </span>
          {item.isPeak && !item.isNextBus && (
            <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Peak
            </span>
          )}
        </div>
      </div>

      {/* Right: direction tag + next bus badge */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 relative z-10">
        <span
          className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isFrom
              ? 'text-brick-400 bg-brick-500/10 border-brick-500/20'
              : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
          }`}
        >
          {isFrom ? 'Outbound' : 'Inbound'}
        </span>
        {item.isNextBus && (
          <span className="text-[8px] font-black text-brick-300 bg-brick-900/60 border border-brick-500/50 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            Next Bus
          </span>
        )}
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ScheduleView: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('All');
  const [showAll, setShowAll] = useState(false);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMinutes, setCurrentMinutes] = useState(0);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    tick();
    const iv = setInterval(tick, 60_000);
    return () => clearInterval(iv);
  }, []);

  // Fetch routes
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/route`
        );
        const json = await res.json();
        if (json.success && json.data) {
          setRoutes(json.data.filter((r: IRoute) => r.isActive !== false));
        }
      } catch (e) {
        console.error('ScheduleView fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build schedule items
  const scheduleData = useMemo(() => {
    const items: ScheduleItem[] = [];
    routes.forEach((route) => {
      let lastStop = route.name;
      if (Array.isArray(route.stopages) && route.stopages.length > 0) {
        const s = route.stopages[route.stopages.length - 1];
        if (typeof s === 'object' && s !== null && 'name' in s) lastStop = (s as IStopage).name;
      }

      route.activeHoursGoing?.forEach((slot, i) => {
        if (!slot.time?.trim()) return;
        const p = parseTime(slot.time);
        const busName = typeof slot.bus === 'object' && slot.bus ? slot.bus.name : 'Standard Bus';
        items.push({
          id: `go-${route._id}-${i}`,
          time: p.formatted,
          route: `Campus \u2192 ${lastStop}`,
          busType: busName,
          period: p.period,
          direction: 'From University',
          isPeak: p.isPeak,
          minutes: p.minutes,
        });
      });

      route.activeHoursComing?.forEach((slot, i) => {
        if (!slot.time?.trim()) return;
        const p = parseTime(slot.time);
        const busName = typeof slot.bus === 'object' && slot.bus ? slot.bus.name : 'Standard Bus';
        items.push({
          id: `come-${route._id}-${i}`,
          time: p.formatted,
          route: `${lastStop} \u2192 Campus`,
          busType: busName,
          period: p.period,
          direction: 'To University',
          isPeak: p.isPeak,
          minutes: p.minutes,
        });
      });
    });

    items.sort((a, b) => a.minutes - b.minutes);
    return items;
  }, [routes]);

  // Apply filter + upcoming + next-bus flag
  const displayData = useMemo(() => {
    let filtered =
      filter === 'All' ? scheduleData : scheduleData.filter((s) => s.direction === filter);

    if (!showAll && currentMinutes > 0) {
      filtered = filtered.filter((s) => s.minutes >= currentMinutes);

      const fromBuses = filtered.filter((s) => s.direction === 'From University');
      const toBuses = filtered.filter((s) => s.direction === 'To University');
      const nextFrom = fromBuses.length ? Math.min(...fromBuses.map((s) => s.minutes)) : -1;
      const nextTo = toBuses.length ? Math.min(...toBuses.map((s) => s.minutes)) : -1;

      filtered = filtered.map((s) => ({
        ...s,
        isNextBus:
          (s.direction === 'From University' && s.minutes === nextFrom) ||
          (s.direction === 'To University' && s.minutes === nextTo),
      }));
    }

    return filtered;
  }, [scheduleData, filter, currentMinutes, showAll]);

  const fromList = displayData.filter((s) => s.direction === 'From University');
  const toList = displayData.filter((s) => s.direction === 'To University');

  return (
    <div className="flex flex-col gap-3 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-brick-500" />
          <span className="text-[11px] font-black text-white uppercase tracking-widest">
            When is the next bus?
          </span>
        </div>
        {displayData.length > 0 && (
          <span className="text-[9px] font-black text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            {showAll ? `${displayData.length} total` : `${displayData.length} upcoming`}
          </span>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2 flex-1">
          {(['All', 'From University', 'To University'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                filter === f
                  ? f === 'From University'
                    ? 'bg-brick-600/80 text-white border-brick-500/50'
                    : f === 'To University'
                      ? 'bg-blue-600/70 text-white border-blue-500/50'
                      : 'bg-white/15 text-white border-white/20'
                  : 'bg-white/5 text-gray-500 border-white/8 hover:bg-white/10 hover:text-gray-300'
              }`}
            >
              {f === 'From University'
                ? '\u2192 From Campus'
                : f === 'To University'
                  ? '\u2190 To Campus'
                  : 'All'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all shrink-0 ${
            showAll
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-white/5 text-gray-500 border-white/8 hover:bg-white/10 hover:text-gray-300'
          }`}
          title={showAll ? 'Showing all slots' : 'Show all time slots'}
        >
          <History className="w-3 h-3" />
          <span className="hidden sm:inline">{showAll ? 'All' : 'Full'}</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="animate-spin text-brick-500 w-6 h-6" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Loading schedules…
          </p>
        </div>
      )}

      {/* Schedules */}
      {!loading && (
        <AnimatePresence mode="popLayout">
          {displayData.length > 0 ? (
            filter === 'All' ? (
              <div className="flex flex-col gap-4">
                {/* From University column */}
                {fromList.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-brick-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3" /> From University
                    </p>
                    <div className="flex flex-col gap-2">
                      {fromList.map((item, i) => (
                        <ScheduleCard key={item.id} item={item} index={i} />
                      ))}
                    </div>
                  </div>
                )}
                {/* To University column */}
                {toList.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <ArrowLeft className="w-3 h-3" /> To University
                    </p>
                    <div className="flex flex-col gap-2">
                      {toList.map((item, i) => (
                        <ScheduleCard key={item.id} item={item} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {displayData.map((item, i) => (
                  <ScheduleCard key={item.id} item={item} index={i} />
                ))}
              </div>
            )
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-14 gap-3 text-center"
            >
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <CalendarClock className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-black text-gray-400 text-sm uppercase tracking-widest">
                No Upcoming Buses
              </h3>
              <p className="text-xs text-gray-600 max-w-xs">
                All buses have completed their runs for the day. Check back tomorrow.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Notice */}
      {!loading && displayData.length > 0 && (
        <div className="flex items-start gap-2 bg-white/5 border border-white/8 rounded-xl p-3 mt-1">
          <Info className="w-3.5 h-3.5 text-brick-500 shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-gray-500 leading-relaxed">
            Schedules are subject to change during holidays and semester breaks.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
