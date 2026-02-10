/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const { data: session, update } = useSession();

  const [name, setName] = useState(session?.user?.name || '');
  const [photoUrl, setPhotoUrl] = useState(
    (session as any)?.user?.photoUrl || (session as any)?.user?.image || ''
  );

  const save = async () => {
    try {
      // This only updates the client session. If you want DB update,
      // we will call your backend API here (recommended).
      await update({
        ...session,
        user: {
          ...(session as any)?.user,
          name,
          photoUrl,
        },
      });

      toast.success('Profile updated.');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">Edit Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Update your name and profile photo.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-gray-500 mb-1 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
              Photo URL
            </label>
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white"
            />
            <p className="text-xs text-gray-400 mt-2">
              Put your photo here within 48 hours of registration and use real photo or account will
              be terminated.
            </p>
          </div>

          <button
            onClick={save}
            className="w-full bg-[#E31E24] text-white py-3 rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Save Changes
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-[#E31E24] text-white py-3 rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
