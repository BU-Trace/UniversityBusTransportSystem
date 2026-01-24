'use client';

import React, { useState } from 'react';

export default function StatusModal({
  onClose,
  onSubmitSuccess,
}: {
  onClose: () => void;
  onSubmitSuccess: () => void;
}) {
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive');
  const [name, setName] = useState('');
  const [route, setRoute] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      status,
      name,
      route,
    });

    onSubmitSuccess();
    onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white flex justify-between items-center">
            <h2 className="text-lg font-semibold">Driver Status</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl">
              ✕
            </button>
          </div>

          {/* BODY */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* STATUS SELECT */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Current Status</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`py-3 rounded-xl font-semibold transition ${
                    status === 'active'
                      ? 'bg-green-500 text-white shadow'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Active
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`py-3 rounded-xl font-semibold transition ${
                    status === 'inactive'
                      ? 'bg-red-500 text-white shadow'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {/* DRIVER NAME */}
            <div>
              <label className="text-sm font-semibold text-gray-600">Driver Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter driver name"
                required
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* ROUTE */}
            <div>
              <label className="text-sm font-semibold text-gray-600">Route</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                required
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select route</option>
                <option value="Barishal Club">Barishal Club</option>
                <option value="Nothullabad">Nothullabad</option>
                <option value="Natun Bazar">Natun Bazar</option>
              </select>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-lg shadow hover:bg-red-700 transition"
            >
              Save Status
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
