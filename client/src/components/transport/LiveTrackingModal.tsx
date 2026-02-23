'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bus,
  Gauge,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  ExternalLink,
  Compass,
  Radio,
} from 'lucide-react';
import { socket } from '@/lib/socket';
import { calculateDistance } from '@/utils/locationHelpers';

/* ── Lazy-load the Leaflet map (SSR-incompatible) ── */
const LiveTrackingMap = dynamic(() => import('./LiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-black/20 rounded-2xl">
      <div className="animate-spin w-6 h-6 border-2 border-brick-500 border-t-transparent rounded-full" />
    </div>
  ),
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
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

export interface TrackingTarget {
  busId: string;
  busName?: string;
  routeId: string;
  lat: number;
  lng: number;
  speed: number;
  status: 'running' | 'paused' | 'stopped';
  time: string;
}

interface LiveTrackingModalProps {
  bus: TrackingTarget;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */
const STATUS = {
  running: {
    label: 'Running',
    dot: 'bg-green-500',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  paused: {
    label: 'Paused',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  stopped: {
    label: 'Stopped',
    dot: 'bg-red-500',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({ bus: initial, onClose }) => {
  const [bus, setBus] = useState<TrackingTarget>(initial);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [freshness, setFreshness] = useState<'live' | 'recent' | 'stale'>('live');
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Resolve portal target on mount (client-only) */
  useEffect(() => {
    setPortalTarget(document.getElementById('modal-root') || document.body);
  }, []);

  /* 1. Watch user position continuously */
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const wid = navigator.geolocation.watchPosition(
      (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    watchIdRef.current = wid;
    return () => navigator.geolocation.clearWatch(wid);
  }, []);

  /* 2. Socket — listen for location updates for THIS bus */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleLocation = (data: BusLocationData) => {
      if (data.busId !== initial.busId) return;
      setBus((prev) => ({
        ...prev,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        status: data.status,
        time: data.time,
        busName: data.busName || prev.busName,
      }));
    };

    const handleStatus = (data: { busId: string; status: 'running' | 'paused' | 'stopped' }) => {
      if (data.busId !== initial.busId) return;
      setBus((prev) => ({ ...prev, status: data.status }));
    };

    socket.on('receiveLocation', handleLocation);
    socket.on('receiveBusStatus', handleStatus);
    return () => {
      socket.off('receiveLocation', handleLocation);
      socket.off('receiveBusStatus', handleStatus);
    };
  }, [initial.busId]);

  /* 3. Recalculate distance + ETA */
  const recalc = useCallback(() => {
    if (!userLoc) return;
    const d = calculateDistance(userLoc[0], userLoc[1], bus.lat, bus.lng);
    setDistance(d);
    const spd = bus.speed > 5 ? bus.speed : 20;
    setEta(Math.round((d / spd) * 60));

    // freshness
    const diff = Math.floor((Date.now() - new Date(bus.time).getTime()) / 1000);
    if (diff < 30) setFreshness('live');
    else if (diff < 120) setFreshness('recent');
    else setFreshness('stale');
  }, [userLoc, bus]);

  useEffect(() => {
    recalc();
    frameRef.current = setInterval(recalc, 5000);
    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, [recalc]);

  /* 4. Google Maps deep-link */
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bus.lat},${bus.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const cfg = STATUS[bus.status] ?? STATUS.stopped;
  const displayName = bus.busName || bus.busId;

  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ zIndex: 99999 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}
          className="bg-gray-950/95 backdrop-blur-2xl w-full max-w-lg max-h-[92vh] rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-xl border ${cfg.badge}`}>
                <Bus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-black text-white leading-tight truncate">
                  {displayName}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.badge}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${bus.status === 'running' ? 'animate-pulse' : ''}`}
                    />
                    {cfg.label}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-[9px] font-black ${
                      freshness === 'live'
                        ? 'text-emerald-400'
                        : freshness === 'recent'
                          ? 'text-amber-400'
                          : 'text-gray-600'
                    }`}
                  >
                    {freshness === 'live' ? (
                      <Wifi className="w-2.5 h-2.5" />
                    ) : (
                      <WifiOff className="w-2.5 h-2.5" />
                    )}
                    {freshness === 'live' ? 'Live' : freshness === 'recent' ? 'Recent' : 'Stale'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              aria-label="Close tracking"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Map ── */}
          <div className="relative h-64 sm:h-72 shrink-0">
            <LiveTrackingMap
              busLat={bus.lat}
              busLng={bus.lng}
              busName={displayName}
              busStatus={bus.status}
              speed={bus.speed}
              userLat={userLoc?.[0]}
              userLng={userLoc?.[1]}
            />
            {/* Connection badge overlaid on map */}
            <div
              className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-xl border ${
                freshness === 'live'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/20'
              }`}
            >
              <Radio className="w-3 h-3" />
              {freshness === 'live' ? 'Live' : 'Delayed'}
            </div>
          </div>

          {/* ── Stats Strip ── */}
          <div className="grid grid-cols-4 gap-2 p-4 shrink-0">
            {/* Distance */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <MapPin className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
              <p className="text-sm font-black text-white leading-none">
                {distance != null ? distance.toFixed(1) : '—'}
              </p>
              <p className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">km</p>
            </div>

            {/* Speed */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <Gauge className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
              <p className="text-sm font-black text-white leading-none">{bus.speed || 0}</p>
              <p className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">km/h</p>
            </div>

            {/* ETA */}
            <div
              className={`border rounded-xl p-3 text-center ${
                eta != null && eta < 5
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-orange-500/10 border-orange-500/20'
              }`}
            >
              <Clock
                className={`w-3.5 h-3.5 mx-auto mb-1 ${eta != null && eta < 5 ? 'text-green-500' : 'text-orange-500'}`}
              />
              <p
                className={`text-sm font-black leading-none ${eta != null && eta < 5 ? 'text-green-400' : 'text-orange-400'}`}
              >
                {eta == null ? '—' : eta < 1 ? 'Now' : `${eta}m`}
              </p>
              <p className="text-[8px] text-gray-600 font-bold uppercase mt-0.5">eta</p>
            </div>

            {/* Heading / Coords */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <Compass className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
              <p className="text-[10px] font-black text-white leading-tight">
                {bus.lat.toFixed(3)}°
              </p>
              <p className="text-[10px] font-black text-white leading-tight">
                {bus.lng.toFixed(3)}°
              </p>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 px-4 pb-4 shrink-0">
            <button
              onClick={openGoogleMaps}
              className="flex-1 flex items-center justify-center gap-2 bg-brick-600/30 hover:bg-brick-600/50 border border-brick-500/30 text-brick-300 hover:text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Navigate in Maps
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    portalTarget
  );
};

export default LiveTrackingModal;
