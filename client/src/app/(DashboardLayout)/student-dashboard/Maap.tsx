'use client';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Red Location Pointer Icon
const redPointerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function MapController({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(pos, 16, { animate: true });
    setTimeout(() => map.invalidateSize(), 400);
  }, [pos, map]);
  return null;
}

export default function StudentMap({ location }: { location: { lat: number; lng: number } }) {
  if (typeof window === 'undefined') return null;

  const position: [number, number] = [location.lat, location.lng];

  return (
    <MapContainer center={position} zoom={16} className="h-full w-full z-0" zoomControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} icon={redPointerIcon} />
      <MapController pos={position} />
    </MapContainer>
  );
}
