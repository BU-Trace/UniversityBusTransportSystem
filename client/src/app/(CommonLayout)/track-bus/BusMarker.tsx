"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Bus icon
const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

type BusProps = {
  bus: {
    busId: string;
    lat: number;
    lng: number;
    speed: number;
    eta?: string;
    status: "running" | "paused" | "stopped";
    time: string;
  };
  isActive: boolean;
  onMarkerClick: (id: string) => void;
};

export default function BusMarker({ bus, isActive, onMarkerClick }: BusProps) {
  return (
    <Marker
      position={[bus.lat, bus.lng]}
      icon={busIcon}
      eventHandlers={{
        click: () => onMarkerClick(bus.busId),
      }}
    >
      {isActive && (
        <Popup autoPan className="custom-red-popup">
          <div className="w-[220px] overflow-hidden rounded-xl shadow-lg bg-white">
            
            {/* Header */}
            <div className="bg-linear-to-r from-red-700 via-red-600 to-red-500 p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      bus.status === "running"
                        ? "bg-green-400 animate-pulse"
                        : "bg-white/60"
                    }`}
                  />
                  <span className="text-white font-black text-[11px] uppercase">
                    Bus {bus.busId}
                  </span>
                </div>

                <span className="text-[9px] px-2 py-0.5 rounded bg-white/20 text-white font-bold uppercase">
                  {bus.status}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                
                {/* Speed */}
                <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                  <p className="text-[8px] text-red-400 font-bold uppercase mb-0.5">
                    Speed
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-red-900">
                      {bus.speed || 0}
                    </span>
                    <span className="text-[9px] font-bold text-red-700">
                      km/h
                    </span>
                  </div>
                </div>

                {/* ETA */}
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">
                    ETA
                  </p>
                  <p className="text-[11px] font-black text-slate-800 truncate">
                    {bus.eta || "Calculating"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center px-3 py-2 bg-red-50/40 border-t border-red-100">
              <div className="flex items-center gap-1 text-red-400">
                <svg
                  className="w-2.5 h-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-[8px] font-bold uppercase">
                  Sync
                </span>
              </div>

              <span className="text-[9px] font-black text-red-900">
                {new Date(bus.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

          </div>
        </Popup>
      )}
    </Marker>
  );
}
