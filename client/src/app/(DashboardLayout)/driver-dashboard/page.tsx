'use client';

import { useState, useRef } from "react";
import dynamic from "next/dynamic";

const BusMap = dynamic(() => import("./Map"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">Loading Map...</div>
});

export default function DriverDashboard() {
  const [driver] = useState({
    name: "Driver 1",
    id: "DRV-2024-001",
    busNo: "BRTC 10",
    reg: "UK07PA7498",
    route: "Route 1",
    profilePic: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  });

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'sharing' | 'paused'>('idle');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const watchId = useRef<number | null>(null);

const initTracking = () => {
  if (!navigator.geolocation) return alert("GPS not supported");

  watchId.current = navigator.geolocation.watchPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLocation({ lat, lng });

      // MongoDB Update
      await fetch("/api/bus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: driver.busNo,   // DHK-102
          lat,
          lng,
        }),
      });
    },
    (err) => console.error("GPS Error:", err),
    { enableHighAccuracy: true }
  );
};


  const handleStart = () => {
    setStatus('sharing');
    setSidebarOpen(false);
    initTracking();
  };

  const handlePause = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('sharing');
    initTracking();
  };

  const handleStop = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setStatus('idle');
    setLocation(null);
    setSidebarOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans">
      
      {/* SIDEBAR - CampusConnect Style */}
      <aside className={`
        fixed inset-y-0 left-0 z-1002 w-72 
        bg-linear-to-b from-[#EF4444] to-[#8B0000] 
        text-white p-6 transition-transform duration-500 ease-in-out shadow-2xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Close Button (X) at Upper Right Corner */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-light transition-colors"
        >
          ✕
        </button>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="mb-8 border-b border-white/20 pb-6">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">CampusConnect</h1>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 shadow-xl">
                <img src={driver.profilePic} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
            </div>
            <h2 className="mt-4 text-xl font-bold uppercase tracking-tight leading-tight">{driver.name}</h2>
            <p className="text-red-200 text-[10px] font-medium uppercase tracking-widest mt-1 opacity-80">ID: {driver.id}</p>
          </div>

          {/* Info Section - No Scrollbar */}
          <div className="flex-1 space-y-4 overflow-hidden">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">Bus Unit</span>
              <p className="text-base font-bold">{driver.busNo}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">Route</span>
              <p className="text-sm font-semibold leading-tight">{driver.route}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">Status</span>
              <p className="text-xs font-bold uppercase tracking-widest text-green-300">{status}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="relative flex-1 h-full w-full">
        
        {/* Floating Menu Toggle */}
        {!sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="fixed top-6 left-6 z-1001 bg-white text-red-600 p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all border border-red-100"
          >
            <span className="text-xl">☰</span>
          </button>
        )}

{/* Map Display */}
<div className="absolute inset-0 z-0">
  {location ? (
    <BusMap location={location} />
  ) : (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
      {/* Location Pointer Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
        <div className="relative p-8 rounded-full bg-white shadow-2xl flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24" 
            className="w-16 h-16 text-red-600 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
      
<h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
  Ready to Start Shift
</h3>
<p className="text-slate-500 font-medium -mt-1">Press the green button to begin tracking</p>
    </div>
  )}
</div>

        {/* FLOATING ACTION BUTTONS */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-1001 w-[92%] max-w-md">
          {status === 'idle' ? (
            <button onClick={handleStart} className="w-full bg-green-600 text-white py-5 rounded-4xl font-black uppercase tracking-widest shadow-2xl">Start Shift</button>
          ) : (
            <>
              {status === 'paused' ? (
                <button onClick={handleResume} className="flex-1 bg-amber-500 text-white py-5 rounded-4xl font-black uppercase tracking-widest shadow-xl animate-pulse">Resume</button>
              ) : (
                <button onClick={handlePause} className="flex-1 bg-white text-amber-600 border-2 border-amber-500 py-5 rounded-4xl font-black uppercase tracking-widest shadow-xl">Pause</button>
              )}
              <button onClick={handleStop} className="flex-1 bg-red-600 text-white py-5 rounded-4xl font-black uppercase tracking-widest shadow-xl">End Shift</button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}