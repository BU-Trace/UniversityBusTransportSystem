'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Save,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { MdPerson } from 'react-icons/md';
import Image from 'next/image';

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

export default function EditProfilePage() {
  const { data: session, update, status } = useSession();
  const { refreshUser } = useUser();

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
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

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
        return;
      }

      setSaving(true);
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
      await update({
        ...session,
        user: {
          ...session.user,
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
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

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
        </p>
      </motion.div>

      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Section: Profile Info */}
        <div className="lg:col-span-7">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden p-6 md:p-10 lg:p-12 h-full">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-brick-500 rounded-full" />
              General Profile
            </h2>

            <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-[0.2em] ml-2">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 md:p-5 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold"
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
                      className="w-full p-4 md:p-5 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold"
                      placeholder="License number"
                    />
                  </div>
                )}

                <button
                  onClick={saveProfile}
                  disabled={saving || uploading}
                  className="w-full py-4 md:py-5 rounded-2xl font-black text-white bg-brick-500 hover:bg-brick-600 disabled:opacity-50 transition-all shadow-xl shadow-brick-500/10 flex justify-center items-center gap-3 text-xs uppercase tracking-widest border border-white/10 mt-4"
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

              <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.03)] relative group transition-all duration-300 hover:border-white/20">
                {/* Avatar Container */}
                <div
                  className="relative w-48 h-48 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-white/10 shadow-2xl flex items-center justify-center cursor-pointer group/avatar transition-all duration-500 hover:scale-105 hover:border-brick-500/50 hover:shadow-brick-500/20"
                  onClick={() => fileRef.current?.click()}
                >
                  {previewUrl || currentPhoto ? (
                    <>
                      <Image
                        src={previewUrl || currentPhoto}
                        alt="Profile preview"
                        fill
                        className="object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                        unoptimized
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                        <Camera
                          className="text-white mb-2 shadow-2xl transition-transform group-hover/avatar:scale-110"
                          size={32}
                        />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest text-shadow-sm">
                          Update
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <MdPerson className="text-brick-500/40 text-7xl relative z-0 transition-transform duration-700 group-hover/avatar:scale-110" />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                        <Upload
                          className="text-white mb-2 transition-transform group-hover/avatar:scale-110"
                          size={32}
                        />
                        <span className="text-white text-[10px] font-black uppercase tracking-widest text-shadow-sm">
                          Upload
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions & Hidden Input */}
                <div className="flex items-center gap-3 mt-8 relative z-10">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex text-white bg-gradient-to-r from-brick-500 to-brick-600 px-6 py-3.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg hover:shadow-brick-500/30 items-center justify-center gap-2"
                  >
                    <Upload size={16} /> Upload New
                  </button>

                  {previewUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="flex text-gray-400 bg-white/5 px-4 py-3.5 rounded-xl hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 items-center justify-center hover:scale-105"
                      title="Cancel Preview"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                  {currentPhoto && !previewUrl && (
                    <button
                      type="button"
                      onClick={() => setCurrentPhoto('')}
                      className="flex text-red-500/70 bg-red-500/10 px-4 py-3.5 rounded-xl hover:text-red-400 hover:bg-red-500/20 transition-all border border-transparent hover:border-red-500/30 items-center justify-center hover:scale-105"
                      title="Remove Photo"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Security / Change Password */}
        <div className="lg:col-span-5">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl p-6 md:p-10 flex flex-col h-full grow">
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
                    className="w-full px-6 p-4 pl-12 pr-12 md:p-5 md:pl-14 md:pr-14 rounded-2xl border border-white/5 bg-white/5 px-6 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all"
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
                    className="w-full px-6 p-4 pl-12 pr-12 md:p-5 md:pl-14 md:pr-14 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all"
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
                    className="w-full  px-6 p-4 pl-12 pr-12 md:p-5 md:pl-14 md:pr-14 rounded-2xl border border-white/5 bg-white/5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all "
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={changingPass}
                className="w-full py-4 md:py-5 rounded-2xl font-black text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-all border border-white/5 flex justify-center items-center gap-3 text-xs uppercase tracking-widest mt-4 group"
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

            <div className="mt-8 pt-8 border-t border-white/5">
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest block text-center w-full"
              >
                Cancel & Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
