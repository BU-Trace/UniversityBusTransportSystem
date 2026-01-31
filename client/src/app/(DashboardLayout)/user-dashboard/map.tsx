'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

/* ================= TYPES ================= */
export type Location = {
  lat: number;
  lng: number;
};

type MapProps = {
  userLocation: Location | null;
  busLocation: Location | null;
};

/* ================= ICONS ================= */
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

/* ================= MAP CONTROLLER ================= */
function MapController({
  userLocation,
  busLocation,
}: {
  userLocation: Location | null;
  busLocation: Location | null;
}) {
  const map = useMap();

  useEffect(() => {
    const target = busLocation ?? userLocation;
    if (!target) return;

    map.flyTo([target.lat, target.lng], 15, {
      animate: true,
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [userLocation, busLocation, map]);

  return null;
}

/* ================= COMPONENT ================= */
export default function Map({ userLocation, busLocation }: MapProps) {
  const center = userLocation ??
    busLocation ?? {
      lat: 23.8103,
      lng: 90.4125,
    };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={15}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {busLocation && (
        <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
          <Popup>Bus Live Location</Popup>
        </Marker>
      )}

      <MapController userLocation={userLocation} busLocation={busLocation} />
    </MapContainer>
  );
}
