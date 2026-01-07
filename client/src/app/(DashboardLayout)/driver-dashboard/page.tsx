'use client';

import Image from "next/image";
import React, { useState } from "react";
import StatusModal from "@/components/StatusModal";
import StatusDesign from "@/components/StatusDesign";

export default function BusDetailsPage() {
  const [showStatus, setShowStatus] = useState(false);
  const [showStatusDesign, setShowStatusDesign] = useState(false);

  // You can change this dynamically later
  const location = "Jakarta Barat";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row items-stretch">

      {/* LEFT RED SECTION */}
      <div className="bg-red-800 text-white w-full md:w-1/3 p-10 flex flex-col justify-center shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4">Name:</h2>
        <h1 className="text-4xl font-extrabold mb-8">John Doe</h1>

        <h2 className="text-2xl font-semibold mb-4">Bus:</h2>
        <h1 className="text-4xl font-extrabold mb-8">81</h1>

        <h2 className="text-2xl font-semibold mb-4">Registration:</h2>
        <h1 className="text-3xl font-bold mb-8 tracking-wider">
          UK07PA7498
        </h1>

        <h2 className="text-2xl font-semibold mb-4">Contact:</h2>
        <h1 className="text-3xl font-bold">9917360253</h1>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex-1 bg-white p-10 overflow-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Bus Documents
          </h2>
        </div>

        {/* BUS DOCUMENT IMAGE */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8 flex justify-center">
          <Image
            src="/f1.png"
            alt="Bus Document"
            width={500}
            height={300}
            className="rounded-md border shadow-md max-h-56 object-contain"
          />
        </div>

        {/* ✅ FIXED GOOGLE MAP */}
        <div className="border rounded-lg overflow-hidden shadow mb-8">
          <iframe
            title="Bus Location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              location
            )}&output=embed`}
            width="100%"
            height="450"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="border-0"
          />
        </div>

        {/* STATUS DESIGN (SHOW AFTER SUBMIT) */}
        {showStatusDesign && <StatusDesign />}
      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setShowStatus(true)}
        className="fixed top-6 right-6 z-40 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg font-semibold hover:bg-red-700"
      >
        Status Update
      </button>

      {/* STATUS MODAL */}
      {showStatus && (
        <StatusModal
          onClose={() => setShowStatus(false)}
          onSubmitSuccess={() => setShowStatusDesign(true)}
        />
      )}
    </div>
  );
}
