'use client';

import ImageWithFallback from '@/components/common/ImageWithFallback';
import { SectionHeader } from './SectionHeader';
import { Loader2, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface IAssignedDriver {
  _id: string;
  name: string;
}

interface IBus {
  _id: string;
  name: string;
  plateNumber: string;
  photo?: string;
  assignedDriver?: IAssignedDriver | null;
  driverId?: IAssignedDriver | string | null; // legacy fallback
}

// const StatusBadge = ({ status }: { status: string }) => {
//   const colors =
//     {
//       'On Route': 'bg-green-500/20 text-green-400 border-green-500/20',
//       Scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
//       Maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
//       Inactive: 'bg-white/5 text-gray-500 border-white/5',
//     }[status] || 'bg-white/5 text-gray-500';

//   return (
//     <span
//       className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${colors}`}
//     >
//       {status}
//     </span>
//   );
// };

const BusCard = ({ bus }: { bus: IBus }) => {
  // Backend now enriches with `assignedDriver`; fall back to populated `driverId`
  const driverName =
    bus.assignedDriver?.name ??
    (typeof bus.driverId === 'object' && bus.driverId !== null
      ? (bus.driverId as IAssignedDriver).name
      : null) ??
    'Unassigned';

  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all group cursor-pointer shadow-white/5">
      <div className="w-20 h-20 bg-gray-800 rounded-lg relative overflow-hidden shrink-0 border border-white/5">
        <ImageWithFallback
          src={bus.photo || '/static/bus-placeholder.jpg'}
          alt={bus.name}
          fill
          className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
          fallbackText="Bus"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-100 text-lg truncate pr-2 mb-2">{bus.name}</h4>

        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
          <div className="p-1.5 rounded-md bg-white/5 border border-white/10 text-brick-400">
            <User size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-black leading-none mb-0.5">
              Driver
            </span>
            <span className="text-gray-300 truncate">{driverName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BusesSection = () => {
  const [buses, setBuses] = useState<IBus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/bus/get-all-buses`
        );
        const json = await res.json();
        if (json.success && json.data) {
          setBuses(json.data);
        }
      } catch (error) {
        console.error('Error fetching buses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuses();
  }, []);

  return (
    <section id="buses" className="scroll-mt-24">
      <SectionHeader number="3" title="Fleet" subtitle="Track your ride" />

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-16 gap-3">
          <Loader2 className="animate-spin text-brick-500" size={32} />
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">
            Locating Fleet...
          </p>
        </div>
      ) : buses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {buses.map((bus) => (
            <BusCard key={bus._id} bus={bus} />
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-12 bg-white/5 border border-white/10 rounded-2xl shadow-inner mb-10">
          <p className="text-gray-400 font-semibold mb-1">No active buses found in the fleet.</p>
        </div>
      )}
    </section>
  );
};
