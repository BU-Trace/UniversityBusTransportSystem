'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const BusMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">
      Loading Map...
    </div>
  ),
});

export default function DriverDashboard() {
  // --- STATIC DATA (Simulating Database Response) ---
  const [driver] = useState({
    name: 'Driver1',
    id: 'DRV-2026-007',
    busNo: 'BRTC-10', // Static Assigned Bus
    reg: 'DHK-METRO-11-2233',
    route: 'Route-1', // Static Assigned Route
    profilePic: '/static/driver-photo.jpg', // Local static file
  });

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'sharing' | 'paused'>('idle');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const watchId = useRef<number | null>(null);

  const initTracking = () => {
    if (!navigator.geolocation) return alert('GPS not supported');

    let lastSentTime = 0;

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();

        // Send update only if 10 seconds have passed
        if (now - lastSentTime < 10000) return;
        lastSentTime = now;

        const { latitude: lat, longitude: lng } = pos.coords;

        setLocation({ lat, lng });

        try {
          // await fetch("/api/location", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({
          //     busId: driver.busNo,
          //     lat,
          //     lng,
              
          //   }),
          // });
          socket.emit("sendLocation", {
  busId: driver.busNo,
  lat,
  lng,
  time: new Date().toISOString(),
});

        } catch {
          console.log('API not ready, location updated locally.');
        }
      },
      (err) => console.error('GPS Error:', err),
      { enableHighAccuracy: true }
    );
  };

const handleStart = () => {
  setStatus('sharing');
  setSidebarOpen(false);
  socket.emit("busStatus", { busId: driver.busNo, status: "running" });
  initTracking();
};

const handlePause = () => {
  if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  setStatus('paused');
  socket.emit("busStatus", { busId: driver.busNo, status: "paused" });
};

const handleResume = () => {
  setStatus('sharing');
  socket.emit("busStatus", { busId: driver.busNo, status: "running" });
  initTracking();
};

const handleStop = () => {
  if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  setStatus('idle');
  socket.emit("busStatus", { busId: driver.busNo, status: "stopped" });
  setLocation(null);
  setSidebarOpen(true);
};


  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-1002 w-72 
        bg-linear-to-b from-[#EF4444] to-[#8B0000] 
        text-white p-6 transition-transform duration-500 ease-in-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-light"
        >
          ✕
        </button>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Logo */}
          <div className="flex items-center mb-10">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
              <Image
                src="/static/BUTracelogo-modified.png"
                alt="Logo"
                width={40}
                height={40}
                priority
              />
            </div>
            <span className="ml-3 font-bold text-xl tracking-tighter uppercase">BUTrace</span>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 shadow-xl relative flex items-center justify-center">
                {driver.profilePic ? (
                  <Image src={driver.profilePic} alt="Driver" fill className="object-cover" />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="mt-4 text-xl font-bold uppercase text-center leading-tight">
              {driver.name}
            </h2>
            <p className="text-red-200 text-[10px] font-medium uppercase tracking-widest mt-1 opacity-80">
              Employee ID: {driver.id}
            </p>
          </div>

          {/* Static Data from "Database" */}
          <div className="flex-1 space-y-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">
                Assigned Bus
              </span>
              <p className="text-base font-bold">{driver.busNo}</p>
              <p className="text-[10px] opacity-60">{driver.reg}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">
                Current Route
              </span>
              <p className="text-sm font-semibold leading-tight">{driver.route}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">
                Duty Status
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-green-300">{status}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAP / MAIN AREA */}
      <main className="relative flex-1 h-full w-full">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-6 left-6 z-1001 bg-white text-red-600 p-4 rounded-2xl shadow-xl hover:scale-105 transition-all border border-red-50"
          >
            <span className="text-xl">☰</span>
          </button>
        )}

        <div className="absolute inset-0 z-0">
          {location ? (
            <BusMap location={location} />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                <div className="relative p-8 rounded-full bg-white shadow-2xl flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-16 h-16 text-red-600 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                System Ready
              </h3>
              <p className="text-slate-400 font-medium">Tap Start Shift to begin tracking</p>
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-1001 w-[92%] max-w-md">
          {status === 'idle' ? (
            <button
              onClick={handleStart}
              className="w-full bg-green-600 text-white py-5 rounded-4xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform"
            >
              Start Shift
            </button>
          ) : (
            <>
              <button
                onClick={status === 'paused' ? handleResume : handlePause}
                className={`flex-1 py-5 rounded-4xl font-black uppercase tracking-widest shadow-xl transition-all ${status === 'paused' ? 'bg-amber-500 text-white animate-pulse' : 'bg-white text-amber-600 border-2 border-amber-500'}`}
              >
                {status === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                className="flex-1 bg-red-600 text-white py-5 rounded-4xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
              >
                End Shift
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
