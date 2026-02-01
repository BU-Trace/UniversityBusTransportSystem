"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type UserRole = "student" | "driver" | "admin" | "superadmin";

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

const CLOUD_NAME = "dpiofecgs";
const UPLOAD_PRESET = "butrace";

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: any };

  if (!res.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }
  if (!data.secure_url) {
    throw new Error("Upload succeeded but no secure_url returned");
  }

  return data.secure_url;
}

function isValidImageFile(file: File): boolean {
  const okTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  return okTypes.includes(file.type) || file.type.startsWith("image/");
}

export default function EditProfilePage() {
  const { data: session, update, status } = useSession();

  const [name, setName] = useState<string>("");

  const [currentPhoto, setCurrentPhoto] = useState<string>("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      const photo = session.user.photoUrl ?? session.user.image ?? "";
      setCurrentPhoto(photo);
    }
  }, [session]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const pickFile = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!isValidImageFile(file)) {
      toast.error("Please select a valid image file (jpg, jpeg, png, webp).");
      e.target.value = "";
      return;
    }

    const maxBytes = 3 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("Image is too large. Please use a file under 3MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

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

      const cleanName = name.trim();
      if (!cleanName) {
        toast.error("Name is required.");
        return;
      }

      setSaving(true);

      let uploadedPhotoUrl = currentPhoto;

      if (selectedFile) {
        setUploading(true);
        toast.message("Uploading photo...");
        uploadedPhotoUrl = await uploadToCloudinary(selectedFile);
        setUploading(false);
      }

      const res = await fetch(`${BASE_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: cleanName,
          photoUrl: uploadedPhotoUrl, 
        }),
      });

      const json: UpdateProfileResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || "Failed to update profile on server.");
      }

      const serverName = json.data?.name ?? cleanName;
      const serverPhoto = json.data?.photoUrl ?? uploadedPhotoUrl;

      await update({
        ...session,
        user: {
          ...session.user,
          name: serverName,
          photoUrl: serverPhoto ?? undefined,
          image: serverPhoto ?? session.user.image,
        },
      });

      setCurrentPhoto(serverPhoto ?? "");
      setSelectedFile(null);

      toast.success("Profile updated and saved to database.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">Edit Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your name and upload your profile photo (jpg/png/webp).
        </p>

        <div className="mt-6 space-y-5">
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

          <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase text-gray-600">Profile Photo</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Upload within 48 hours of registration. Use a real photo.
                </div>
              </div>

              <button
                type="button"
                onClick={pickFile}
                disabled={saving || uploading}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
                  saving || uploading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#E31E24] text-white hover:bg-red-700 shadow-lg shadow-red-200"
                }`}
              >
                {selectedFile ? "Change Photo" : "Choose Photo"}
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || currentPhoto || "https://th.bing.com/th/id/R.b42d077f7608ecfe94a08b5d4213eb66?rik=0hx9eqp4xZnIiQ&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f0%2fb%2f5%2f175341.jpg&ehk=EG20ra9%2fkw8bRtQ5LCMLWYQ4lE4GJ7WoUAw3QT7CP3s%3d&risl=&pid=ImgRaw&r=0"}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                {selectedFile ? (
                  <>
                    <div className="text-sm font-black text-gray-900 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">
                    {currentPhoto ? "Current photo will be kept." : "No photo selected yet."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving || uploading}
            className={`w-full text-white py-3 rounded-2xl font-black transition-all shadow-lg shadow-red-200 ${
              saving || uploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#E31E24] hover:bg-red-700"
            }`}
          >
            {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
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
