'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Direction = 'from_university' | 'to_university';

type LatLng = { lat: number; lng: number };

type RouteKey = 'nothullabad' | 'bangla_bazar' | 'notun_bazar';

type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
};

type LiveBus = {
  routeKey: RouteKey;
  direction: Direction;
  position?: LatLng;
  updatedAt?: string;
};

type NearestResult = {
  stop: Stop | null;
  distanceMeters: number | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

async function fetchStops(routeKey: RouteKey): Promise<Stop[]> {
  const res = await fetch(`${BASE_URL}/route/public/stops?routeKey=${routeKey}`, {
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => ({}))) as { data?: unknown; message?: string };
  if (!res.ok) throw new Error(json?.message || 'Failed to load stops');

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

function nearestUpcomingStopForUser(params: {
  user: LatLng;
  stopsOrdered: Stop[];
  busPos?: LatLng;
}): NearestResult {
  const { user, stopsOrdered, busPos } = params;
  if (stopsOrdered.length === 0) return { stop: null, distanceMeters: null };

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

  const upcoming = stopsOrdered.slice(Math.min(busNearestIdx + 1, stopsOrdered.length));
  if (upcoming.length === 0) return { stop: null, distanceMeters: null };

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

const NearestStopsView: React.FC = () => {
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
  const ROUTES: RouteKey[] = useMemo(() => ['nothullabad', 'bangla_bazar', 'notun_bazar'], []);

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
      const msg = e instanceof Error ? e.message : 'Failed to get your location.';
      toast.error(msg);
      throw e;
    } finally {
      setLocLoading(false);
    }
  };

  const loadEverything = async () => {
    setLoadingData(true);
    try {
      const userPos = loc ?? (await askLocation());

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
      void userPos;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load nearest stops');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadEverything();
    refreshTimerRef.current = window.setInterval(async () => {
      if (!loc) return;
      try {
        // Only refresh live bus
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
        // silent fail
      }
    }, 10_000);

    return () => {
      if (refreshTimerRef.current) window.clearInterval(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const computed = useMemo(() => {
    if (!loc) return null;
    const result: Record<RouteKey, Record<Direction, NearestResult>> = {
      nothullabad: {
        from_university: { stop: null, distanceMeters: null },
        to_university: { stop: null, distanceMeters: null },
      },
      bangla_bazar: {
        from_university: { stop: null, distanceMeters: null },
        to_university: { stop: null, distanceMeters: null },
      },
      notun_bazar: {
        from_university: { stop: null, distanceMeters: null },
        to_university: { stop: null, distanceMeters: null },
      },
    };

    for (const rk of ROUTES) {
      const baseStops = stopsByRoute[rk] || [];
      (['from_university', 'to_university'] as Direction[]).forEach((dir) => {
        const sorted = [...baseStops].sort((a, b) => a.order - b.order);
        const ordered = dir === 'from_university' ? sorted : sorted.slice().reverse();
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

  if (locLoading && !loc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Getting precise location...</p>
      </div>
    );
  }

  if (!loc) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="bg-red-50 p-4 rounded-full text-red-600 mb-4">
          <MapPin size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Location Required</h3>
        <p className="text-gray-500 mb-6 max-w-sm">
          We need your location to show the nearest bus stops and arrival times for your specific
          route.
        </p>
        <button
          onClick={askLocation}
          disabled={locLoading}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          {locLoading ? <RefreshCw size={18} className="animate-spin" /> : <MapPin size={18} />}
          Allow Location Access
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 custom-scrollbar space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Your Nearest Stops
        </h3>
        <button
          onClick={loadEverything}
          disabled={loadingData}
          className="text-xs font-semibold text-red-600 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
        >
          <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
        {ROUTES.map((rk) => {
          const fromRes = computed?.[rk]?.from_university;
          const toRes = computed?.[rk]?.to_university;

          return (
            <div
              key={rk}
              className="bg-white border border-gray-100 shadow-sm rounded-2xl p-0 overflow-hidden hover:border-red-200 transition-all"
            >
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-black text-gray-800">{routeTitle(rk)}</div>
              </div>

              <div className="p-4 space-y-3">
                {/* From University */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                      {directionLabel('from_university')}
                    </div>
                    {loadingData ? (
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-1"></div>
                    ) : fromRes?.stop ? (
                      <div className="text-sm font-bold text-gray-900">{fromRes.stop.name}</div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">No stop found</div>
                    )}
                  </div>
                  {fromRes?.distanceMeters !== null && fromRes?.distanceMeters !== undefined && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                        {formatDistance(fromRes.distanceMeters)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {/* To University */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                      {directionLabel('to_university')}
                    </div>
                    {loadingData ? (
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-1"></div>
                    ) : toRes?.stop ? (
                      <div className="text-sm font-bold text-gray-900">{toRes.stop.name}</div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">No stop found</div>
                    )}
                  </div>
                  {toRes?.distanceMeters !== null && toRes?.distanceMeters !== undefined && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                        {formatDistance(toRes.distanceMeters)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-gray-400 italic mt-4">
        Real-time updates auto-refresh every 10 seconds.
      </p>
    </div>
  );
};

export default NearestStopsView;
