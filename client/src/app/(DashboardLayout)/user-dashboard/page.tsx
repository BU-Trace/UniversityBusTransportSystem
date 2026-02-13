'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { Bus as BusIcon, MapPin, ChevronRight, X } from 'lucide-react';
import { io } from 'socket.io-client';
import type { Location } from './map';

/* ================= SOCKET ================= */
const socket = io('http://localhost:5000');

/* ================= MAP ================= */
const UserMap = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold">
      Loading Map...
    </div>
  ),
});

export default function Page() {
  /* ================= STATE ================= */
  const [tracking, setTracking] = useState(false);

  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [busLocation, setBusLocation] = useState<Location | null>(null);
  const [selectedBus, setSelectedBus] = useState<string>('');

  /* ================= BUS LIST (DB MOCK) ================= */
  const availableBuses = [
    { busNo: 'BRTC-10', route: 'Route-1', driver: 'Driver1' },
    { busNo: 'BRTC-11', route: 'Route-2', driver: 'Driver2' },
    { busNo: 'BRTC-12', route: 'Route-3', driver: 'Driver3' },
  ];

  /* ================= TRACK BUS ================= */
  const handleTrackBus = () => {
    if (!selectedBus) {
      alert('Please select a bus first');
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        setTracking(true); // ✅ SHOW MAP
      },
      (err) => {
        console.error(err);
        alert('Please allow location access');
      },
      { enableHighAccuracy: true }
    );
  };

  /* ================= LISTEN BUS LOCATION ================= */
  useEffect(() => {
    if (!tracking || !selectedBus) return;

    socket.on('receiveLocation', (data) => {
      if (data.busId === selectedBus) {
        setBusLocation({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      socket.off('receiveLocation');
    };
  }, [tracking, selectedBus]);

  return (
    <div className="relative h-[calc(100vh-2rem)] w-full overflow-hidden rounded-[3rem] border border-white/10 shadow-3xl bg-gray-900/50 backdrop-blur-sm">
      {/* ================= CENTER LOCATION ANIMATION ================= */}
      <AnimatePresence>
        {!tracking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-brick-500/20 animate-ping"></div>
              <div className="absolute inset-4 rounded-full bg-brick-500/10 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-gray-900 border border-white/10 shadow-3xl flex items-center justify-center">
                <MapPin className="w-12 h-12 text-brick-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAP ================= */}
      <div className="absolute inset-0 z-0">
        {tracking ? (
          <UserMap userLocation={userLocation} busLocation={busLocation} />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-md">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              Ready to Track
            </h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              Select your bus below
            </p>
          </div>
        )}
      </div>

      {/* ================= UI OVERLAYS ================= */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-20">
        <AnimatePresence>
          {!tracking && (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-gray-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-3xl w-full max-w-sm border border-white/10 pointer-events-auto"
            >
              <h3 className="text-2xl font-black mb-6 text-white uppercase tracking-tighter flex items-center gap-3">
                <BusIcon className="text-brick-500" size={28} /> Select Bus
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <select
                    value={selectedBus}
                    onChange={(e) => setSelectedBus(e.target.value)}
                    className="w-full p-5 pl-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs outline-none focus:border-brick-500 focus:ring-4 focus:ring-brick-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">
                      -- Choose a Bus --
                    </option>
                    {availableBuses.map((bus) => (
                      <option key={bus.busNo} value={bus.busNo} className="bg-gray-900">
                        {bus.busNo} • {bus.route}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tracking && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gray-900/80 backdrop-blur-xl p-5 px-8 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-6 pointer-events-auto"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Tracking
              </span>
              <span className="text-xl font-black text-white uppercase">{selectedBus}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Live Signal
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                  Connected
                </span>
              </div>
            </div>
            <button
              onClick={() => setTracking(false)}
              className="ml-4 p-3 bg-white/5 hover:bg-brick-500/20 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </div>

      {/* ================= TRACK BUS BUTTON ================= */}
      <AnimatePresence>
        {!tracking && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm"
          >
            <button
              onClick={handleTrackBus}
              disabled={!selectedBus}
              className={`w-full py-6 rounded-4xl font-black uppercase tracking-[0.3em] shadow-3xl transition-all border border-white/10
              ${
                selectedBus
                  ? 'bg-brick-500 text-white hover:bg-brick-600 hover:scale-105 active:scale-95 shadow-brick-500/40'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              Track Bus
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
