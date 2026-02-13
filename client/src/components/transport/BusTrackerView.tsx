'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Route, ArrowRight } from 'lucide-react';

interface BusTrackerViewProps {
  onClose: () => void;
}

const liveBuses = [
  {
    id: 'BUS001',
    routeId: 'ROUTE-A1',
    departure: 'Campus Main Gate',
    destination: 'Town Hall',
    nextStop: 'Science Building',
    eta: '2 mins',
    status: 'on-time',
    occupancy: 'light',
  },
  {
    id: 'BUS002',
    routeId: 'ROUTE-B2',
    departure: 'Town Hall',
    destination: 'Campus Main Gate',
    nextStop: 'Medical College',
    eta: '5 mins',
    status: 'delayed',
    occupancy: 'heavy',
  },
];

const BusTrackerView: React.FC<BusTrackerViewProps> = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {liveBuses.map((bus) => (
          <motion.div
            key={bus.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/10 transition-all group/card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-brick-500 rounded-lg text-white">
                  <Route size={20} />
                </div>
                {bus.routeId}
              </h3>
              <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Public Bus
              </div>
            </div>

            {/* Route Info */}
            <div className="space-y-4 mb-6">
              <div className="relative pl-6 space-y-4">
                {/* Connector Line */}
                <div className="absolute left-[7px] top-[7px] bottom-[7px] w-[2px] bg-linear-to-b from-brick-500/40 via-brick-500/20 to-transparent" />

                <div className="relative">
                  <div className="absolute -left-[22px] top-[6px] w-[11px] h-[11px] rounded-full bg-brick-500 border-2 border-gray-900 z-10 shadow-[0_0_10px_rgba(185,28,28,0.4)]" />
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-0.5">
                    Departure
                  </p>
                  <p className="text-gray-200 font-bold text-sm leading-tight">{bus.departure}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[22px] top-[6px] w-[11px] h-[11px] rounded-full bg-gray-600 border-2 border-gray-900 z-10" />
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-0.5">
                    Destination
                  </p>
                  <p className="text-gray-200 font-bold text-sm leading-tight">{bus.destination}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Clock size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    Arrival In
                  </span>
                </div>
                <p className="text-brick-400 font-black text-lg">{bus.eta}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <MapPin size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    Next Stop
                  </span>
                </div>
                <p className="text-white font-bold text-xs truncate">{bus.nextStop}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    bus.status === 'on-time' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {bus.status === 'on-time' ? 'On Schedule' : 'Slight Delay'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs font-black text-brick-400 hover:text-brick-300 transition-colors uppercase tracking-widest group/link"
              >
                View Track{' '}
                <ArrowRight
                  size={14}
                  className="group-hover/link:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BusTrackerView;
