'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Navigation, AlertCircle, Loader2, Gauge, Radio } from 'lucide-react';
import { socket } from '@/lib/socket';
import { calculateDistance } from '@/utils/locationHelpers';
import LiveTrackingModal, { type TrackingTarget } from '@/components/transport/LiveTrackingModal';

// --- Types ---
interface BusLocationData {
  busId: string;
  busName?: string;
  routeId: string;
  lat: number;
  lng: number;
  speed: number;
  status: 'running' | 'paused' | 'stopped';
  time: string;
}

interface BusStatusData {
  busId: string;
  status: 'running' | 'paused' | 'stopped';
}

interface ProcessedBus extends BusLocationData {
  distance: number;
  eta: number;
  formattedEta: string;
}

const STATUS_STYLES: Record<string, string> = {
  running: 'bg-green-500/15 text-green-400 border-green-500/20',
  paused: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  stopped: 'bg-brick-500/15 text-brick-400 border-brick-500/20',
};

const BusCard = ({ bus, onTrack }: { bus: ProcessedBus; onTrack: (bus: ProcessedBus) => void }) => {
  const isNear = bus.eta < 5;
  const statusStyle = STATUS_STYLES[bus.status] ?? STATUS_STYLES.stopped;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${statusStyle}`}>
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">{bus.busName || bus.busId}</p>
            <span
              className={`inline-block mt-1 text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full border ${statusStyle}`}
            >
              {bus.status}
            </span>
          </div>
        </div>
        <button
          aria-label="Track bus"
          onClick={(e) => {
            e.stopPropagation();
            onTrack(bus);
          }}
          className="flex items-center gap-1.5 bg-brick-600/30 hover:bg-brick-600/50 border border-brick-500/30 text-brick-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
        >
          <Navigation className="w-3 h-3" />
          <span className="hidden sm:inline">Track</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Dist</p>
          <p className="text-sm font-black text-gray-200 leading-none">
            {bus.distance.toFixed(1)}
            <span className="text-[9px] text-gray-500 font-medium ml-0.5">km</span>
          </p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
          <div className="flex justify-center mb-1">
            <Gauge className="w-3 h-3 text-gray-500" />
          </div>
          <p className="text-sm font-black text-gray-200 leading-none">
            {bus.speed || 0}
            <span className="text-[9px] text-gray-500 font-medium ml-0.5">km/h</span>
          </p>
        </div>

        <div
          className={`border rounded-xl p-2.5 text-center ${
            isNear ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'
          }`}
        >
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">ETA</p>
          <p
            className={`text-sm font-black leading-none ${isNear ? 'text-green-400' : 'text-orange-400'}`}
          >
            {bus.eta < 1 ? 'Now' : `${bus.eta}m`}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const LiveBusSection = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [buses, setBuses] = useState<BusLocationData[]>([]);
  const [sortedBuses, setSortedBuses] = useState<ProcessedBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [trackingBus, setTrackingBus] = useState<TrackingTarget | null>(null);

  // 0. Hydrate from REST on mount — shows current active buses immediately
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/location`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const freshCutoff = Date.now() - 2 * 60 * 1000; // only buses active in last 2 min
          interface LocationRecord {
            bus?: { bus_id?: string; _id?: string; name?: string } | string;
            latitude?: number;
            longitude?: number;
            status?: string;
            route?: string;
            capturedAt?: string;
            updatedAt?: string;
          }
          const hydrated: BusLocationData[] = (json.data as LocationRecord[])
            .filter(
              (loc) =>
                loc.bus &&
                loc.latitude != null &&
                loc.longitude != null &&
                loc.status === 'running' &&
                new Date(loc.capturedAt || loc.updatedAt || 0).getTime() > freshCutoff
            )
            .map((loc) => {
              const bus = typeof loc.bus === 'object' ? loc.bus : undefined;
              return {
                busId: bus?.bus_id ?? bus?._id ?? String(loc.bus),
                busName: bus?.name ?? undefined,
                routeId: loc.route ? String(loc.route) : '',
                lat: loc.latitude!,
                lng: loc.longitude!,
                speed: 0,
                status: (loc.status as BusLocationData['status']) ?? 'running',
                time: loc.capturedAt ?? loc.updatedAt ?? new Date().toISOString(),
              };
            });
          setBuses(hydrated);
        }
      } catch (e) {
        console.warn('LiveBusSection hydration failed:', e);
      }
    })();
  }, []);

  // 1. Get User Location — run in parallel with REST hydration above
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
      },
      () => {
        setPermissionDenied(true);
        setLoading(false);
      },
      { timeout: 5000, maximumAge: 30000 }
    );
  }, []);

  // 2. Socket Connection & Data Handling
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on('receiveLocation', (newBusData: BusLocationData) => {
      setBuses((prev) => {
        const idx = prev.findIndex((b) => b.busId === newBusData.busId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = newBusData;
          return next;
        }
        return [...prev, newBusData];
      });
    });

    socket.on('receiveBusStatus', (statusData: BusStatusData) => {
      if (statusData.status === 'stopped') {
        // Remove stopped buses entirely
        setBuses((prev) => prev.filter((b) => b.busId !== statusData.busId));
      } else {
        setBuses((prev) =>
          prev.map((b) =>
            b.busId === statusData.busId ? { ...b, status: statusData.status } : b
          )
        );
      }
    });

    return () => {
      socket.off('receiveLocation');
      socket.off('receiveBusStatus');
    };
  }, []);

  // 3. Auto-purge stale buses (no update for >2 min = offline)
  useEffect(() => {
    const iv = setInterval(() => {
      const cutoff = Date.now() - 2 * 60 * 1000;
      setBuses((prev) => prev.filter((b) => new Date(b.time).getTime() > cutoff));
    }, 30_000);
    return () => clearInterval(iv);
  }, []);

  // 4. Calculate distances + sort nearest first
  useEffect(() => {
    if (!userLocation || buses.length === 0) return;

    const processed = buses.map((bus) => {
      const dist = calculateDistance(userLocation[0], userLocation[1], bus.lat, bus.lng);
      const effectiveSpeed = bus.speed && bus.speed > 5 ? bus.speed : 20;
      const etaMinutes = Math.round((dist / effectiveSpeed) * 60);
      return {
        ...bus,
        distance: dist,
        eta: etaMinutes,
        formattedEta: dist < 0.1 ? 'Arriving Now' : `${etaMinutes} mins`,
      };
    });

    setSortedBuses(processed.sort((a, b) => a.distance - b.distance));
  }, [buses, userLocation]);

  // --- Permission denied ---
  if (permissionDenied) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center mb-6">
        <AlertCircle className="w-7 h-7 text-amber-400 mx-auto mb-2" />
        <h3 className="font-bold text-white text-sm">Location Access Needed</h3>
        <p className="text-xs text-gray-400 mt-1">
          Enable location in your browser to see nearest buses.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brick-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brick-500" />
          </span>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">
            Live Nearest Buses
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          <Radio className="w-3 h-3 text-brick-400" />
          Real-time
        </div>
      </div>

      {/* Loading — only full spinner when no data at all */}
      {loading && buses.length === 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="animate-spin text-brick-500 w-7 h-7" />
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
            Getting your location…
          </p>
        </div>
      )}

      {/* Subtle locating bar — buses loaded, geoloc still pending */}
      {loading && buses.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="animate-spin text-gray-600 w-3 h-3 shrink-0" />
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
            Calculating distances…
          </p>
        </div>
      )}

      {/* Cards grid */}
      {sortedBuses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence>
            {sortedBuses.map((bus) => (
              <BusCard key={bus.busId} bus={bus} onTrack={(b) => setTrackingBus(b)} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-linear-to-br from-white/4 to-white/1 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
          >
            {/* Decorative ring */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/5 opacity-40" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-brick-500/10 opacity-30" />

            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <Bus className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest">
                  No Active Buses
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Buses will appear here in real-time once a driver starts their duty.
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-gray-600 uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-500 opacity-50" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gray-600" />
                </span>
                Listening for buses…
              </div>
            </div>
          </motion.div>
        )
      )}
      {/* Live Tracking Modal */}
      {trackingBus && <LiveTrackingModal bus={trackingBus} onClose={() => setTrackingBus(null)} />}
    </div>
  );
};

export default LiveBusSection;
