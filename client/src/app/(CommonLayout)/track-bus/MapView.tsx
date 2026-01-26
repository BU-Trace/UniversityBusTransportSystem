"use client";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";

const socket = io("http://localhost:5000");

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const studentIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

type Bus = {
  busId: string;
  lat: number;
  lng: number;
  speed: number;
  eta?: string;
};

export default function MapView({ busId }: { busId: string | null }) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [studentPos, setStudentPos] = useState<[number, number] | null>(null);
  const [activeBus, setActiveBus] = useState<Bus | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setStudentPos([pos.coords.latitude, pos.coords.longitude]);
    });

    socket.emit("joinRoute", "Route-1");

    const handler = (data: Bus) => {
      setBuses((prev) => {
        const rest = prev.filter((b) => b.busId !== data.busId);
        return [...rest, data];
      });
    };

    socket.on("receiveLocation", handler);
    return () => {
      socket.off("receiveLocation", handler);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Custom Red Popup */}
      {activeBus && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 bg-red-600 text-white rounded-2xl shadow-2xl p-4 w-[300px]">
          <button
            onClick={() => setActiveBus(null)}
            className="absolute top-2 right-2 text-white font-bold"
          >
            ✕
          </button>
          <h3 className="font-black text-lg">{activeBus.busId}</h3>
          <p>Speed: {activeBus.speed} km/h</p>
          <p>ETA: {activeBus.eta || "Calculating..."}</p>
        </div>
      )}

      <MapContainer center={[22.7, 90.35]} zoom={14} className="h-full w-full z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Student Marker */}
        {studentPos && <Marker position={studentPos} icon={studentIcon} />}

        {/* Bus Markers */}
        {buses
          .filter((b) => !busId || b.busId === busId)
          .map((bus) => (
            <Marker
              key={bus.busId}
              position={[bus.lat, bus.lng]}
              icon={busIcon}
              eventHandlers={{
                click: () => setActiveBus(bus),
              }}
            />
          ))}
      </MapContainer>
    </div>
  );
}
