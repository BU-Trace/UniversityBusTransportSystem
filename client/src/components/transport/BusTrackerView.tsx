'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus,
  Navigation,
  Gauge,
  Clock,
  MapPin,
  Radio,
  AlertCircle,
  Loader2,
  Activity,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { socket } from '@/lib/socket';
import { calculateDistance } from '@/utils/locationHelpers';
import LiveTrackingModal, { type TrackingTarget } from './LiveTrackingModal';

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
  lastSeen: string;
  freshness: 'live' | 'recent' | 'stale';
}

interface BusTrackerViewProps {
  onClose: () => void;
}

const STATUS_CONFIG = {
  running: {
    label: 'Running',
    dot: 'bg-green-500',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    bar: 'bg-green-500',
    ring: 'border-green-500/20',
  },
  paused: {
    label: 'Paused',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
    ring: 'border-amber-500/20',
  },
  stopped: {
    label: 'Stopped',
    dot: 'bg-red-500',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    bar: 'bg-red-500',
    ring: 'border-red-500/20',
  },
};

const FRESHNESS_STYLE = {
  live: 'text-emerald-400',
  recent: 'text-amber-400',
  stale: 'text-gray-600',
};

const getTimeSince = (isoTime: string): { label: string; freshness: ProcessedBus['freshness'] } => {
  const diff = Math.floor((Date.now() - new Date(isoTime).getTime()) / 1000);
  if (diff < 30) return { label: `${diff}s ago`, freshness: 'live' };
  if (diff < 120) return { label: `${Math.floor(diff / 60)}m ago`, freshness: 'recent' };
  return { label: `${Math.floor(diff / 60)}m ago`, freshness: 'stale' };
};

// Mini 5-segment speed bar
const SpeedBar = ({ speed }: { speed: number }) => {
  const filled = Math.round((Math.min(speed, 60) / 60) * 5);
  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 rounded-xs transition-all duration-500 ${
            i < filled
              ? speed > 40
                ? 'bg-red-400 h-3'
                : speed > 20
                  ? 'bg-amber-400 h-2.5'
                  : 'bg-green-400 h-2'
              : 'bg-white/10 h-1.5'
          }`}
        />
      ))}
    </div>
  );
};

const BusDetailCard = ({
  bus,
  index,
  onTrack,
}: {
  bus: ProcessedBus;
  index: number;
  onTrack: (bus: ProcessedBus) => void;
}) => {
  const cfg = STATUS_CONFIG[bus.status] ?? STATUS_CONFIG.stopped;
  const isNear = bus.eta < 5;
  const { label: lastSeenLabel, freshness } = getTimeSince(bus.time);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.06 }}
      className={`relative bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden hover:bg-white/8 transition-all duration-300 ${cfg.ring}`}
    >
      {/* Left status accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.75 ${cfg.bar} rounded-l-2xl`} />

      <div className="pl-5 pr-4 pt-4 pb-3">
        {/* ── Row 1: ID / Name · Status badge · Last seen ── */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl border ${cfg.badge} shrink-0`}>
              <Bus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white leading-tight truncate">
                {bus.busName || bus.busId}
              </p>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">
                {bus.busId !== bus.busName ? `ID: ${bus.busId}` : 'Live Bus'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {/* Status pill */}
            <span
              className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.badge}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${bus.status === 'running' ? 'animate-pulse' : ''}`}
              />
              {cfg.label}
            </span>
            {/* Freshness */}
            <span
              className={`flex items-center gap-1 text-[9px] font-black ${FRESHNESS_STYLE[freshness]}`}
            >
              {freshness === 'live' ? (
                <Wifi className="w-2.5 h-2.5" />
              ) : (
                <WifiOff className="w-2.5 h-2.5" />
              )}
              {lastSeenLabel}
            </span>
          </div>
        </div>

        {/* ── Row 2: 4-stat strip ── */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {/* Distance */}
          <div className="bg-black/25 rounded-xl p-2.5 border border-white/5 flex flex-col items-center text-center">
            <MapPin className="w-3 h-3 text-gray-500 mb-0.5" />
            <p className="text-xs font-black text-white leading-none">{bus.distance.toFixed(1)}</p>
            <p className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">km</p>
          </div>

          {/* Speed */}
          <div className="bg-black/25 rounded-xl p-2.5 border border-white/5 flex flex-col items-center text-center">
            <Gauge className="w-3 h-3 text-gray-500 mb-0.5" />
            <p className="text-xs font-black text-white leading-none">{bus.speed || 0}</p>
            <p className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">km/h</p>
          </div>

          {/* ETA */}
          <div
            className={`rounded-xl p-2.5 border flex flex-col items-center text-center ${
              isNear
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-orange-500/10 border-orange-500/20'
            }`}
          >
            <Clock className={`w-3 h-3 mb-0.5 ${isNear ? 'text-green-500' : 'text-orange-500'}`} />
            <p
              className={`text-xs font-black leading-none ${isNear ? 'text-green-400' : 'text-orange-400'}`}
            >
              {bus.eta < 1 ? 'Now' : `${bus.eta}m`}
            </p>
            <p className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">eta</p>
          </div>

          {/* Speed bar */}
          <div className="bg-black/25 rounded-xl p-2.5 border border-white/5 flex flex-col items-center justify-center gap-1.5">
            <Activity className="w-3 h-3 text-gray-500" />
            <SpeedBar speed={bus.speed || 0} />
          </div>
        </div>

        {/* ── Row 3: Coordinates + Track button ── */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
          <span className="flex items-center gap-1 text-[9px] font-black text-gray-600 uppercase tracking-wider tabular-nums">
            <Navigation className="w-2.5 h-2.5 text-brick-700" />
            {bus.lat.toFixed(3)}°N · {bus.lng.toFixed(3)}°E
          </span>
          <button
            onClick={() => onTrack(bus)}
            className="flex items-center gap-1.5 bg-brick-600/20 hover:bg-brick-600/40 border border-brick-500/20 hover:border-brick-500/40 text-brick-300 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
          >
            <Navigation className="w-2.5 h-2.5" />
            Track
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const BusTrackerView: React.FC<BusTrackerViewProps> = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [buses, setBuses] = useState<BusLocationData[]>([]);
  const [processed, setProcessed] = useState<ProcessedBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
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
        console.warn('BusTrackerView hydration failed:', e);
      }
    })();
  }, []);

  // 1. Geolocation — run in parallel with REST hydration above
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => {
        setPermissionDenied(true);
        setLoading(false);
      },
      { timeout: 5000, maximumAge: 30000 }
    );
  }, []);

  // 2. Socket
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('receiveLocation', (data: BusLocationData) => {
      setBuses((prev) => {
        const idx = prev.findIndex((b) => b.busId === data.busId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [...prev, data];
      });
    });

    socket.on('receiveBusStatus', (data: BusStatusData) => {
      if (data.status === 'stopped') {
        // Remove stopped buses entirely
        setBuses((prev) => prev.filter((b) => b.busId !== data.busId));
      } else {
        setBuses((prev) =>
          prev.map((b) => (b.busId === data.busId ? { ...b, status: data.status } : b))
        );
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
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

  // 4. Process + sort by distance
  const processBuses = useCallback(() => {
    if (!userLocation || buses.length === 0) return;
    const result = buses.map((bus) => {
      const dist = calculateDistance(userLocation[0], userLocation[1], bus.lat, bus.lng);
      const spd = bus.speed && bus.speed > 5 ? bus.speed : 20;
      const eta = Math.round((dist / spd) * 60);
      const { freshness } = getTimeSince(bus.time);
      return {
        ...bus,
        distance: dist,
        eta,
        formattedEta: `${eta} mins`,
        lastSeen: bus.time,
        freshness,
      };
    });
    setProcessed(result.sort((a, b) => a.distance - b.distance));
  }, [buses, userLocation]);

  useEffect(() => {
    processBuses();
    const iv = setInterval(processBuses, 15000);
    return () => clearInterval(iv);
  }, [processBuses]);

  // ── Render ──
  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="font-black text-white text-sm uppercase tracking-widest">
          Location Required
        </h3>
        <p className="text-xs text-gray-500 max-w-xs">
          Enable browser location to calculate distance and ETA to nearby buses.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brick-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brick-500" />
          </span>
          <span className="text-[11px] font-black text-white uppercase tracking-widest">
            Live Buses
          </span>
          {processed.length > 0 && (
            <span className="text-[9px] font-black text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {processed.length} active
            </span>
          )}
        </div>
        <div
          className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider ${
            socketConnected ? 'text-emerald-500' : 'text-red-500'
          }`}
        >
          <Radio className="w-3 h-3" />
          {socketConnected ? 'Real-time' : 'Reconnecting…'}
        </div>
      </div>

      {/* Loading — only show spinner when no data yet */}
      {loading && buses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="animate-spin text-brick-500 w-7 h-7" />
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Getting location…
          </p>
        </div>
      )}

      {/* Subtle locating bar — buses loaded, geoloc still pending */}
      {loading && buses.length > 0 && (
        <div className="flex items-center gap-2 px-0.5 py-1">
          <Loader2 className="animate-spin text-gray-600 w-3 h-3 shrink-0" />
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
            Calculating distances…
          </p>
        </div>
      )}

      {/* Cards — show whenever we have data */}
      {processed.length > 0 ? (
        <AnimatePresence mode="popLayout">
          {processed.map((bus, i) => (
            <BusDetailCard
              key={bus.busId}
              bus={bus}
              index={i}
              onTrack={(b) => setTrackingBus(b)}
            />
          ))}
        </AnimatePresence>
      ) : (
        !loading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-linear-to-br from-white/4 to-white/1 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
          >
            {/* Decorative rings */}
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

export default BusTrackerView;
