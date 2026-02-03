'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const StudentBusMap = dynamic(() => import('./Maap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">
      Loading Map...
    </div>
  ),
});

export default function StudentDashboard() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    socket.on('receiveLocation', (data) => {
      setLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socket.off('receiveLocation');
    };
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      {location ? (
        <StudentBusMap location={location} />
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
            <div className="relative p-8 rounded-full bg-white shadow-2xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-red-600 fill-current">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Waiting for Bus Location
          </h3>
          <p className="text-slate-400 font-medium">Driver has not started tracking yet</p>
        </div>
      )}
    </div>
  );
}
