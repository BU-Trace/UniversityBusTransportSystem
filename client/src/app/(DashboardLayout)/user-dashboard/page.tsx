'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tracking, setTracking] = useState(false);

  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [busLocation, setBusLocation] = useState<Location | null>(null);
  const [selectedBus, setSelectedBus] = useState<string>('');

  /* ================= USER DATA ================= */
  const user = {
    name: 'Utsojet Paticor',
    id: 'CSE-22-017',
    department: 'Computer Science & Engineering',
    image: '/static/user-avatar.jpg', // optional
  };

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

        setTracking(true);      // ✅ SHOW MAP
        setSidebarOpen(false);  // ✅ HIDE SIDEBAR
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
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">

      {/* ================= SIDEBAR ================= */}
      {!tracking && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-80
          bg-linear-to-b from-[#EF4444] to-[#8B0000]
          text-white p-6 transition-transform duration-500
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-2xl"
          >
            ✕
          </button>

          {/* Logo */}
          <div className="flex items-center mb-10">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
              <Image
                src="/static/BUTracelogo-modified.png"
                alt="Logo"
                width={40}
                height={40}
              />
            </div>
            <span className="ml-3 font-bold text-xl uppercase">BUTrace</span>
          </div>

          {/* USER PROFILE */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 shadow-xl flex items-center justify-center">
              {user.image ? (
                <Image src={user.image} alt="User" width={96} height={96} />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>

            <h2 className="mt-4 text-lg font-black uppercase text-center">
              {user.name}
            </h2>

            <p className="text-xs text-red-200 text-center mt-1">
              {user.department}
            </p>

            <p className="text-[10px] uppercase tracking-widest text-red-300 mt-1">
              ID: {user.id}
            </p>
          </div>

          {/* BUS SELECT */}
          <div className="space-y-4">
            <label className="text-xs uppercase tracking-widest text-red-200 font-black">
              Select Current Bus
            </label>

            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full p-3 rounded-xl bg-white text-slate-800 font-bold outline-none"
            >
              <option value="">-- Choose a Bus --</option>
              {availableBuses.map((bus) => (
                <option key={bus.busNo} value={bus.busNo}>
                  {bus.busNo} • {bus.route}
                </option>
              ))}
            </select>
          </div>
        </aside>
      )}

      {/* ================= MAIN ================= */}
      <main className="relative flex-1">

        {/* Sidebar toggle */}
        {!tracking && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-6 left-6 z-40 bg-white text-red-600 p-4 rounded-xl shadow-xl"
          >
            ☰
          </button>
        )}

        {/* ================= CENTER LOCATION ANIMATION ================= */}
        {!tracking && (
          <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></div>
              <div className="relative w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-red-600 fill-current"
                >
                  <path d="M12 2C8.13 2 5.13 5.13 5.13 9c0 5.25 6.87 13 6.87 13s6.87-7.75 6.87-13c0-3.87-3.13-7-6.87-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ================= MAP ================= */}
        {tracking && (
          <div className="absolute inset-0 z-0">
            <UserMap
              userLocation={userLocation}
              busLocation={busLocation}
            />
          </div>
        )}

        {/* ================= TRACK BUS BUTTON ================= */}
        {!tracking && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
            <button
              onClick={handleTrackBus}
              className="w-full bg-red-600 text-white py-5 rounded-4xl
              font-black uppercase tracking-widest shadow-2xl
              active:scale-95 transition-transform"
            >
              Track Bus
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
