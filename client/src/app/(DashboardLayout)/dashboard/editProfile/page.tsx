'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Save, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { MdPerson } from 'react-icons/md';
import Image from 'next/image';

<<<<<<< HEAD
import React, { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
=======
type UserRole = 'driver' | 'admin' | 'superadmin';

interface CloudinaryResponse {
  secure_url?: string;
  error?: { message: string };
}

interface UserUpdateBody {
  name: string;
  profileImage: string;
  clientInfo: {
    licenseNumber?: string;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const CLOUD_NAME = 'dpiofecgs';
const UPLOAD_PRESET = 'butrace';

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(url, { method: 'POST', body: form });
  const data = (await res.json().catch(() => ({}))) as CloudinaryResponse;

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Cloudinary upload failed');
  }
  if (!data.secure_url) {
    throw new Error('Upload succeeded but no secure_url returned');
  }

  return data.secure_url;
}

function isValidImageFile(file: File): boolean {
  const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  return okTypes.includes(file.type) || file.type.startsWith('image/');
}
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207

export default function EditProfilePage() {
  const { data: session, update, status } = useSession();
  const { refreshUser } = useUser();

<<<<<<< HEAD
  const [name, setName] = useState(session?.user?.name || "");
=======
  // Profile fields
  const [name, setName] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string>('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility state
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

<<<<<<< HEAD
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
=======
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setLicenseNumber(session.user.clientInfo?.licenseNumber ?? '');
      setRole(session.user.role as UserRole);
      setCurrentPhoto(
        session.user.photoUrl ?? session.user.profileImage ?? session.user.image ?? ''
      );
    }
  }, [session]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!isValidImageFile(file)) {
      toast.error('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image is too large (max 3MB).');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const saveProfile = async () => {
    try {
      if (status !== 'authenticated' || !session?.user) {
        toast.error('Please login again.');
        return;
      }

      const token = session.accessToken;
      if (!token) {
        toast.error('No access token found.');
        return;
      }

      const cleanName = name.trim();
      if (!cleanName) {
        toast.error('Name is required.');
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
        return;
      }

      setSaving(true);
<<<<<<< HEAD

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

=======
      let uploadedPhotoUrl = currentPhoto;

      if (selectedFile) {
        setUploading(true);
        toast.message('Uploading photo...');
        uploadedPhotoUrl = await uploadToCloudinary(selectedFile);
        setUploading(false);
      }

      const body: UserUpdateBody = {
        name: cleanName,
        profileImage: uploadedPhotoUrl,
        clientInfo: {},
      };

      if (role === 'driver') {
        body.clientInfo.licenseNumber = licenseNumber.trim();
      }

      const res = await fetch(`${BASE_URL}/user/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Failed to update profile.');

      const updatedData = json.data;
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
      await update({
        user: {
          ...session.user,
<<<<<<< HEAD
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
=======
          name: updatedData.name,
          image: updatedData.photoUrl,
          photoUrl: updatedData.photoUrl,
          profileImage: updatedData.photoUrl,
          clientInfo: updatedData.clientInfo,
        },
      });

      setCurrentPhoto(updatedData.photoUrl ?? '');
      setSelectedFile(null);
      await refreshUser();
      toast.success('Profile updated successfully.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update profile');
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const handleChangePassword = async () => {
    try {
      if (!oldPassword || !newPassword || !confirmPassword) {
        toast.error('Please fill all password fields.');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }

      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters.');
        return;
      }

      setChangingPass(true);
      const token = session?.accessToken;

      const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Failed to change password.');

      toast.success('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      const error = e as Error;
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
          Account Settings
        </h1>
        <p className="text-gray-400 text-sm font-medium leading-relaxed">
          Manage your profile information and security settings.
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
        </p>
      </motion.div>

<<<<<<< HEAD
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
=======
      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Profile Info */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden p-8 md:p-12">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-brick-500 rounded-full" />
              General Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-[0.2em] ml-2">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-5 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold"
                    placeholder="Enter your name"
                  />
                </div>

                {role === 'driver' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-[0.2em] ml-2">
                      License Number
                    </label>
                    <input
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full p-5 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold"
                      placeholder="License number"
                    />
                  </div>
                )}

                <button
                  onClick={saveProfile}
                  disabled={saving || uploading}
                  className="w-full py-5 rounded-2xl font-black text-white bg-brick-500 hover:bg-brick-600 disabled:opacity-50 transition-all shadow-xl shadow-brick-500/10 flex justify-center items-center gap-3 text-xs uppercase tracking-widest border border-white/10 mt-4"
                >
                  {uploading ? (
                    'Uploading...'
                  ) : saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save size={18} /> Confirm Update
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col items-center justify-center p-6 rounded-[2.5rem] bg-gray-900/50 border border-white/5 relative group">
                <div className="relative w-40 h-40 rounded-[2.5rem] border-4 border-white/10 overflow-hidden bg-white/5 shadow-2xl flex items-center justify-center mb-6">
                  {previewUrl || currentPhoto ? (
                    <Image
                      src={previewUrl || currentPhoto}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <MdPerson className="text-brick-400 text-6xl opacity-80" />
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-white bg-white/5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                  Change Photo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            </div>
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
          </div>
        </div>

<<<<<<< HEAD
          {/* PHOTO */}
          <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase text-gray-600">
                  Profile Photo
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  JPG / PNG / WEBP
=======
        {/* Right Section: Security / Change Password */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl p-8 md:p-10 flex flex-col h-full grow">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-brick-500 rounded-full" />
              Security
            </h2>

            <div className="space-y-6 flex-grow">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-[0.2em] ml-2">
                  Current Password
                </label>
                <div className="relative group/field">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/field:text-brick-500 transition-colors"
                    size={20}
                  />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full p-5 pl-14 pr-14 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-[0.2em] ml-2">
                  New Password
                </label>
                <div className="relative group/field">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/field:text-brick-500 transition-colors"
                    size={20}
                  />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-5 pl-14 pr-14 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-[0.2em] ml-2">
                  Confirm New Password
                </label>
                <div className="relative group/field">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/field:text-brick-500 transition-colors"
                    size={20}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-5 pl-14 pr-14 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all "
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
                </div>
              </div>

              <button
<<<<<<< HEAD
                type="button"
                onClick={pickFile}
                disabled={saving || uploading}
                className={`px-4 py-2 rounded-xl font-black text-xs ${saving || uploading
                  ? "bg-gray-200 text-gray-500"
                  : "bg-[#E31E24] text-white hover:bg-red-700"
                  }`}
=======
                onClick={handleChangePassword}
                disabled={changingPass}
                className="w-full py-5 rounded-2xl font-black text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-all border border-white/5 flex justify-center items-center gap-3 text-xs uppercase tracking-widest mt-4 group"
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
              >
                {changingPass ? (
                  'Changing...'
                ) : (
                  <>
                    Update Password{' '}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>

<<<<<<< HEAD
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
=======
            <div className="mt-8 pt-8 border-t border-white/5">
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest block text-center w-full"
              >
                Cancel & Go Back
              </button>
            </div>
          </div>
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
        </div>
      </div>
    </div>
  );
}
