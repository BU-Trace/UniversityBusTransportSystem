'use client';

import { Clock, ExternalLink } from 'lucide-react';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { SectionHeader } from './SectionHeader';

interface RouteData {
  id: string;
  name: string;
  stops: string[];
  duration: string;
  image: string;
}

const ROUTES_DATA: RouteData[] = [
  {
    id: '1',
    name: 'Campus - Rupatoli',
    stops: ['Main Gate', 'Dapdapia', 'Rupatoli Stand'],
    duration: '25 min',
    image: '/static/route-rupatoli.jpg',
  },
  {
    id: '2',
    name: 'Campus - Nathullabad',
    stops: ['Campus', 'Amtola', 'Kashipur', 'Nathullabad'],
    duration: '35 min',
    image: '/static/route-nathullabad.jpg',
  },
  {
    id: '3',
    name: 'Campus - Sadar Road',
    stops: ['Campus', 'Launch Ghat', 'Sadar Road'],
    duration: '40 min',
    image: '/static/route-sadar.jpg',
  },
];

const RouteCard = ({ route }: { route: RouteData }) => (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/20 group hover:bg-white/15 transition-all duration-300 cursor-pointer shadow-white/5">
    <div className="h-32 bg-gray-800 relative">
      <ImageWithFallback
        src={route.image}
        alt={route.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
        fallbackText="Map Preview"
      />
      <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold shadow-lg border border-white/10 flex items-center gap-1 text-white">
        <Clock size={12} className="text-brick-500" /> {route.duration}
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-bold text-gray-100 text-lg mb-3">{route.name}</h3>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-brick-500 shadow-lg shadow-brick-500/50"></div>
        <div className="h-[2px] flex-1 bg-white/10 relative">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-brick-500/30"></div>
        </div>
        <div className="w-2 h-2 rounded-full bg-gray-700 border-2 border-gray-900 ring-1 ring-white/10"></div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {route.stops.map((stop: string, idx: number) => (
          <span
            key={idx}
            className="bg-white/10 text-gray-300 text-[10px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-tight shadow-sm shadow-black/20"
          >
            {stop}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export const RoutesSection = () => (
  <section id="routes" className="mb-20 scroll-mt-24">
    <SectionHeader number="2" title="Routes" subtitle="Where do we go?" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {ROUTES_DATA.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))}
    </div>

    <button className="w-full mt-8 py-4 rounded-xl bg-white/10 backdrop-blur-md text-brick-400 font-bold border border-white/20 hover:bg-white/15 hover:text-brick-300 transition-all flex items-center justify-center gap-2 text-sm shadow-xl cursor-pointer shadow-white/5">
      View Full Interactive Map <ExternalLink size={16} />
    </button>
  </section>
);
