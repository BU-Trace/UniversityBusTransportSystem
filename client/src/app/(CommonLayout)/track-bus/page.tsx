"use client";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
// import SearchBar from "./Search";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function TrackBusPage() {
  const params = useSearchParams();
  const busId = params.get("busId");

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-50">
      
      {/* Floating Search Button + Popup */}
      {/* <SearchBar /> */}

      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapView busId={busId} />
      </div>
      
    </div>
  );
}
