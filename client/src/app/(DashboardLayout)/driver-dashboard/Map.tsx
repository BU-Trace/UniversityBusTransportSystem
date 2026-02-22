'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [22.701, 90.3535];
const DEFAULT_ZOOM = 14;

// --- UTILS ---
function clampHeading(value?: number) {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  const fixed = value % 360;
  return fixed < 0 ? fixed + 360 : fixed;
}

// --- PIN ICON ---
function createPinIcon(heading: number) {
  const deg = clampHeading(heading);

  return L.divIcon({
    className: 'bg-transparent',
    iconSize: [46, 46],
    iconAnchor: [23, 46],
    html: `
      <div style="width:46px;height:46px;position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute; inset:0;
          width:46px;height:46px;border-radius:999px;
          background:rgba(239,68,68,0.16);
          filter: blur(3px);
        "></div>

        <div style="
          width: 28px; height: 28px;
          background: #ef4444;
          border: 3px solid rgba(255,255,255,0.95);
          border-radius: 999px 999px 999px 0;
          transform: rotate(-45deg);
          box-shadow: 0 12px 28px rgba(0,0,0,0.35);
          position: relative;
        ">
          <div style="
            position:absolute; top:50%; left:50%;
            width: 9px; height: 9px;
            background:rgba(255,255,255,0.95);
            border-radius:999px;
            transform: translate(-50%,-50%) rotate(45deg);
          "></div>
        </div>

        <div style="
          position:absolute; top:6px; left:50%;
          transform: translateX(-50%) rotate(${deg}deg);
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-bottom:12px solid rgba(0,0,0,0.75);
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));
        "></div>
      </div>
    `,
  });
}

// --- FIX: TILE BREAK / SIZE ISSUE ---
function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    const t1 = setTimeout(() => map.invalidateSize(), 120);
    const t2 = setTimeout(() => map.invalidateSize(), 450);
    const t3 = setTimeout(() => map.invalidateSize(), 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);

  return null;
}

// --- DISABLE ALL MANUAL INTERACTION ---
function DisableManualMapInteraction() {
  const map = useMap();

  useEffect(() => {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
    map.zoomControl?.remove();

    // Disable ALL pointer interaction
    const container = map.getContainer();
    container.style.cursor = 'default';
    container.style.pointerEvents = 'none';

    return () => {
      container.style.pointerEvents = '';
      container.style.cursor = '';
    };
  }, [map]);

  return null;
}

// --- AUTO FOLLOW GPS ---
function AutoFollow({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap();
  const init = useRef(false);

  useEffect(() => {
    if (!location) {
      if (!init.current) map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    const target: [number, number] = [location.lat, location.lng];

    // First time = flyTo
    if (!init.current) {
      init.current = true;
      map.flyTo(target, 17, { duration: 1.2 });
      return;
    }

    // Always follow = panTo
    map.panTo(target, { animate: true, duration: 0.7 });
  }, [location, map]);

  return null;
}

export default function Map({
  location,
}: {
  location: { lat: number; lng: number; heading?: number } | null;
}) {
  const [tilesReady, setTilesReady] = useState(false);

  const icon = useMemo(() => createPinIcon(location?.heading ?? 0), [location?.heading]);
  const center: [number, number] = location ? [location.lat, location.lng] : DEFAULT_CENTER;

  return (
    <div className="relative h-full w-full bg-[#0f0f16]">
      {/* LOADING OVERLAY */}
      {!tilesReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f0f16]">
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <div className="h-10 w-10 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
            <div className="text-[10px] font-black tracking-[0.35em] uppercase">Loading Map</div>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        preferCanvas={true}
        className="h-full w-full z-0"
        style={{
          background: '#0f0f16',
          filter: 'brightness(1.25) contrast(0.95) saturate(0.85)',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          keepBuffer={8}
          updateWhenIdle={true}
          updateWhenZooming={false}
          eventHandlers={{
            load: () => setTilesReady(true),
          }}
        />

        <MapResizeFix />
        <DisableManualMapInteraction />
        <AutoFollow location={location} />

        {location && <Marker position={[location.lat, location.lng]} icon={icon} />}
      </MapContainer>
    </div>
  );
}
