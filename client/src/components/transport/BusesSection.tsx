'use client';

import ImageWithFallback from '@/components/common/ImageWithFallback';
import { SectionHeader } from './SectionHeader';

interface BusData {
  id: string;
  name: string;
  status: string;
  nextDeparture: string;
  image: string;
}

const BUSES_DATA: BusData[] = [
  {
    id: '1',
    name: 'BRTC-11 (Double Decker)',
    status: 'On Route',
    nextDeparture: '10:30 AM',
    image: '/static/bus-double.jpg',
  },
  {
    id: '2',
    name: 'BRTC-06 (Boikali)',
    status: 'Scheduled',
    nextDeparture: '11:15 AM',
    image: '/static/bus-single.jpg',
  },
  {
    id: '3',
    name: 'Chitra',
    status: 'Maintenance',
    nextDeparture: '-',
    image: '/static/bus-chitra.jpg',
  },
  {
    id: '4',
    name: 'Joyonti',
    status: 'On Route',
    nextDeparture: '1:00 PM',
    image: '/static/bus-joyonti.jpg',
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const colors =
    {
      'On Route': 'bg-green-500/20 text-green-400 border-green-500/20',
      Scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
      Maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
      Inactive: 'bg-white/5 text-gray-500 border-white/5',
    }[status] || 'bg-white/5 text-gray-500';

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${colors}`}
    >
      {status}
    </span>
  );
};

const BusCard = ({ bus }: { bus: BusData }) => (
  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all group cursor-pointer shadow-white/5">
    <div className="w-20 h-20 bg-gray-800 rounded-lg relative overflow-hidden shrink-0 border border-white/5">
      <ImageWithFallback
        src={bus.image}
        alt={bus.name}
        fill
        className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
        fallbackText="Bus"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-gray-100 text-sm truncate pr-2">{bus.name}</h4>
        <StatusBadge status={bus.status} />
      </div>

      <div className="flex items-center gap-4 mt-2">
        <div className="text-xs">
          <span className="block text-[10px] font-black text-gray-500 uppercase tracking-tighter">
            Departure
          </span>
          <span className="font-bold text-gray-300">{bus.nextDeparture}</span>
        </div>
        <div className="text-xs">
          <span className="block text-[10px] font-black text-gray-500 uppercase tracking-tighter">
            Type
          </span>
          <span className="font-bold text-gray-300">AC/Non-AC</span>
        </div>
      </div>
    </div>
  </div>
);

export const BusesSection = () => (
  <section id="buses" className="scroll-mt-24">
    <SectionHeader number="3" title="Fleet" subtitle="Track your ride" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
      {BUSES_DATA.map((bus) => (
        <BusCard key={bus.id} bus={bus} />
      ))}
    </div>
  </section>
);
