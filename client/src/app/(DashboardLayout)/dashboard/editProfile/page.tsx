"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type UserRole = "student" | "driver" | "admin" | "superadmin";

type UpdateProfileBody = {
  name: string;
  photoUrl: string;
};

type UpdateProfileResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
    photoUrl?: string | null;
  };
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function EditProfilePage() {
  const { data: session, update, status } = useSession();

  const [name, setName] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");

  const [saving, setSaving] = useState(false);

  // Load initial values from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setPhotoUrl(session.user.photoUrl ?? session.user.image ?? "");
    }
  }, [session]);

  const save = async () => {
    try {
      if (status !== "authenticated" || !session?.user) {
        toast.error("Please login again.");
        return;
      }

      const token = session.accessToken;
      if (!token) {
        toast.error("No access token found. Please login again.");
        return;
      }

      const payload: UpdateProfileBody = {
        name: name.trim(),
        photoUrl: photoUrl.trim(),
      };

      if (!payload.name) {
        toast.error("Name is required.");
        return;
      }

      if (!payload.photoUrl) {
        toast.error("Photo URL is required.");
        return;
      }

      if (!isValidHttpUrl(payload.photoUrl)) {
        toast.error("Please provide a valid photo URL (http/https).");
        return;
      }

      setSaving(true);

      // 1) Update backend
      const res = await fetch(`${BASE_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json: UpdateProfileResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || "Failed to update profile on server.");
      }

      const serverName = json.data?.name ?? payload.name;
      const serverPhotoUrl = json.data?.photoUrl ?? payload.photoUrl;

      // 2) Update NextAuth session (UI updates instantly)
      await update({
        ...session,
        user: {
          ...session.user,
          name: serverName,
          photoUrl: serverPhotoUrl ?? undefined,
          // Keep image updated too because many components read session.user.image
          image: serverPhotoUrl ?? session.user.image,
        },
      });

      toast.success("Profile updated (saved to database).");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">Edit Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your name and profile photo.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
              Name
            </label>
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
              Put your photo here within 48 hours of registration and use real
              photo or account will be terminated.
            </p>

            {/* quick preview */}
            {photoUrl.trim() && isValidHttpUrl(photoUrl.trim()) ? (
              <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-xs font-black uppercase text-gray-500 mb-2">
                  Preview
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl.trim()}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-2xl object-cover border border-gray-200"
                  onError={() => {
                    toast.error("Image preview failed. Check the URL.");
                  }}
                />
              </div>
            ) : null}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className={`w-full text-white py-3 rounded-2xl font-black transition-all shadow-lg shadow-red-200 ${
              saving ? "bg-gray-300 cursor-not-allowed" : "bg-[#E31E24] hover:bg-red-700"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
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
