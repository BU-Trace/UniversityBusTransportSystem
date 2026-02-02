"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function EditProfilePage() {
  const { data: session, update, status } = useSession();

  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const currentPhoto =
    session?.user?.photoUrl ||
    session?.user?.image ||
    "";

  // ---------------- FILE PICK ----------------
  const pickFile = () => {
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ---------------- CLOUDINARY UPLOAD ----------------
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET || "");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error("Image upload failed");

    return data.secure_url as string;
  };

  // ---------------- SAVE ----------------
  const save = async () => {
    try {
      if (status !== "authenticated") {
        toast.error("Please login again.");
        return;
      }

      if (!name.trim()) {
        toast.error("Name is required.");
        return;
      }

      const token = session?.accessToken;
      if (!token) {
        toast.error("No access token found.");
        return;
      }

      setSaving(true);

      let finalPhoto = currentPhoto;

      if (selectedFile) {
        setUploading(true);
        toast.message("Uploading photo...");
        finalPhoto = await uploadToCloudinary(selectedFile);
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
          name: name.trim(),
          photoUrl: finalPhoto,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Profile update failed");
      }

      await update({
        user: {
          ...session.user,
          name: json?.data?.name || name.trim(),
          photoUrl: json?.data?.photoUrl || finalPhoto,
        },
      });

      toast.success("Profile updated successfully");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: unknown) {
      const errMsg =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      toast.error(errMsg || "Something went wrong");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // ---------------- CLEANUP ----------------
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">Edit Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your name and profile photo.
        </p>

        <div className="mt-6 space-y-5">
          {/* NAME */}
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

          {/* PHOTO */}
          <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase text-gray-600">
                  Profile Photo
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  JPG / PNG / WEBP
                </div>
              </div>

              <button
                type="button"
                onClick={pickFile}
                disabled={saving || uploading}
                className={`px-4 py-2 rounded-xl font-black text-xs ${saving || uploading
                  ? "bg-gray-200 text-gray-500"
                  : "bg-[#E31E24] text-white hover:bg-red-700"
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
              <div className="w-24 h-24 rounded-2xl border bg-white overflow-hidden relative">
                <Image
                  src={previewUrl || currentPhoto || "https://via.placeholder.com/150"}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="96px"
                  priority
                />
              </div>

              <div className="text-sm text-gray-600">
                {selectedFile
                  ? selectedFile.name
                  : currentPhoto
                    ? "Current photo will be kept"
                    : "No photo selected"}
              </div>
            </div>
          </div>

          {/* SAVE */}
          <button
            onClick={save}
            disabled={saving || uploading}
            className={`w-full py-3 rounded-2xl font-black text-white ${saving || uploading ? "bg-gray-300" : "bg-[#E31E24] hover:bg-red-700"
              }`}
          >
            {uploading ? "Uploading..." : saving ? "Saving..." : "Save Changes"}
          </button>

          {/* BACK */}
          <button
            onClick={() => window.history.back()}
            className="w-full bg-[#E31E24] text-white py-3 rounded-2xl font-black hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
