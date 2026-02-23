'use client';

/**
 * BusAlertProvider
 * ────────────────
 * Global context that monitors live bus locations and fires
 * in-app toasts + browser notifications + vibration when:
 *
 * 1. A bus starts its duty   (driver begins sending location)
 * 2. A bus comes within 200 m of the user
 * 3. A scheduled departure is approaching (≤ 5 min away)
 *
 * Drop this provider once in the layout tree and it works
 * silently in the background for every page.
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';
import { calculateDistance } from '@/utils/locationHelpers';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface BusLoc {
  busId: string;
  busName?: string;
  routeId: string;
  lat: number;
  lng: number;
  speed: number;
  status: 'running' | 'paused' | 'stopped';
  time: string;
}

interface ScheduleItem {
  routeName: string;
  busName: string;
  time: string; // "HH:mm"
  direction: 'coming' | 'going';
}

interface BusAlertContextType {
  /** Number of alerts fired this session */
  alertCount: number;
  /** Whether alerts are enabled */
  enabled: boolean;
  /** Toggle alerts on/off */
  setEnabled: (v: boolean) => void;
}

const BusAlertContext = createContext<BusAlertContextType>({
  alertCount: 0,
  enabled: true,
  setEnabled: () => {},
});

export const useBusAlerts = () => useContext(BusAlertContext);

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PROXIMITY_THRESHOLD_KM = 0.2; // 200 m
const PROXIMITY_RESET_KM = 0.5; // reset alert once bus > 500 m
const SCHEDULE_WARN_MINUTES = 5; // alert 5 min before departure
const SCHEDULE_CHECK_INTERVAL = 60_000; // check schedule every 60 s
const VIBRATE_PATTERN = [200, 100, 200, 100, 300]; // vibration pattern

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const vibrate = () => {
  try {
    if ('vibrate' in navigator) navigator.vibrate(VIBRATE_PATTERN);
  } catch {
    /* Safari / unsupported — ignore */
  }
};

const sendBrowserNotification = (title: string, body: string) => {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      badge: '/static/BUTracelogo.png',
    });
  } catch {
    /* silent */
  }
};

/** Parse "HH:mm" string into today's Date */
const parseTimeToday = (hhmm: string): Date | null => {
  const [h, m] = hhmm.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export const BusAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState(true);
  const [alertCount, setAlertCount] = useState(0);
  const userLocRef = useRef<[number, number] | null>(null);

  // Track which buses we already alerted about (to avoid spamming)
  const proximityAlerted = useRef<Set<string>>(new Set());
  const startAlerted = useRef<Set<string>>(new Set());
  const scheduleAlerted = useRef<Set<string>>(new Set());

  // Live bus locations (kept in ref to avoid re-render storms)
  const busesRef = useRef<Map<string, BusLoc>>(new Map());

  // Schedules from API
  const schedulesRef = useRef<ScheduleItem[]>([]);

  /* ── Request notification permission once ── */
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }
  }, []);

  /* ── Watch user geolocation ── */
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const wid = navigator.geolocation.watchPosition(
      (pos) => {
        userLocRef.current = [pos.coords.latitude, pos.coords.longitude];
      },
      () => {},
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(wid);
  }, []);

  /* ── Fire an alert (toast + browser notif + vibrate) ── */
  const fireAlert = useCallback(
    (title: string, body: string, type: 'proximity' | 'start' | 'schedule') => {
      if (!enabled) return;

      // Vibrate
      vibrate();

      // In-app toast
      const icon = type === 'proximity' ? '📍' : type === 'start' ? '🚌' : '⏰';
      toast.success(`${icon} ${title}`, {
        description: body,
        duration: 8000,
      });

      // Browser notification
      sendBrowserNotification(title, body);

      setAlertCount((c) => c + 1);
    },
    [enabled]
  );

  /* ── Socket listeners ── */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleLocation = (data: BusLoc) => {
      const prev = busesRef.current.get(data.busId);
      busesRef.current.set(data.busId, data);

      if (!enabled) return;

      const displayName = data.busName || data.busId;

      // ── Alert 1: Bus just started (first location we see for this bus) ──
      if (!prev && !startAlerted.current.has(data.busId)) {
        startAlerted.current.add(data.busId);
        fireAlert(
          `${displayName} Started!`,
          `${displayName} just started its duty and is now live on the map.`,
          'start'
        );
      }

      // ── Alert 2: Proximity — bus within 200 m ──
      const uLoc = userLocRef.current;
      if (uLoc) {
        const dist = calculateDistance(uLoc[0], uLoc[1], data.lat, data.lng);

        if (dist <= PROXIMITY_THRESHOLD_KM && !proximityAlerted.current.has(data.busId)) {
          proximityAlerted.current.add(data.busId);
          const meters = Math.round(dist * 1000);
          fireAlert(
            `${displayName} is nearby!`,
            `${displayName} is just ${meters}m away from you. Get ready!`,
            'proximity'
          );
        }

        // Reset proximity alert if bus moves away
        if (dist > PROXIMITY_RESET_KM && proximityAlerted.current.has(data.busId)) {
          proximityAlerted.current.delete(data.busId);
        }
      }
    };

    socket.on('receiveLocation', handleLocation);
    return () => {
      socket.off('receiveLocation', handleLocation);
    };
  }, [enabled, fireAlert]);

  /* ── Fetch schedules from API ── */
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/route`
        );
        const json = await res.json();
        if (!json.success || !Array.isArray(json.data)) return;

        const items: ScheduleItem[] = [];
        for (const route of json.data) {
          const routeName = route.name || route.route_id || 'Route';

          if (Array.isArray(route.activeHoursComing)) {
            for (const entry of route.activeHoursComing) {
              items.push({
                routeName,
                busName: entry.bus?.name || entry.bus?.bus_id || 'Bus',
                time: entry.time,
                direction: 'coming',
              });
            }
          }
          if (Array.isArray(route.activeHoursGoing)) {
            for (const entry of route.activeHoursGoing) {
              items.push({
                routeName,
                busName: entry.bus?.name || entry.bus?.bus_id || 'Bus',
                time: entry.time,
                direction: 'going',
              });
            }
          }
        }
        schedulesRef.current = items;
      } catch {
        /* silent */
      }
    };

    fetchSchedules();
    // Re-fetch every 10 min in case admin updates schedule
    const iv = setInterval(fetchSchedules, 600_000);
    return () => clearInterval(iv);
  }, []);

  /* ── Alert 3: Schedule-based — warn ≤5 min before departure ── */
  useEffect(() => {
    if (!enabled) return;

    const check = () => {
      const now = new Date();
      for (const item of schedulesRef.current) {
        const dep = parseTimeToday(item.time);
        if (!dep) continue;

        const diffMs = dep.getTime() - now.getTime();
        const diffMin = diffMs / 60_000;

        // Alert if 0 < diff ≤ 5 min, and not already alerted
        const key = `${item.busName}-${item.time}-${item.direction}`;
        if (diffMin > 0 && diffMin <= SCHEDULE_WARN_MINUTES && !scheduleAlerted.current.has(key)) {
          scheduleAlerted.current.add(key);

          const dirLabel = item.direction === 'coming' ? 'towards Campus' : 'from Campus';
          fireAlert(
            `${item.busName} departing soon!`,
            `${item.busName} on ${item.routeName} departs ${dirLabel} at ${item.time} — in ${Math.ceil(diffMin)} min.`,
            'schedule'
          );
        }
      }
    };

    check(); // run immediately
    const iv = setInterval(check, SCHEDULE_CHECK_INTERVAL);
    return () => clearInterval(iv);
  }, [enabled, fireAlert]);

  /* ── Reset start alerts at midnight (new day = new duty) ── */
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

    const timeout = setTimeout(() => {
      startAlerted.current.clear();
      scheduleAlerted.current.clear();
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <BusAlertContext.Provider value={{ alertCount, enabled, setEnabled }}>
      {children}
    </BusAlertContext.Provider>
  );
};

export default BusAlertProvider;
