'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, MapPin, Pause, Play, Square, Wifi, BusFront } from 'lucide-react';
import { io } from 'socket.io-client';

// --- CONFIG ---
const socket = io('http://localhost:5000', { autoConnect: false });

const BusMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-600">
      <MapPin size={40} className="animate-bounce mb-2" />
      <span className="text-[10px] font-black tracking-widest">LOADING MAP</span>
    </div>
  ),
});

type Status = 'idle' | 'sharing' | 'paused';

interface BusType {
  busNo: string;
  reg: string;
  route: string;
}

export default function DriverDashboard() {
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [status, setStatus] = useState<Status>('idle');
  const [loadingBus, setLoadingBus] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const watchId = useRef<number | null>(null);

  // --- MOCK DATA LOAD ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedBus({
        busNo: 'BRTC-PADMA',
        reg: 'DHK-11-2233',
        route: 'Route 1',
      });
      setLoadingBus(false);
    }, 700);

    return () => {
      clearTimeout(timer);
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      if (socket.connected) socket.disconnect();
    };
  }, []);

  // --- SOCKET EVENTS ---
  useEffect(() => {
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // --- GPS LOGIC ---
  const initTracking = () => {
    if (!navigator.geolocation || !selectedBus) return;
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed: rawSpeed, heading } = pos.coords;
        const currentSpeed = rawSpeed ? Math.round(rawSpeed * 3.6) : 0;

        setLocation({ lat, lng, heading: heading ?? 0 });
        setSpeed(currentSpeed);

        if (socket.connected) {
          socket.emit('sendLocation', {
            routeId: selectedBus.route,
            busId: selectedBus.busNo,
            lat,
            lng,
            speed: currentSpeed,
            heading: heading ?? 0,
            status: 'running',
          });
        }
      },
      (err) => console.error('GPS Error:', err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  // --- ACTIONS ---
  const handleStart = () => {
    if (!selectedBus) return;

    setIsMapVisible(true);

    if (!socket.connected) socket.connect();
    setStatus('sharing');

    socket.emit('joinRoute', { routeId: selectedBus.route });
    socket.emit('busStatus', { busId: selectedBus.busNo, routeId: selectedBus.route, status: 'running' });

    initTracking();
  };

  const handlePause = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setStatus('paused');
    socket.emit('busStatus', { busId: selectedBus?.busNo, routeId: selectedBus?.route, status: 'paused' });
  };

  const handleResume = () => {
    setStatus('sharing');
    socket.emit('busStatus', { busId: selectedBus?.busNo, routeId: selectedBus?.route, status: 'running' });
    initTracking();
  };

  const handleStop = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);

    if (socket.connected) {
      socket.emit('busStatus', { busId: selectedBus?.busNo, routeId: selectedBus?.route, status: 'offline' });
      setTimeout(() => socket.disconnect(), 120);
    }

    setStatus('idle');
    setLocation(null);
    setSpeed(0);
    setIsMapVisible(false);
  };

  return (
    <div className="relative h-screen w-full bg-zinc-950 text-white overflow-hidden flex flex-col">
      {/* --- MAP LAYER --- */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-700 ${isMapVisible ? 'opacity-100' : 'opacity-0'
          }`}
      >
        {isMapVisible && <BusMap location={location} />}
      </div>

      {/* --- IDLE SCREEN --- */}
      {!isMapVisible && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-900 to-zinc-950">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex justify-center">
              <div className="h-24 w-24 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-2xl relative">
                <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping"></div>
                <Navigation size={40} className="text-zinc-400" />
              </div>
            </div>

            <div className="text-center space-y-2 mb-10">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                {loadingBus ? 'Fetching Schedule...' : selectedBus?.busNo}
              </h1>
              <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
                {selectedBus?.route || 'No Route Assigned'}
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={loadingBus}
              className="group w-full py-4 bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={20} fill="currentColor" />
              Start Duty
            </button>
          </div>
        </div>
      )}

      {/* --- TOP HUD --- */}
      {isMapVisible && (
        <div className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none flex flex-col items-center">
          <div
            className={`
              pointer-events-auto
              flex items-center gap-4 pl-4 pr-5 py-3 
              bg-zinc-950/80 backdrop-blur-xl 
              border border-red-500/30
              shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)]
              rounded-full
              transition-all duration-300
              ${status === 'sharing' ? 'shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)] border-red-500/50' : 'border-zinc-700'}
            `}
          >
            {/* Live Indicator */}
            <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 shrink-0">
              {status === 'sharing' ? (
                <>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-20 animate-ping"></span>
                  <Wifi size={18} className="text-red-500 relative z-10" />
                </>
              ) : (
                <Pause size={18} className="text-amber-400" />
              )}
            </div>

            {/* Speed */}
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase leading-none mb-1">
                {status === 'sharing' ? 'Live Tracking' : 'Paused'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white leading-none font-mono">
                  {speed.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">KM/H</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 mx-1"></div>

            {/* Bus No */}
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end text-zinc-400">
                <BusFront size={12} />
                <span className="text-[9px] font-black uppercase tracking-wider">Bus No</span>
              </div>
              <div className="text-sm font-bold text-zinc-200">{selectedBus?.busNo}</div>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM CONTROLS --- */}
      {isMapVisible && (
        <div className="mt-auto relative z-30 bg-zinc-950 border-t border-white/5 pb-6 pt-4 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* Pause/Resume */}
            <button
              onClick={status === 'paused' ? handleResume : handlePause}
              className={`
                flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-transform active:scale-95
                ${status === 'paused'
                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-white/5'
                }
              `}
            >
              {status === 'paused' ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
              {status === 'paused' ? 'Resume' : 'Pause'}
            </button>

            {/* Stop Trip */}
            <button
              onClick={handleStop}
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-900/30 text-red-200 border border-red-900/50 hover:bg-red-900/50 font-black uppercase tracking-widest text-sm transition-transform active:scale-95"
            >
              <Square size={18} fill="currentColor" />
              End Trip
            </button>
          </div>

          {/* Connection Status */}
          <div className="flex justify-center mt-4">
            <div
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${socketConnected ? 'text-zinc-500' : 'text-red-500'
                }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'
                  }`}
              ></div>
              {socketConnected ? 'Server Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
