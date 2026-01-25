'use client';

import React, { useState } from 'react';

export default function StatusDesign() {
  const [seats, setSeats] = useState(3);
  const totalSeats = 60;

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-6">
      {/* AVAILABLE SEATS */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
        <p className="font-semibold text-gray-600 mb-3">Available seats</p>

        <div className="bg-blue-100 text-3xl font-bold px-10 py-4 rounded-lg mb-4">
          {seats}/{totalSeats}
        </div>

        <div className="flex gap-6">
          <button
            onClick={() => setSeats(Math.max(0, seats - 1))}
            className="w-12 h-12 rounded-full border-2 border-red-500 text-red-500 text-2xl"
          >
            −
          </button>
          <button
            onClick={() => setSeats(Math.min(totalSeats, seats + 1))}
            className="w-12 h-12 rounded-full border-2 border-red-500 text-red-500 text-2xl"
          >
            +
          </button>
        </div>

        <button className="mt-6 bg-red-600 text-white px-6 py-2 rounded-full font-semibold">
          Update details
        </button>
      </div>

      {/* LOCATION SHARING */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
        <p className="font-semibold text-gray-600 mb-6">Location Sharing</p>

        <div className="flex gap-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-yellow-400 flex items-center justify-center text-white font-bold text-center">
            res
            <br />
            pause
          </div>
          <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
            Stop
          </div>
        </div>
      </div>
    </div>
  );
}
