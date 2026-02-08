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
        prevBuses.map(b => b.busId === statusData.busId ? { ...b, status: statusData.status } : b)
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
      className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-1 border-t-4 border-red-600 mb-10 relative overflow-hidden"
    >
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center flex justify-center items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          Live Nearest Buses
        </h2>

        {/* Loading Spinner */}
        {loading && !userLocation && (
           <div className="flex justify-center py-8">
             <Loader2 className="animate-spin text-red-600" />
           </div>
        )}

        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-red-600 to-red-800 text-white text-sm uppercase">
                <th className="py-3 px-4 text-left">Bus ID / Route</th>
                <th className="py-3 px-4 text-left">Distance</th>
                <th className="py-3 px-4 text-left">Speed</th>
                <th className="py-3 px-4 text-left">ETA</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <AnimatePresence>
              {sortedBuses.map((bus) => (
                <motion.tr
                  key={bus.busId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-gray-50 hover:bg-red-50/20"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${bus.status === 'running' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Bus className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-700">{bus.busId}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-600">
                    {bus.distance.toFixed(2)} km
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {bus.speed || 0} km/h
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${bus.eta < 5 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {bus.formattedEta}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition flex items-center gap-1 ml-auto">
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
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Bus className={`w-5 h-5 ${bus.status === 'running' ? 'text-green-600' : 'text-red-500'}`} />
                  <div>
                    <h3 className="font-bold text-gray-800">{bus.busId}</h3>
                    <p className="text-[10px] text-gray-500 uppercase">{bus.status}</p>
                  </div>
                </div>
                <button className="bg-red-100 text-red-600 p-2 rounded-lg">
                  <Navigation className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-[10px] text-gray-400">DIST</p>
                  <p className="font-bold text-gray-700">{bus.distance.toFixed(1)} km</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-[10px] text-gray-400">SPEED</p>
                  <p className="font-bold text-gray-700">{bus.speed || 0}</p>
                </div>
                <div className={`p-2 rounded-lg ${bus.eta < 5 ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <p className="text-[10px] text-gray-400">ETA</p>
                  <p className={`font-bold ${bus.eta < 5 ? 'text-green-600' : 'text-orange-600'}`}>{bus.eta} m</p>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sortedBuses.length === 0 && !loading && (
          <div className="text-center py-6 text-gray-500 text-sm">
            No buses are currently active.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveBusSection;