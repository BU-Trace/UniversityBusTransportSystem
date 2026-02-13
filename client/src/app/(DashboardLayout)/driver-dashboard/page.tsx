'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { Bus as BusIcon } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const BusMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">
      Loading Map...
    </div>
  ),
});

type Status = 'idle' | 'sharing' | 'paused';

interface Bus {
  busNo: string;
  reg: string;
  route: string;
}

export default function DriverDashboard() {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const watchId = useRef<number | null>(null);

  const availableBuses: Bus[] = [
    { busNo: 'BRTC-8', reg: 'DHK-11-2233', route: 'Route-1' },
    { busNo: 'BRTC-9', reg: 'DHK-11-2233', route: 'Route-1' },
    { busNo: 'BRTC-10', reg: 'DHK-22-8899', route: 'Route-2' },
    { busNo: 'BRTC-11', reg: 'DHK-22-8899', route: 'Route-2' },
    { busNo: 'BRTC-12', reg: 'DHK-55-4455', route: 'Route-3' },
    { busNo: 'BRTC-13', reg: 'DHK-55-4455', route: 'Route-3' },
  ];

  const initTracking = () => {
    if (!navigator.geolocation || !selectedBus) return alert('GPS or Bus not selected');

    let lastSent = 0;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSent < 10000) return;
        lastSent = now;

        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });

        // socket.emit("sendLocation", {
        //   routeId: selectedBus.route,
        //   busId: selectedBus.busNo,
        //   lat,
        //   lng,
        //   status: "running",
        // });
        // DriverDashboard page.tsx
        socket.emit('sendLocation', {
          routeId: selectedBus.route,
          busId: selectedBus.busNo,
          // some slight offset for testing multiple buses
          lat: lat + (selectedBus.busNo === 'BRTC-9' ? 0.0009 : 0),
          lng: lng + (selectedBus.busNo === 'BRTC-9' ? 0.0009 : 0),
          status: 'running',
        });
      },
      (err) => console.error('GPS Error:', err),
      { enableHighAccuracy: true }
    );
  };

  const handleStart = () => {
    if (!selectedBus) return;
    setStatus('sharing');
    // socket.emit("busStatus", { busId: selectedBus.busNo, status: "running" });
    // JOIN ROUTE ROOM
    socket.emit('joinRoute', { routeId: selectedBus.route });

    socket.emit('busStatus', {
      busId: selectedBus.busNo,
      routeId: selectedBus.route,
      status: 'running',
    });
    initTracking();
  };

  const handlePause = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setStatus('paused');
    socket.emit('busStatus', {
      routeId: selectedBus?.route,
      busId: selectedBus?.busNo,
      status: 'paused',
    });
  };

  const handleResume = () => {
    setStatus('sharing');
    socket.emit('busStatus', {
      routeId: selectedBus?.route,
      busId: selectedBus?.busNo,
      status: 'running',
    });
    initTracking();
  };

  const handleStop = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setStatus('idle');
    socket.emit('busStatus', {
      routeId: selectedBus?.route,
      busId: selectedBus?.busNo,
      status: 'stopped',
    });
    setLocation(null);
  };

  return (
    <div className="relative h-[calc(100vh-2rem)] w-full overflow-hidden rounded-[3rem] border border-white/10 shadow-3xl bg-gray-900/50 backdrop-blur-sm">
      {/* FLOATING BUS SELECT CARD */}
      <AnimatePresence>
        {!selectedBus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 
            bg-gray-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-3xl w-[92%] max-w-md z-30 border border-white/10"
          >
            <h3 className="text-2xl font-black mb-6 text-white uppercase tracking-tighter flex items-center gap-3">
              <BusIcon className="text-brick-500" size={28} /> Select Your Bus
            </h3>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {availableBuses.map((bus) => (
                <button
                  key={bus.busNo}
                  onClick={() => setSelectedBus(bus)}
                  className="flex justify-between items-center w-full p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-brick-500/20 hover:border-brick-500/50 transition-all group"
                >
                  <div className="text-left">
                    <p className="font-black text-white group-hover:text-brick-400 transition-colors uppercase tracking-tight">
                      {bus.busNo}
                    </p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {bus.route}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/30">
                    Available
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAP */}
      <div className="absolute inset-0 z-0">
        {location ? (
          <BusMap location={location} />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-md">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-brick-500/20 rounded-full animate-ping"></div>
              <div className="relative p-10 rounded-full bg-gray-900 border border-white/10 shadow-3xl flex items-center justify-center text-4xl">
                📍
              </div>
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              System Ready
            </h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              Select Bus & Start Shift
            </p>
          </div>
        )}
      </div>

      {/* STATUS OVERLAY */}
      {selectedBus && (
        <div className="absolute top-8 left-8 z-20 space-y-3 pointer-events-none">
          <div className="bg-gray-900/80 backdrop-blur-xl p-5 px-8 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Active Bus
              </span>
              <span className="text-xl font-black text-white uppercase">{selectedBus.busNo}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Route
              </span>
              <span className="text-sm font-bold text-brick-400 uppercase tracking-tight">
                {selectedBus.route}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Status
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${status === 'sharing' ? 'bg-green-500' : 'bg-amber-500'}`}
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${status === 'sharing' ? 'text-green-400' : 'text-amber-400'}`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLS */}
      <div
        className="fixed bottom-10 left-1/2 -translate-x-1/2 
        flex gap-4 z-40 w-[94%] max-w-md px-1"
      >
        {status === 'idle' ? (
          <button
            onClick={handleStart}
            disabled={!selectedBus}
            className={`w-full py-6 rounded-4xl font-black uppercase tracking-[0.3em] shadow-3xl transition-all border border-white/10
            ${
              selectedBus
                ? 'bg-brick-500 text-white hover:bg-brick-600 hover:scale-105 active:scale-95 shadow-brick-500/40'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            Start Shift
          </button>
        ) : (
          <>
            <button
              onClick={status === 'paused' ? handleResume : handlePause}
              className="flex-1 py-6 rounded-4xl font-black uppercase tracking-widest bg-amber-500 text-white shadow-2xl hover:bg-amber-600 hover:scale-105 active:scale-95 border border-white/10"
            >
              {status === 'paused' ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={handleStop}
              className="flex-1 py-6 rounded-4xl font-black uppercase tracking-widest bg-brick-500 text-white shadow-2xl hover:bg-brick-600 hover:scale-105 active:scale-95 border border-white/10"
            >
              End Shift
            </button>
          </>
        )}
      </div>
    </div>
  );
}
