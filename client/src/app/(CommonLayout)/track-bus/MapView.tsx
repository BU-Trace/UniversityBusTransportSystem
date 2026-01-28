"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import BusMarker from "./BusMarker"; 

const socket = io("http://localhost:5000");

const studentIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
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
  status: "running" | "paused" | "stopped";
  time: string;
};

export default function MapView({ busId }: { busId: string | null }) {
const params = useSearchParams();
const routeId = params.get("route");

  const [buses, setBuses] = useState<Bus[]>([]);
  const [studentPos, setStudentPos] = useState<[number, number] | null>(null);
  const [activeBusId, setActiveBusId] = useState<string | null>(null);

  useEffect(() => {
  if (routeId) {
    socket.emit("joinRoute", { routeId });
    setBuses([]); // clear previous buses when route changes
  }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setStudentPos([pos.coords.latitude, pos.coords.longitude]);
      });
    }

    const handler = (data: Bus) => {
      if(data.routeId !== routeId) return; // ignore if not in the same route
      setBuses((prev) => {
        const filtered = prev.filter((b) => b.busId !== data.busId);
        return [...filtered, data];
      });
    };

    socket.on("receiveLocation", handler);
    socket.on("receiveBusStatus", handler);

    return () => {
      socket.off("receiveLocation", handler);
      socket.off("receiveBusStatus", handler);
    };
  }, [routeId]);

  const filteredBuses = busId
    ? buses.filter((b) => b.busId === busId)
    : buses;

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={[22.7, 90.35]} 
        zoom={14} 
        className="h-full w-full z-0"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Student Marker */}
        {studentPos && (
          <Marker position={studentPos} icon={studentIcon}>
            <Popup className="rounded-lg">You are here</Popup>
          </Marker>
        )}

        {/* Bus Markers Integrated Here */}
        {filteredBuses.map((bus) => (
          <BusMarker 
            key={bus.busId} 
            bus={bus} 
            isActive={activeBusId === bus.busId}
            onMarkerClick={(id) => setActiveBusId(id)}
          />
        ))}
      </MapContainer>
    </div>
  );
}