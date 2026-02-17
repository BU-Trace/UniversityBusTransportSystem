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
        <div className="w-full max-w-md rounded-3xl bg-gray-900/90 backdrop-blur-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* HEADER */}
          <div className="bg-linear-to-r from-gray-900 to-gray-800 p-6 text-white flex justify-between items-center border-b border-white/10">
            <h2 className="text-lg font-black uppercase tracking-tight">
              Driver <span className="text-brick-500">Status</span>
            </h2>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl">
              ✕
            </button>
          </div>

          {/* BODY */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* STATUS SELECT */}
            <div>
              <p className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest">
                Current Status
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`py-3 rounded-xl font-bold uppercase tracking-tight text-xs transition-all duration-300 ${
                    status === 'active'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-900/40 border border-green-400/20'
                      : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  Active
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`py-3 rounded-xl font-bold uppercase tracking-tight text-xs transition-all duration-300 ${
                    status === 'inactive'
                      ? 'bg-brick-600 text-white shadow-lg shadow-brick-900/40 border border-brick-500/20'
                      : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {/* DRIVER NAME */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Driver Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter driver name"
                required
                className="mt-1 w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brick-500/50 transition-all font-medium"
              />
            </div>

            {/* ROUTE */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Route
              </label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                required
                className="mt-1 w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brick-500/50 transition-all font-medium appearance-none"
              >
                <option value="" className="bg-gray-900">
                  Select route
                </option>
                <option value="Barishal Club" className="bg-gray-900">
                  Barishal Club
                </option>
                <option value="Nothullabad" className="bg-gray-900">
                  Nothullabad
                </option>
                <option value="Natun Bazar" className="bg-gray-900">
                  Natun Bazar
                </option>
              </select>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-brick-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-brick-900/40 hover:bg-brick-700 hover:shadow-brick-900/60 transition-all active:scale-[0.98]"
            >
              Save Status
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
