'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Navigation, AlertCircle, Loader2 } from 'lucide-react';
import { socket } from '@/lib/socket';
import { calculateDistance } from '@/utils/locationHelpers';

// --- Types ---
interface BusLocationData {
  busId: string;
  routeId: string;
  lat: number;
  lng: number;
  speed: number;
  status: 'running' | 'paused' | 'stopped';
  time: string;
}

// ✅ Fix: Added explicit interface for status updates
interface BusStatusData {
  busId: string;
  status: 'running' | 'paused' | 'stopped';
}

interface ProcessedBus extends BusLocationData {
  distance: number; // in km
  eta: number; // in minutes
  formattedEta: string;
}

const LiveBusSection = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [buses, setBuses] = useState<BusLocationData[]>([]);
  const [sortedBuses, setSortedBuses] = useState<ProcessedBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // 1. Get User Location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Location Error:', error);
          setPermissionDenied(true);
          setLoading(false);
        }
      );
    } else {
      setPermissionDenied(true);
      setLoading(false);
    }
  }, []);

  // 2. Socket Connection & Data Handling
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for live location updates
    socket.on('receiveLocation', (newBusData: BusLocationData) => {
      setBuses((prevBuses) => {
        const index = prevBuses.findIndex((b) => b.busId === newBusData.busId);

        if (index !== -1) {
          const updatedBuses = [...prevBuses];
          updatedBuses[index] = newBusData;
          return updatedBuses;
        } else {
          return [...prevBuses, newBusData];
        }
      });
    });

    // ✅ Fix: Replaced 'any' with 'BusStatusData'
    socket.on('receiveBusStatus', (statusData: BusStatusData) => {
      setBuses((prevBuses) =>
        prevBuses.map((b) =>
          b.busId === statusData.busId ? { ...b, status: statusData.status } : b
        )
      );
    });

    return () => {
      socket.off('receiveLocation');
      socket.off('receiveBusStatus');
    };
  }, []);

  // 3. Calculation & Sorting
  useEffect(() => {
    if (!userLocation || buses.length === 0) return;

    const processed = buses.map((bus) => {
      const dist = calculateDistance(userLocation[0], userLocation[1], bus.lat, bus.lng);

      // Calculate ETA (Assume min speed 20km/h if traffic/slow)
      const effectiveSpeed = bus.speed && bus.speed > 5 ? bus.speed : 20;
      const etaMinutes = Math.round((dist / effectiveSpeed) * 60);

      return {
        ...bus,
        distance: dist,
        eta: etaMinutes,
        formattedEta: dist < 0.1 ? 'Arriving Now' : `${etaMinutes} mins`,
      };
    });

    // Sort: Nearest Distance first
    const sorted = processed.sort((a, b) => a.distance - b.distance);

    setSortedBuses(sorted);
  }, [buses, userLocation]);

  // --- UI Render ---

  if (permissionDenied) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mb-8 shadow-sm">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="font-bold text-red-700">Location Access Needed</h3>
        <p className="text-sm text-gray-600">Please enable location to see nearest buses.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-1 border border-white/20 mb-10 relative overflow-hidden shadow-white/5"
    >
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-white mb-6 text-center flex justify-center items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brick-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brick-500"></span>
          </span>
          Live Nearest Buses
        </h2>

        {/* Loading Spinner */}
        {loading && !userLocation && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-brick-500" />
          </div>
        )}

        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-gray-900 to-gray-800 text-gray-300 text-sm uppercase">
                <th className="py-3 px-4 text-left border-b border-white/5">Bus ID / Route</th>
                <th className="py-3 px-4 text-left border-b border-white/5">Distance</th>
                <th className="py-3 px-4 text-left border-b border-white/5">Speed</th>
                <th className="py-3 px-4 text-left border-b border-white/5">ETA</th>
                <th className="py-3 px-4 text-right border-b border-white/5">Action</th>
              </tr>
            </thead>
            <tbody className="bg-transparent">
              <AnimatePresence>
                {sortedBuses.map((bus) => (
                  <motion.tr
                    key={bus.busId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-full ${bus.status === 'running' ? 'bg-green-500/10 text-green-400' : 'bg-brick-500/10 text-brick-400'}`}
                        >
                          <Bus className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-200">{bus.busId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-400">
                      {bus.distance.toFixed(2)} km
                    </td>
                    <td className="py-3 px-4 text-gray-400">{bus.speed || 0} km/h</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${bus.eta < 5 ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}
                      >
                        {bus.formattedEta}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="bg-brick-600/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs hover:bg-brick-600/60 transition flex items-center gap-1 ml-auto shadow-lg shadow-brick-900/40 cursor-pointer border border-white/10">
                        <Navigation className="w-3 h-3" /> Track
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW --- */}
        <div className="md:hidden flex flex-col gap-3">
          <AnimatePresence>
            {sortedBuses.map((bus) => (
              <motion.div
                key={bus.busId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-xl cursor-pointer shadow-white/5"
              >
                <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Bus
                      className={`w-5 h-5 ${bus.status === 'running' ? 'text-green-400' : 'text-brick-500'}`}
                    />
                    <div>
                      <h3 className="font-bold text-gray-200">{bus.busId}</h3>
                      <p className="text-[10px] text-gray-500 uppercase font-black">{bus.status}</p>
                    </div>
                  </div>
                  <button className="bg-white/10 backdrop-blur-md text-brick-400 p-2 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20">
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">DIST</p>
                    <p className="font-bold text-gray-200">{bus.distance.toFixed(1)} km</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">SPEED</p>
                    <p className="font-bold text-gray-200">{bus.speed || 0}</p>
                  </div>
                  <div
                    className={`p-2 rounded-lg border border-white/5 ${bus.eta < 5 ? 'bg-green-500/10' : 'bg-orange-500/10'}`}
                  >
                    <p className="text-[10px] text-gray-500 font-bold uppercase">ETA</p>
                    <p
                      className={`font-bold ${bus.eta < 5 ? 'text-green-400' : 'text-orange-400'}`}
                    >
                      {bus.eta} m
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sortedBuses.length === 0 && !loading && (
          <div className="text-center py-6 text-gray-500 text-sm font-medium">
            No buses are currently active.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveBusSection;
