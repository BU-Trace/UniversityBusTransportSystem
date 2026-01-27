"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const BusMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">
      Loading Map...
    </div>
  ),
});

type Status = "idle" | "sharing" | "paused";

interface Bus {
  busNo: string;
  reg: string;
  route: string;
}

export default function DriverDashboard() {
  const [driver] = useState({
    name: "Driver1",
    id: "DRV-2026-007",
    profilePic: "/static/driver-photo.jpg",
  });

  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const watchId = useRef<number | null>(null);

  const availableBuses: Bus[] = [
    { busNo: "BRTC-10", reg: "DHK-11-2233", route: "Route-1" },
    { busNo: "BRTC-11", reg: "DHK-22-8899", route: "Route-2" },
    { busNo: "BRTC-12", reg: "DHK-55-4455", route: "Route-3" },
  ];

  const initTracking = () => {
    if (!navigator.geolocation || !selectedBus) return alert("GPS or Bus not selected");

    let lastSent = 0;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSent < 10000) return;
        lastSent = now;

        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });

        socket.emit("sendLocation", {
          busId: selectedBus.busNo,
          lat,
          lng,
          status: "running",
        });
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true }
    );
  };

  const handleStart = () => {
    if (!selectedBus) return;
    setStatus("sharing");
    setSidebarOpen(false);
    socket.emit("busStatus", { busId: selectedBus.busNo, status: "running" });
    initTracking();
  };

  const handlePause = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setStatus("paused");
    socket.emit("busStatus", { busId: selectedBus?.busNo, status: "paused" });
  };

  const handleResume = () => {
    setStatus("sharing");
    socket.emit("busStatus", { busId: selectedBus?.busNo, status: "running" });
    initTracking();
  };

  const handleStop = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setStatus("idle");
    socket.emit("busStatus", { busId: selectedBus?.busNo, status: "stopped" });
    setLocation(null);
    setSidebarOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-full sm:w-80 
        bg-linear-to-b from-[#EF4444] to-[#8B0000] 
        text-white p-5 sm:p-6 transition-transform duration-500 ease-in-out shadow-2xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-light"
        >
          ✕
        </button>

        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center mb-8 sm:mb-10">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
              <Image src="/static/BUTracelogo-modified.png" alt="Logo" width={40} height={40} />
            </div>
            <span className="ml-3 font-bold text-xl tracking-tighter uppercase">BUTrace</span>
          </div>

          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 shadow-xl relative flex items-center justify-center">
                <Image src={driver.profilePic} alt="Driver" fill className="object-cover" />
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <h2 className="mt-3 sm:mt-4 text-xl font-bold uppercase">{driver.name}</h2>
            <p className="text-red-200 text-xs opacity-80">{driver.id}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">
                Selected Bus
              </span>
              <p className="text-base font-bold">{selectedBus?.busNo || "Not Selected"}</p>
              <p className="text-[10px] opacity-60">{selectedBus?.reg}</p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">
                Route
              </span>
              <p className="text-sm font-semibold">{selectedBus?.route || "Not Assigned"}</p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-black text-red-200 block mb-1">
                Duty Status
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-green-300">
                {status}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative flex-1 h-full w-full">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 sm:top-6 left-4 sm:left-6 z-40 bg-white text-red-600 p-3 sm:p-4 rounded-2xl shadow-xl hover:scale-105 transition"
          >
            ☰
          </button>
        )}

        {/* FLOATING BUS SELECT CARD */}
        {!selectedBus && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 
            sm:left-auto sm:right-6 sm:translate-x-0
            bg-white p-4 sm:p-6 rounded-2xl shadow-2xl w-[92%] sm:w-[360px] z-30 animate-fade-in"
          >
            <h3 className="font-bold mb-3 sm:mb-4 text-lg text-red-600">Select Your Bus</h3>
            <div className="space-y-3">
              {availableBuses.map((bus) => (
                <button
                  key={bus.busNo}
                  onClick={() => setSelectedBus(bus)}
                  className="flex justify-between items-center w-full p-4 border rounded-xl hover:bg-red-50 transition"
                >
                  <div className="text-left">
                    <p className="font-bold">{bus.busNo}</p>
                    <p className="text-xs text-gray-500">{bus.route}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Available
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAP */}
        <div className="absolute inset-0 z-0">
          {location ? (
            <BusMap location={location} />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                <div className="relative p-6 sm:p-8 rounded-full bg-white shadow-2xl flex items-center justify-center">
                  📍
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tighter">
                System Ready
              </h3>
              <p className="text-slate-400 font-medium">Select Bus & Start Shift</p>
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div
          className="fixed bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 
          flex gap-2 sm:gap-3 z-40 w-[94%] max-w-md px-1"
        >
          {status === "idle" ? (
            <button
              onClick={handleStart}
              disabled={!selectedBus}
              className={`w-full py-4 sm:py-5 rounded-4xl font-black uppercase tracking-widest shadow-2xl transition
              ${selectedBus ? "bg-green-600 text-white hover:scale-105" : "bg-gray-400 text-white cursor-not-allowed"}`}
            >
              Start Shift
            </button>
          ) : (
            <>
              <button
                onClick={status === "paused" ? handleResume : handlePause}
                className="flex-1 py-4 sm:py-5 rounded-4xl font-black uppercase bg-amber-500 text-white shadow-xl hover:scale-105"
              >
                {status === "paused" ? "Resume" : "Pause"}
              </button>

              <button
                onClick={handleStop}
                className="flex-1 py-4 sm:py-5 rounded-4xl font-black uppercase bg-red-600 text-white shadow-xl hover:scale-105"
              >
                End Shift
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
