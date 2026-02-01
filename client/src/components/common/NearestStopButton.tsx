'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Navigation, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useIntro } from '@/context/IntroContext';

type Direction = 'from_university' | 'to_university';

type LatLng = { lat: number; lng: number };

type RouteKey = 'nothullabad' | 'bangla_bazar' | 'notun_bazar';

type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number; // increasing order along the route direction (base order)
};

type LiveBus = {
  routeKey: RouteKey;
  direction: Direction;
  // Use one of these (prefer gps). If you only have stopIndex, you can map it too.
  position?: LatLng; // current GPS from backend
  updatedAt?: string; // optional
};

type NearestResult = {
  stop: Stop | null;
  distanceMeters: number | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * ✅ YOU MUST ALIGN THESE TWO ENDPOINTS WITH YOUR BACKEND
 * 1) stops for a route
 * 2) live bus location for route+direction
 *
 * Replace these URLs to match your existing backend.
 */
async function fetchStops(routeKey: RouteKey): Promise<Stop[]> {
  // Example idea:
  // GET /route/public/stops?routeKey=nothullabad
  const res = await fetch(`${BASE_URL}/route/public/stops?routeKey=${routeKey}`, { cache: 'no-store' });
  const json = (await res.json().catch(() => ({}))) as { data?: unknown; message?: string };
  if (!res.ok) throw new Error(json?.message || 'Failed to load stops');

  // Expecting: data: [{ id, name, lat, lng, order }]
  const arr = Array.isArray(json.data) ? json.data : [];
  return arr
    .map((x) => {
      const o = x as Partial<Stop>;
      return {
        id: String(o.id ?? ''),
        name: String(o.name ?? ''),
        lat: Number(o.lat ?? 0),
        lng: Number(o.lng ?? 0),
        order: Number(o.order ?? 0),
      };
    })
    .filter((s) => s.id && s.name && Number.isFinite(s.lat) && Number.isFinite(s.lng))
    .sort((a, b) => a.order - b.order);
}

async function fetchLiveBus(routeKey: RouteKey, direction: Direction): Promise<LiveBus | null> {
  // Example idea:
  // GET /live-location/current?routeKey=nothullabad&direction=to_university
  const res = await fetch(
    `${BASE_URL}/live-location/current?routeKey=${routeKey}&direction=${direction}`,
    { cache: 'no-store' }
  );
  const json = (await res.json().catch(() => ({}))) as { data?: unknown; message?: string };
  if (!res.ok) throw new Error(json?.message || 'Failed to load live bus');

  const d = json.data as Partial<LiveBus> | undefined;
  if (!d) return null;

  const lat = Number((d.position as Partial<LatLng> | undefined)?.lat);
  const lng = Number((d.position as Partial<LatLng> | undefined)?.lng);

  const hasPos = Number.isFinite(lat) && Number.isFinite(lng);

  return {
    routeKey,
    direction,
    position: hasPos ? { lat, lng } : undefined,
    updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : undefined,
  };
}

/** --- geo helpers --- */
function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);

  const h = sin1 * sin1 + Math.cos(lat1) * Math.cos(lat2) * sin2 * sin2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(m: number | null): string {
  if (m === null) return '—';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

/**
 * Key idea:
 * - Determine where the bus is along the stop list by finding the stop nearest to bus GPS
 * - Mark everything up to that index as "passed"
 * - From remaining stops, pick the one nearest to the user
 */
function nearestUpcomingStopForUser(params: {
  user: LatLng;
  stopsOrdered: Stop[];
  busPos?: LatLng;
}): NearestResult {
  const { user, stopsOrdered, busPos } = params;

  if (stopsOrdered.length === 0) return { stop: null, distanceMeters: null };

  // If no bus gps, just show nearest stop overall to user
  if (!busPos) {
    let best: Stop | null = null;
    let bestD = Number.POSITIVE_INFINITY;
    for (const s of stopsOrdered) {
      const d = haversineMeters(user, { lat: s.lat, lng: s.lng });
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return { stop: best, distanceMeters: Number.isFinite(bestD) ? bestD : null };
  }

  // Find "current" stop for bus as the nearest stop to bus position
  let busNearestIdx = 0;
  let busBest = Number.POSITIVE_INFINITY;
  for (let i = 0; i < stopsOrdered.length; i++) {
    const s = stopsOrdered[i];
    const d = haversineMeters(busPos, { lat: s.lat, lng: s.lng });
    if (d < busBest) {
      busBest = d;
      busNearestIdx = i;
    }
  }

  // Upcoming stops are AFTER busNearestIdx
  const upcoming = stopsOrdered.slice(Math.min(busNearestIdx + 1, stopsOrdered.length));
  if (upcoming.length === 0) return { stop: null, distanceMeters: null };

  // From upcoming, pick nearest to user
  let best: Stop | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (const s of upcoming) {
    const d = haversineMeters(user, { lat: s.lat, lng: s.lng });
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }

  return { stop: best, distanceMeters: Number.isFinite(bestD) ? bestD : null };
}

function routeTitle(routeKey: RouteKey): string {
  if (routeKey === 'nothullabad') return 'Nothullabad ⇄ University';
  if (routeKey === 'bangla_bazar') return 'Bangla Bazar ⇄ University';
  return 'Notun Bazar ⇄ University';
}

function directionLabel(d: Direction): string {
  return d === 'from_university' ? 'From University' : 'To University';
}

export default function NearestStopsButton() {
  const { isIntroActive } = useIntro();

  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const [open, setOpen] = useState(false);

  const [loc, setLoc] = useState<LatLng | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const [loadingData, setLoadingData] = useState(false);

  const [stopsByRoute, setStopsByRoute] = useState<Record<RouteKey, Stop[]>>({
    nothullabad: [],
    bangla_bazar: [],
    notun_bazar: [],
  });

  const [liveBus, setLiveBus] = useState<Record<string, LiveBus | null>>({});

  const refreshTimerRef = useRef<number | null>(null);

  const ROUTES: RouteKey[] = useMemo(
    () => ['nothullabad', 'bangla_bazar', 'notun_bazar'],
    []
  );

  const handleRipple = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id }]);
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
  };

  const askLocation = async (): Promise<LatLng> => {
    setLocLoading(true);
    try {
      if (!('geolocation' in navigator)) {
        throw new Error('Geolocation not supported in this browser.');
      }

      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 10_000,
        });
      });

      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLoc(p);
      return p;
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : 'Failed to get your location. Please allow location access.';
      toast.error(msg);
      throw e;
    } finally {
      setLocLoading(false);
    }
  };

  function orderedStopsForDirection(base: Stop[], direction: Direction): Stop[] {
    // base order should be "from university" order (0..N) OR your own consistent order.
    // If your base order is the route path "University -> City", then:
    // - from_university: use base
    // - to_university: reverse base
    const sorted = [...base].sort((a, b) => a.order - b.order);
    return direction === 'from_university' ? sorted : sorted.slice().reverse();
  }

  const loadEverything = async () => {
    setLoadingData(true);
    try {
      // 1) ensure location
      const userPos = loc ?? (await askLocation());

      // 2) load stops (once)
      const stopsPairs = await Promise.all(
        ROUTES.map(async (rk) => {
          const stops = await fetchStops(rk);
          return [rk, stops] as const;
        })
      );

      const nextStopsByRoute: Record<RouteKey, Stop[]> = {
        nothullabad: [],
        bangla_bazar: [],
        notun_bazar: [],
      };
      for (const [rk, stops] of stopsPairs) nextStopsByRoute[rk] = stops;
      setStopsByRoute(nextStopsByRoute);

      // 3) load live bus gps for each route+direction
      const livePairs = await Promise.all(
        ROUTES.flatMap((rk) => {
          const dirs: Direction[] = ['from_university', 'to_university'];
          return dirs.map(async (dir) => {
            const key = `${rk}:${dir}`;
            const b = await fetchLiveBus(rk, dir).catch(() => null);
            return [key, b] as const;
          });
        })
      );

      const nextLive: Record<string, LiveBus | null> = {};
      for (const [k, v] of livePairs) nextLive[k] = v;
      setLiveBus(nextLive);

      // (optional) show a tiny hint if live bus missing
      const missing = livePairs.filter(([, v]) => !v?.position).length;
      if (missing === livePairs.length) {
        toast.message('Live bus GPS not available now — showing nearest stops based on route only.');
      } else {
        // use userPos just to avoid lint unused
        void userPos;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load nearest stops');
    } finally {
      setLoadingData(false);
    }
  };

  // when popup opens: load data + start auto refresh
  useEffect(() => {
    if (!open) return;

    loadEverything();

    // refresh live bus + recompute every 10s
    refreshTimerRef.current = window.setInterval(async () => {
      try {
        const userPos = loc;
        if (!userPos) return;

        // Only refresh live bus (stops don’t change often)
        const pairs = await Promise.all(
          ROUTES.flatMap((rk) => {
            const dirs: Direction[] = ['from_university', 'to_university'];
            return dirs.map(async (dir) => {
              const key = `${rk}:${dir}`;
              const b = await fetchLiveBus(rk, dir).catch(() => null);
              return [key, b] as const;
            });
          })
        );

        setLiveBus((prev) => {
          const next = { ...prev };
          for (const [k, v] of pairs) next[k] = v;
          return next;
        });
      } catch {
        // silent refresh
      }
    }, 10_000);

    return () => {
      if (refreshTimerRef.current) window.clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const computed = useMemo(() => {
    if (!loc) return null;

    const result: Record<RouteKey, Record<Direction, NearestResult>> = {
      nothullabad: { from_university: { stop: null, distanceMeters: null }, to_university: { stop: null, distanceMeters: null } },
      bangla_bazar: { from_university: { stop: null, distanceMeters: null }, to_university: { stop: null, distanceMeters: null } },
      notun_bazar: { from_university: { stop: null, distanceMeters: null }, to_university: { stop: null, distanceMeters: null } },
    };

    for (const rk of ROUTES) {
      const baseStops = stopsByRoute[rk] || [];

      (['from_university', 'to_university'] as Direction[]).forEach((dir) => {
        const ordered = orderedStopsForDirection(baseStops, dir);
        const key = `${rk}:${dir}`;
        const busPos = liveBus[key]?.position;

        result[rk][dir] = nearestUpcomingStopForUser({
          user: loc,
          stopsOrdered: ordered,
          busPos,
        });
      });
    }

    return result;
  }, [ROUTES, liveBus, loc, stopsByRoute]);

  if (isIntroActive) return null;

  return (
    <AnimatePresence>
      {!isIntroActive && (
        <>
          {/* Floating Button */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="fixed bottom-28 left-8 z-[1000]"
          >
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-red-600/40 blur-3xl"
            />
            <motion.div
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
              className="absolute inset-0 rounded-full blur-lg opacity-40 bg-gradient-to-r from-[#9b111e] via-[#b91c1c] to-[#9b111e]"
            />

            <motion.button
              onClick={async () => {
                handleRipple();
                setOpen(true);
                if (!loc) {
                  try {
                    await askLocation();
                  } catch {
                    // user denied location
                  }
                }
              }}
              whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-[#9b111e] to-[#b91c1c] text-white hover:shadow-[#b91c1c]/60 overflow-hidden"
              aria-label="Nearest Stops"
              title="Nearest Stops"
            >
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-white/40"
                />
              ))}

              <motion.div
                animate={{ y: [0, -2, 0, 2, 0], rotate: [0, 3, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', type: 'tween' }}
                className="text-2xl relative z-10"
              >
                <Navigation />
              </motion.div>

              <div className="absolute inset-0 overflow-hidden rounded-full">
                <svg
                  className="absolute bottom-0 left-0 w-full h-full opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  viewBox="0 0 1200 120"
                >
                  <path
                    d="M321.39 56.44C186.45 35.59 79.15 66.6 0 93.68V0h1200v27.35c-110.46 41.42-241.55 73.24-378.61 54.09C643.06 62.7 456.33 77.29 321.39 56.44z"
                    fill="url(#waveGradientNearest)"
                  />
                  <defs>
                    <linearGradient id="waveGradientNearest" x1="0" y1="0" x2="1200" y2="0">
                      <stop offset="0%" stopColor="#ffffff44" />
                      <stop offset="100%" stopColor="#ffffff00" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.button>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: -10 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-20 bottom-5 bg-white text-[#9b111e] font-semibold text-sm px-3 py-1 rounded-full shadow-md border border-[#b91c1c]/30 backdrop-blur-sm"
            >
              Nearest Stops
            </motion.span>
          </motion.div>

          {/* Popup */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1100] p-4"
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) setOpen(false);
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', stiffness: 120 }}
                  className="relative w-full max-w-5xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-t-4 border-red-700 overflow-hidden"
                >
                  {/* header */}
                  <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-white/70">
                    <div>
                      <h2 className="text-2xl font-extrabold text-red-800 flex items-center gap-2">
                        <MapPin className="w-6 h-6" />
                        Nearest Stops
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Shows the nearest upcoming stop for each route (not already passed by the bus).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await loadEverything();
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 font-black text-sm flex items-center gap-2"
                        disabled={loadingData || locLoading}
                      >
                        <RefreshCw size={16} className={loadingData ? 'animate-spin' : ''} />
                        Refresh
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label="Close"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* body */}
                  <div className="p-6">
                    {locLoading ? (
                      <div className="text-center py-10 text-gray-600 font-bold">
                        Getting your location...
                      </div>
                    ) : !loc ? (
                      <div className="text-center py-10">
                        <div className="text-gray-700 font-bold">Location is required</div>
                        <p className="text-sm text-gray-500 mt-2">
                          Please allow location access to see nearest upcoming stops.
                        </p>
                        <button
                          type="button"
                          onClick={askLocation}
                          className="mt-4 px-5 py-3 rounded-2xl font-black text-white bg-[#E31E24] hover:bg-red-700 shadow-lg shadow-red-200"
                        >
                          Allow Location
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {ROUTES.map((rk) => {
                          const fromRes = computed?.[rk]?.from_university;
                          const toRes = computed?.[rk]?.to_university;

                          return (
                            <div
                              key={rk}
                              className="bg-white/70 border border-red-200 shadow-lg rounded-2xl p-5 backdrop-blur-sm"
                            >
                              <div className="text-lg font-black text-red-700 mb-4">
                                {routeTitle(rk)}
                              </div>

                              <div className="space-y-3">
                                {/* From University */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                                  <div className="text-[11px] uppercase font-black text-gray-500 mb-1">
                                    {directionLabel('from_university')}
                                  </div>

                                  {loadingData ? (
                                    <div className="text-sm text-gray-500 font-bold">Loading...</div>
                                  ) : fromRes?.stop ? (
                                    <div>
                                      <div className="text-base font-black text-gray-900">
                                        {fromRes.stop.name}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Distance: <span className="font-black">{formatDistance(fromRes.distanceMeters)}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500 font-bold">
                                      No upcoming stop found
                                    </div>
                                  )}
                                </div>

                                {/* To University */}
                                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                                  <div className="text-[11px] uppercase font-black text-gray-500 mb-1">
                                    {directionLabel('to_university')}
                                  </div>

                                  {loadingData ? (
                                    <div className="text-sm text-gray-500 font-bold">Loading...</div>
                                  ) : toRes?.stop ? (
                                    <div>
                                      <div className="text-base font-black text-gray-900">
                                        {toRes.stop.name}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Distance: <span className="font-black">{formatDistance(toRes.distanceMeters)}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500 font-bold">
                                      No upcoming stop found
                                    </div>
                                  )}
                                </div>

                                <div className="text-[11px] text-gray-500 font-medium">
                                  Updates every 10 seconds.
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
