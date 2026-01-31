'use client';

import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Responsive Red Location Pointer Icon
const redPointerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30], // Smaller for mobile
  iconAnchor: [15, 30],
});

function MapController({ pos }: { pos: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(pos, 16, { animate: true, duration: 1.2 });
    setTimeout(() => map.invalidateSize(), 300);
  }, [pos, map]);

  return null;
}

export default function Map({ location }: { location: { lat: number; lng: number } }) {
  if (typeof window === 'undefined') return null;

  const position: [number, number] = [location.lat, location.lng];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={position}
        zoom={16}
        zoomControl={false}
        className="h-full w-full z-0"
        style={{ touchAction: 'manipulation' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Mobile friendly zoom buttons */}
        <ZoomControl position="bottomright" />

        <Marker position={position} icon={redPointerIcon} />

        <MapController pos={position} />
      </MapContainer>
    </div>
  );
}
