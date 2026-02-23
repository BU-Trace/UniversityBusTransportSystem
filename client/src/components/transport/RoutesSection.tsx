'use client';

import { MapPin, ArrowRight, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { SectionHeader } from './SectionHeader';

interface IStopage {
  _id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

interface IRoute {
  _id: string;
  name: string;
  stopages: IStopage[] | string[];
  isActive?: boolean;
}

const RouteTimelineCard = ({ route }: { route: IRoute }) => {
  const stops = Array.isArray(route.stopages)
    ? route.stopages.map((s) =>
        typeof s === 'object' && s !== null ? (s as IStopage).name : 'Unknown Stop'
      )
    : [];

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 group hover:bg-white/15 transition-all duration-300 shadow-white/5">
      <h3 className="font-black text-gray-100 text-xl mb-6 tracking-tight flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brick-500/20 text-brick-400 border border-brick-500/30">
          <MapPin size={18} strokeWidth={2.5} />
        </div>
        {route.name}
      </h3>

      <div className="relative pl-3 space-y-4 before:absolute before:inset-y-2 before:left-[15px] before:w-[2px] before:bg-white/10">
        {stops.map((stopName, idx) => (
          <div key={idx} className="relative flex items-center gap-4 group/stop">
            {/* Timeline Dot */}
            <div
              className={`w-3 h-3 rounded-full border-2 z-10 bg-gray-900 transition-colors duration-300 ${
                idx === 0 || idx === stops.length - 1
                  ? 'border-brick-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : 'border-white/30 group-hover/stop:border-white/60'
              }`}
            />

            {/* Stop Name */}
            <div
              className={`flex-1 flex items-center gap-2 ${
                idx === 0 || idx === stops.length - 1
                  ? 'text-white font-bold'
                  : 'text-gray-400 font-medium'
              }`}
            >
              {stopName}
              {idx < stops.length - 1 && (
                <ArrowRight size={12} className="text-white/20 ml-auto mr-2" />
              )}
            </div>
          </div>
        ))}
        {stops.length === 0 && (
          <div className="text-sm text-gray-500 italic pl-6">No stopages defined.</div>
        )}
      </div>
    </div>
  );
};

export const RoutesSection = () => {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        console.error('Failed to fetch routes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  return (
    <section id="routes" className="mb-20 scroll-mt-24">
      <SectionHeader number="2" title="Routes" subtitle="Where do we go?" />

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-16 gap-3">
          <Loader2 className="animate-spin text-brick-500" size={32} />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">
            Loading Map Data...
          </p>
        </div>
      ) : routes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {routes.map((route) => (
            <RouteTimelineCard key={route._id} route={route} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
          <p className="text-gray-400 font-semibold mb-1">No operational routes found.</p>
        </div>
      )}
    </section>
  );
};
