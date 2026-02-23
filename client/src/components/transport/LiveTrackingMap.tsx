'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  busLat: number;
  busLng: number;
  busName: string;
  busStatus: string;
  speed: number;
  userLat?: number;
  userLng?: number;
}

/* ── Custom bus icon ── */
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

/* ── Custom user icon ── */
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

/* ── Smoothly pan the map to follow the bus ── */
const MapFollower = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      map.setView([lat, lng], 16, { animate: false });
      first.current = false;
    } else {
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
    }
  }, [lat, lng, map]);

  return null;
};

const LiveTrackingMap: React.FC<MapProps> = ({
  busLat,
  busLng,
  busName,
  busStatus,
  speed,
  userLat,
  userLng,
}) => {
  const center = useMemo<[number, number]>(() => [busLat, busLng], [busLat, busLng]);

  return (
    <MapContainer
      center={center}
      zoom={16}
      scrollWheelZoom
      className="h-full w-full z-0 rounded-2xl"
      style={{ minHeight: 300 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapFollower lat={busLat} lng={busLng} />

      {/* Bus marker */}
      <Marker position={[busLat, busLng]} icon={busIcon}>
        <Popup>
          <div className="text-center">
            <p className="font-black text-sm">{busName}</p>
            <p className="text-xs text-gray-600 capitalize">{busStatus}</p>
            <p className="text-xs">{speed} km/h</p>
          </div>
        </Popup>
      </Marker>

      {/* User marker */}
      {userLat != null && userLng != null && (
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>
            <span className="font-bold text-xs">You are here</span>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LiveTrackingMap;
