'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useMemo, useRef } from 'react'; // Added useRef
import { useSearchParams } from 'next/navigation';
import { getBusTimingInfo, calculateDistance } from '@/utils/locationHelpers';
import { requestNotificationPermission, checkAndNotify } from '@/utils/notificationHelpers'; // Added notification helpers
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import BusMarker from './BusMarker';

const socket = io('http://localhost:5000');

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

type Bus = {
  routeId: string;
  busId: string;
  lat: number;
  lng: number;
  speed: number;
  eta?: string;
  status: 'running' | 'paused' | 'stopped';
  time: string;
};

export default function MapView({ busId: propBusId }: { busId: string | null }) {
  const params = useSearchParams();
  const routeId = params.get('route');

  const [buses, setBuses] = useState<Bus[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [activeBusId, setActiveBusId] = useState<string | null>(null);

  // Keep track of which buses have already sent an alert
  const notifiedBuses = useRef<Set<string>>(new Set());

  // 1. Request permission on component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!routeId) return;

    setBuses([]);
    socket.emit('joinRoute', { routeId });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error('GPS Error:', err)
      );
    }

    const handleBusUpdate = (data: Bus) => {
      if (data.routeId !== routeId) return;

      setBuses((prevBuses) => {
        const existingBusIndex = prevBuses.findIndex((b) => b.busId === data.busId);
        if (existingBusIndex > -1) {
          const updatedList = [...prevBuses];
          updatedList[existingBusIndex] = data;
          return updatedList;
        } else {
          return [...prevBuses, data];
        }
      });
    };

    socket.on('receiveLocation', handleBusUpdate);
    socket.on('receiveBusStatus', handleBusUpdate);

    return () => {
      socket.off('receiveLocation', handleBusUpdate);
      socket.off('receiveBusStatus', handleBusUpdate);
    };
  }, [routeId]);

  // 2. Notification logic: Check distance every time buses update
  useEffect(() => {
    if (!userPos || buses.length === 0) return;

    buses.forEach((bus) => {
      // Calculate real-time distance
      const dist = calculateDistance(userPos[0], userPos[1], bus.lat, bus.lng);

      // Check distance and trigger sound/alert if within 100m
      checkAndNotify(bus.busId, dist, notifiedBuses.current);
    });
  }, [buses, userPos]);

  const filteredBuses = useMemo(() => {
    if (propBusId) {
      return buses.filter((b) => b.busId === propBusId);
    }
    return buses;
  }, [buses, propBusId]);

  return (
    <div className="h-full w-full relative">
      <MapContainer center={[22.7, 90.35]} zoom={14} className="h-full w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userPos && (
          <Marker position={userPos} icon={userIcon}>
            <Popup className="rounded-lg">
              <span className="font-bold">You are here</span>
            </Popup>
          </Marker>
        )}

        {filteredBuses.map((bus) => {
          const timing = getBusTimingInfo(userPos, bus.lat, bus.lng, bus.speed);

          return (
            <BusMarker
              key={bus.busId}
              bus={{ ...bus, ...timing }}
              isActive={activeBusId === bus.busId}
              onMarkerClick={(id) => setActiveBusId(id)}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
