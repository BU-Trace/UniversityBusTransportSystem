'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [busId, setBusId] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!busId.trim()) return;
    router.push(`/track-bus?busId=${busId.trim()}`);
    setOpen(false);
  };

  return (
    <>
      {/* Floating Search Icon */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-9999 bg-red-600 text-white p-4 rounded-full shadow-xl hover:scale-105 transition"
      >
        🔍
      </button>

      {/* Search Popup */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-9998 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm relative">
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-xl"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold mb-3 text-red-600">Track a Bus</h3>

            <input
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter Bus ID (BRTC-10)"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <button
              onClick={handleSearch}
              className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </>
  );
}
