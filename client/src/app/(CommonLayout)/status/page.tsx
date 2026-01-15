'use client';

import React, { useState } from 'react';
import { ChevronsRight } from 'lucide-react';
import Link from "next/link";

export default function StatusPage() {
  const [isActive, setIsActive] = useState(false);
  const [name, setName] = useState('');
  const [route, setRoute] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Status: ${isActive ? 'Active' : 'Inactive'}\nName: ${name}\nRoute: ${route}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9f5f9]">
      <div className="bg-red-500 text-white p-8 rounded-3xl shadow-2xl w-[400px] flex flex-col">
        {/* Toggle Status */}
        <div className="flex justify-end items-center mb-6">
          <label className="mr-2 text-sm">Status</label>
          <div
            onClick={() => setIsActive(!isActive)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
              isActive ? 'bg-green-400' : 'bg-pink-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                isActive ? 'translate-x-6' : ''
              }`}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          {/* Name Input */}
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-gray-800 bg-red-50 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Route Dropdown */}
          <div>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-gray-800 bg-red-50 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Select Route</option>
              <option value="Route 1">Route 1</option>
              <option value="Route 2">Route 2</option>
              <option value="Route 3">Route 3</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 bg-red-700 text-white py-2 rounded-full font-semibold shadow-md hover:bg-red-800 transition"
          >
            Submit
          </button>
        </form>
      </div>

      <Link
        href="/driver-dashboard"
        title="Go to Dashboard"
        className="fixed top-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 z-50"
      >
        <ChevronsRight size={24} />
      </Link>
    </div>
  );
}
