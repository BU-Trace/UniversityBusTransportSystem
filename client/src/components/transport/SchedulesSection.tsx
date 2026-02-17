'use client';

import { Bus, Info } from 'lucide-react';
import React, { useState } from 'react';
import { SectionHeader } from './SectionHeader';

// Types
interface ScheduleItem {
  time: string;
  route: string;
  busType: string;
  period: 'AM' | 'PM';
  isPeak?: boolean;
}

interface RouteSchedule {
  id: string;
  title: string;
  direction: string;
  items: ScheduleItem[];
}

// Data
const SCHEDULE_DATA: RouteSchedule[] = [
  {
    id: 'outbound',
    title: 'Outbound (Campus -> City)',
    direction: 'Outbound',
    items: [
      {
        time: '8:15',
        period: 'AM',
        route: 'Campus -> Rupatoli/Nathullabad',
        busType: 'Double Decker',
        isPeak: true,
      },
      { time: '9:30', period: 'AM', route: 'Campus -> Rupatoli', busType: 'Regular' },
      { time: '11:00', period: 'AM', route: 'Campus -> Nathullabad', busType: 'Regular' },
      {
        time: '1:15',
        period: 'PM',
        route: 'Campus -> Rupatoli/Nathullabad',
        busType: 'Double Decker',
        isPeak: true,
      },
      { time: '2:30', period: 'PM', route: 'Campus -> City (All Routes)', busType: 'Regular' },
      { time: '3:45', period: 'PM', route: 'Campus -> Rupatoli', busType: 'Regular' },
      {
        time: '5:15',
        period: 'PM',
        route: 'Campus -> Nathullabad',
        busType: 'Regular',
        isPeak: true,
      },
    ],
  },
  {
    id: 'inbound',
    title: 'Inbound (City -> Campus)',
    direction: 'Inbound',
    items: [
      {
        time: '7:30',
        period: 'AM',
        route: 'Rupatoli/Nathullabad -> Campus',
        busType: 'Double Decker',
        isPeak: true,
      },
      { time: '8:45', period: 'AM', route: 'Rupatoli -> Campus', busType: 'Regular' },
      { time: '10:15', period: 'AM', route: 'Nathullabad -> Campus', busType: 'Regular' },
      { time: '12:30', period: 'PM', route: 'Rupatoli/Nathullabad -> Campus', busType: 'Regular' },
      {
        time: '2:00',
        period: 'PM',
        route: 'City (All Routes) -> Campus',
        busType: 'Double Decker',
        isPeak: true,
      },
      { time: '4:30', period: 'PM', route: 'Nathullabad -> Campus', busType: 'Regular' },
    ],
  },
];

const ScheduleCard = ({ item }: { item: ScheduleItem }) => (
  <div className="bg-white/15 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-2xl flex items-center justify-between group active:scale-[0.99] transition-all hover:bg-white/20 cursor-pointer shadow-white/5">
    <div className="flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center border ${item.isPeak ? 'bg-brick-600/30 border-brick-500/40' : 'bg-white/10 border-white/20 shadow-inner'}`}
      >
        <span
          className={`text-lg font-black leading-none ${item.isPeak ? 'text-brick-400' : 'text-white'}`}
        >
          {item.time}
        </span>
        <span className="text-[10px] font-bold text-gray-500 uppercase">{item.period}</span>
      </div>

      <div>
        <h4 className="font-bold text-gray-200 text-sm leading-tight mb-1">{item.route}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Bus size={10} className={item.isPeak ? 'text-brick-500' : 'text-gray-500'} />
          {item.busType}
          {item.isPeak && (
            <span className="text-brick-400 font-black px-1.5 py-0.5 bg-brick-900/50 rounded text-[10px] border border-brick-500/20">
              PEAK
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const SchedulesSection = () => {
  const [filter, setFilter] = useState<'All' | 'Outbound' | 'Inbound'>('All');

  // Flatten data based on filter
  const displayData = React.useMemo(() => {
    if (filter === 'All') {
      return [...SCHEDULE_DATA[0].items, ...SCHEDULE_DATA[1].items].sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
    }
    return SCHEDULE_DATA.find((s) => s.direction === filter)?.items || [];
  }, [filter]);

  return (
    <section id="schedules" className="mb-20 scroll-mt-24">
      <SectionHeader number="1" title="Schedules" subtitle="When is the next bus?" />

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Outbound', 'Inbound'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as 'All' | 'Outbound' | 'Inbound')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
              filter === f
                ? 'bg-brick-600 text-white border-brick-600 shadow-lg shadow-brick-900/40'
                : 'bg-white/10 text-gray-400 border-white/20 hover:bg-white/15 backdrop-blur-md cursor-pointer'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayData.map((item, idx) => (
          <ScheduleCard key={idx} item={item} />
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400 flex items-center gap-1.5 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md shadow-lg shadow-white/5">
        <Info size={14} className="text-brick-500" />
        Schedules are subject to change during holidays and semester breaks.
      </p>
    </section>
  );
};
