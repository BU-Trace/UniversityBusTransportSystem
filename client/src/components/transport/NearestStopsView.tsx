'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, RefreshCw, Footprints, Bike, Car } from 'lucide-react';
import { toast } from 'sonner';

type LatLng = { lat: number; lng: number };

interface IStopage {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface IRoute {
  _id: string;
  name: string;
  stopages: IStopage[];
  isActive?: boolean;
}

type StopDistance = {
  stop: IStopage;
  distanceMeters: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

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

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

// Simple time estimators based on distance
function estimateWalk(meters: number): string {
  const mins = Math.ceil(meters / 80); // ~4.8 km/h
  if (mins < 1) return '< 1 min';
  return `${mins} min`;
}

function estimateBike(meters: number): string {
  const mins = Math.ceil(meters / 250); // ~15 km/h
  if (mins < 1) return '< 1 min';
  return `${mins} min`;
}

function estimateRickshaw(meters: number): string {
  const mins = Math.ceil(meters / 330); // ~20 km/h
  if (mins < 1) return '< 1 min';
  return `${mins} min`;
}

const NearestStopsView: React.FC = () => {
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [routes, setRoutes] = useState<IRoute[]>([]);

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

      const res = await fetch(`${BASE_URL}/route`, { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'Failed to load routes');

      const activeRoutes = (json.data || []).filter((r: IRoute) => r.isActive !== false);
      setRoutes(activeRoutes);
      void userPos;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const computedRoutes = useMemo(() => {
    if (!loc) return [];

    return routes.map((route) => {
      const stopDistances: StopDistance[] = [];
      const validStops = route.stopages || [];

      // Check if stopages is an array of objects
      for (const stop of validStops) {
        if (
          typeof stop === 'object' &&
          stop !== null &&
          'latitude' in stop &&
          'longitude' in stop
        ) {
          const d = haversineMeters(loc, {
            lat: Number(stop.latitude),
            lng: Number(stop.longitude),
          });
          stopDistances.push({ stop, distanceMeters: d });
        }
      }

      // Sort by closest first
      stopDistances.sort((a, b) => a.distanceMeters - b.distanceMeters);

      return {
        ...route,
        closestStops: stopDistances,
      };
    });
  }, [loc, routes]);

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
          We need your location to show the nearest bus stops for your specific route.
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
        {computedRoutes.map((routeData) => {
          return (
            <div
              key={routeData._id}
              className="bg-gray-800/50 border border-white/10 shadow-sm rounded-2xl p-0 overflow-hidden hover:border-brick-500/50 transition-all flex flex-col h-full max-h-[32rem]"
            >
              <div className="bg-white/5 px-4 py-3 border-b border-white/10 shrink-0">
                <div className="text-sm font-black text-white">{routeData.name}</div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-gray-900/40">
                <div className="flex flex-col">
                  {loadingData && routeData.closestStops.length === 0 ? (
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse mt-1"></div>
                  ) : routeData.closestStops.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {routeData.closestStops.map((res, i) => (
                        <div
                          key={res.stop._id || i}
                          className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="text-sm font-bold text-gray-200">{res.stop.name}</div>
                            <div className="text-xs font-bold text-brick-400 bg-brick-500/10 px-2 py-1 rounded-lg shrink-0 border border-brick-500/20">
                              {formatDistance(res.distanceMeters)}
                            </div>
                          </div>

                          {/* Transport Estimates */}
                          <div className="grid grid-cols-3 gap-2 mt-1 border-t border-white/5 pt-2">
                            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/80 border border-white/5 text-gray-400 hover:text-white transition-colors">
                              <Footprints size={14} className="mb-0.5 opacity-70" />
                              <span className="text-[10px] font-medium">
                                {estimateWalk(res.distanceMeters)}
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/80 border border-white/5 text-gray-400 hover:text-white transition-colors">
                              <Bike size={14} className="mb-0.5 opacity-70" />
                              <span className="text-[10px] font-medium">
                                {estimateBike(res.distanceMeters)}
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-800/80 border border-white/5 text-gray-400 hover:text-white transition-colors">
                              <Car size={14} className="mb-0.5 opacity-70" />
                              <span className="text-[10px] font-medium">
                                {estimateRickshaw(res.distanceMeters)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">No stops found</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {computedRoutes.length === 0 && !loadingData && (
          <div className="col-span-full py-10 text-center text-gray-400 font-medium bg-white/5 rounded-2xl border border-white/5">
            No active routes available.
          </div>
        )}
      </div>
      <p className="text-center text-xs text-gray-500 italic mt-4 mb-2">
        Calculated dynamically based on your current location. Estimates are approximate.
      </p>
    </div>
  );
};

export default NearestStopsView;
