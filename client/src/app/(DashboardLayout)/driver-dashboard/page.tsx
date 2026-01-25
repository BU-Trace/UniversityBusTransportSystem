'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import api from '@/lib/axios';

const BusMap = dynamic(() => import('./Map'), { ssr: false });

type Status = 'idle' | 'sharing' | 'paused';

interface Bus {
  busNo: string;
  reg: string;
  route: string;
}

export default function DriverDashboard() {
  const [driver] = useState({
    name: 'Driver1',
    id: 'DRV-2026-007',
    profilePic: '/static/driver-photo.jpg',
  });

  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const watchId = useRef<number | null>(null);

  const availableBuses: Bus[] = [
    { busNo: 'BRTC-10', reg: 'DHK-11-2233', route: 'Route-1' },
    { busNo: 'BRTC-11', reg: 'DHK-22-8899', route: 'Route-2' },
    { busNo: 'BRTC-12', reg: 'DHK-55-4455', route: 'Route-3' },
  ];

  // INIT GPS TRACKING
  const initTracking = () => {
    if (!navigator.geolocation) return alert('GPS not supported');

    let lastSent = 0;

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - lastSent < 10000) return;
        lastSent = now;

        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });

        try {
          await api.post('/location', {
            bus: selectedBus?.busNo,
            latitude: lat,
            longitude: lng,
            capturedAt: new Date(),
          });
        } catch {
          console.log('Saved locally');
        }
      },
      console.error,
      { enableHighAccuracy: true }
    );
  };

  // BUS SELECT
  const handleSelectBus = async (bus: Bus) => {
    setSelectedBus(bus);

    try {
      await api.post('/assign-bus', {
        driverId: driver.id,
        busId: bus.busNo,
      });
    } catch { }
  };

  // CONTROLS
  const handleStart = () => {
    if (!selectedBus) return alert('Select bus first');
    setStatus('sharing');
    initTracking();
  };

  const handlePause = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
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
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-red-600 to-red-900 
        text-white p-6 shadow-2xl transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-2xl text-white/80 hover:text-white"
        >
          ✕
        </button>

        {/* DRIVER PROFILE */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/40 relative">
            <Image src={driver.profilePic} alt="Driver" fill className="object-cover" />
          </div>

          <h2 className="mt-3 text-lg font-bold uppercase">{driver.name}</h2>
          <p className="text-xs opacity-80">{driver.id}</p>
        </div>

        {/* INFO */}
        <div className="space-y-4">

          <div className="bg-white/10 p-4 rounded-xl">
            <p className="text-xs uppercase text-red-200">Selected Bus</p>
            <p className="font-bold text-lg">
              {selectedBus?.busNo || 'Not Selected'}
            </p>
            <p className="text-xs opacity-70">{selectedBus?.reg}</p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl">
            <p className="text-xs uppercase text-red-200">Route</p>
            <p className="font-semibold">
              {selectedBus?.route || 'Not Assigned'}
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl">
            <p className="text-xs uppercase text-red-200">Duty Status</p>
            <p className="uppercase font-bold text-green-300">{status}</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 relative">

        {/* OPEN SIDEBAR BUTTON */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-5 left-5 z-40 bg-white p-3 rounded-xl shadow-lg hover:scale-105"
          >
            ☰
          </button>
        )}

        {/* BUS SELECTION UI */}
        {!selectedBus && (
          <div className="absolute top-6 right-6 bg-white p-6 rounded-2xl shadow-2xl w-[360px] z-30">
            <h3 className="font-bold mb-4 text-lg">Select Your Bus</h3>

            <div className="space-y-3">
              {availableBuses.map((bus) => (
                <button
                  key={bus.busNo}
                  onClick={() => handleSelectBus(bus)}
                  className="flex justify-between items-center w-full p-4 border rounded-xl hover:bg-red-50 transition group"
                >
                  <div className="text-left">
                    <p className="font-bold text-base">{bus.busNo}</p>
                    <p className="text-xs text-gray-500">{bus.route}</p>
                  </div>

                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Available
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAP */}
        <div className="absolute inset-0">
          {location ? (
            <BusMap location={location} />
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-gray-500 text-lg">
              📍 Waiting for journey start
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-3 w-[92%] max-w-md z-40">

          {status === 'idle' ? (
            <button
              onClick={handleStart}
              disabled={!selectedBus}
              className={`w-full py-5 rounded-xl font-bold uppercase shadow-xl transition
              ${selectedBus ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-white cursor-not-allowed'}`}
            >
              Start Journey
            </button>
          ) : (
            <>
              <button
                onClick={status === 'paused' ? handleResume : handlePause}
                className="flex-1 py-5 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600"
              >
                {status === 'paused' ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={handleStop}
                className="flex-1 py-5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700"
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
