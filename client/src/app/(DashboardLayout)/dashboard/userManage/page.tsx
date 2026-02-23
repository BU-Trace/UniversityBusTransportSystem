'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  BadgeCheck,
  Search,
  Upload,
  X,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Bus,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import ConfirmationModal from '@/components/shared/ConfirmationModal';

type UserRole = 'driver' | 'admin';
// type StaffRole = 'admin' | 'superadmin';

interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  licenseNumber?: string;

  photoUrl?: string;
  approvalLetterUrl?: string;

  assignedBusId?: string;
  assignedBusName?: string;

  password?: string;
  needPasswordChange?: boolean;

  createdAt?: string;
}

interface IBusLite {
  id: string;
  name: string;
  plateNumber: string;
}

type ApiFetchOptions = RequestInit & { headers?: Record<string, string> };

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

type ApiResponse<T> = {
  data?: T;
  message?: string;
  success?: boolean;
  accessToken?: string;
};

type RawBus = {
  _id?: string;
  id?: string;
  name?: string;
  plateNumber?: string;
};

type RawUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  licenseNumber?: string;
  clientInfo?: {
    licenseNumber?: string;
  };
  profileImage?: string;
  photoUrl?: string;
  photo?: string;
  approvalLetter?: string;
  approvalLetterUrl?: string;
  assignedBus?: string;
  assignedBusId?: string;
  assignedBusName?: string;
  createdAt?: string;
};

function joinUrl(pathOrUrl: string) {
  const isFullUrl = /^https?:\/\//i.test(pathOrUrl);
  if (isFullUrl) return pathOrUrl;
  return `${BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Something went wrong';
  }
}

function isTokenExpiredMessage(message?: string) {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes('token has expired') || m.includes('jwt expired') || m.includes('expired');
}

/**
 * Cookie-based refresh. Backend must read refresh token from cookie.
 * Should return: { data: { accessToken: "..." } } (or similar)
 */
async function refreshAccessToken(): Promise<string> {
  const res = await fetch(joinUrl('/auth/refresh-token'), {
    method: 'POST',
    credentials: 'include',
  });

  const json = (await res.json().catch(() => ({}))) as ApiResponse<{ accessToken?: string }>;
  if (!res.ok) {
    throw new Error(json?.message || 'Session expired. Please login again.');
  }

  const newToken: string | undefined = json?.data?.accessToken || json.accessToken;
  if (!newToken) {
    throw new Error('Refresh succeeded but no access token returned.');
  }

  return newToken;
}

/**
 * Main API helper: sends Authorization header using accessTokenRef.current
 * If expired -> refresh once -> retry once.
 */
async function apiFetchAuth<T>(
  pathOrUrl: string,
  options: ApiFetchOptions,
  accessTokenRef: React.MutableRefObject<string | undefined>
): Promise<T> {
  const url = joinUrl(pathOrUrl);

  const doFetch = async (token?: string) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    const json = (await res.json().catch(() => ({}))) as unknown;
    return { res, json };
  };

  // 1) first attempt with current token
  let { res, json } = await doFetch(accessTokenRef.current);

  // 2) if unauthorized and looks expired -> refresh and retry once
  if (!res.ok) {
    const unauthorized = res.status === 401 || res.status === 403;
    const msg = (json as { message?: string })?.message || '';

    if (unauthorized && isTokenExpiredMessage(msg)) {
      const newToken = await refreshAccessToken();
      accessTokenRef.current = newToken;

      const retry = await doFetch(newToken);
      res = retry.res;
      json = retry.json;
    }
  }

  if (!res.ok) {
    const message = (json as { message?: string })?.message;
    throw new Error(message || 'Request failed');
  }

  return json as T;
}

const CLOUD_NAME = 'dpiofecgs';
const UPLOAD_PRESET = 'butrace';

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('Cloudinary error:', data);
    throw new Error(data?.error?.message || 'Cloudinary upload failed');
  }
  return data.secure_url as string;
}

const API = {
  buses: `/bus/get-all-buses`,

  usersAll: `/user/get-all-users`,
  userAdd: `/user/add-user`,
  userUpdate: (id: string) => `/user/update-user/${id}`,
  userDelete: (id: string) => `/user/delete-user/${id}`,
};

function prettyRole(role: UserRole) {
  if (role === 'driver') return 'Driver';
  return 'Admin';
}

function safeOpen(url?: string) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </motion.div>
  );
}

function HeaderModal({
  title,
  onClose,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="p-8 border-b border-white/5 flex justify-between items-start gap-4 sticky top-0 bg-gray-900/50 backdrop-blur-3xl z-10">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
      <button
        onClick={onClose}
        className="p-3 bg-white/5 text-gray-400 rounded-2xl hover:bg-brick-500 hover:text-white transition-all shadow-lg border border-white/10"
      >
        <X size={24} />
      </button>
    </div>
  );
}
export default function UserManagementPage() {
  const { data: session } = useSession();

  // const staffRole = toStaffRole(session?.user?.role ?? null);

  const accessTokenFromSession = session?.accessToken;

  // keep latest access token in ref so refresh can update it
  const accessTokenRef = useRef<string | undefined>(accessTokenFromSession);

  useEffect(() => {
    accessTokenRef.current = accessTokenFromSession;
  }, [accessTokenFromSession]);

  const [mounted, setMounted] = useState(false);

  // tabs
  const [activeTab, setActiveTab] = useState<UserRole>('driver');

  // data
  const [users, setUsers] = useState<IUser[]>([]);
  const [buses, setBuses] = useState<IBusLite[]>([]);

  // search
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const roleUsers = users.filter((u) => u.role === activeTab);
    if (!q) return roleUsers;

    return roleUsers.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.licenseNumber || '').toLowerCase().includes(q) ||
        (u.assignedBusName || '').toLowerCase().includes(q)
      );
    });
  }, [users, activeTab, query]);

  // modal add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<IUser>>({
    role: 'driver',
    name: '',
    email: '',
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lock = isModalOpen;
    document.body.style.overflow = lock ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const loadBuses = async () => {
    try {
      const json = await apiFetchAuth<ApiResponse<RawBus[]>>(
        API.buses,
        { method: 'GET' },
        accessTokenRef
      );
      const busList = (json.data || []).map((b) => ({
        id: b._id || b.id || '',
        name: b.name || '',
        plateNumber: b.plateNumber || '',
      }));
      setBuses(busList);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const loadUsers = async () => {
    try {
      const json = await apiFetchAuth<ApiResponse<RawUser[]>>(
        API.usersAll,
        { method: 'GET' },
        accessTokenRef
      );

      const list: IUser[] = (json.data || []).map((u) => ({
        id: u._id || u.id || '',
        name: u.name || '',
        email: u.email || '',
        role: u.role || 'driver',
        licenseNumber: u.licenseNumber || u.clientInfo?.licenseNumber,
        photoUrl: u.profileImage || u.photoUrl || u.photo,
        assignedBusId: u.assignedBus || u.assignedBusId,
        assignedBusName: u.assignedBusName,
        createdAt: u.createdAt,
      }));

      setUsers(list);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  useEffect(() => {
    if (!mounted) return;
    loadBuses();
    loadUsers();
  }, [mounted]);

  const openAdd = () => {
    setModalType('add');
    setSelectedId(null);
    setForm({
      role: activeTab,
      name: '',
      email: '',
      licenseNumber: '',
      photoUrl: '',
      assignedBusId: '',
      assignedBusName: '',
      password: '',
      needPasswordChange: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (u: IUser) => {
    setModalType('edit');
    setSelectedId(u.id);
    setForm({ ...u });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const id = userToDelete;
    setIsDeleteModalOpen(false);
    setUserToDelete(null);

    try {
      await apiFetchAuth<ApiResponse<null>>(
        API.userDelete(id),
        { method: 'DELETE' },
        accessTokenRef
      );
      setUsers((prev) => prev.filter((x) => x.id !== id));
      toast.success('User deleted successfully.');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const requireDocs = form.role === 'admin' || form.role === 'driver';

  const pickPhoto = () => photoRef.current?.click();

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const url = await uploadToCloudinary(file);
      setForm((p) => ({ ...p, photoUrl: url }));
      toast.success('Photo uploaded.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.role) return toast.error('Role is required.');
    if (!form.name?.trim()) return toast.error('Name is required.');
    if (!form.email?.trim()) return toast.error('Email is required.');

    if (form.role === 'driver' && !form.licenseNumber?.trim()) {
      return toast.error('License number is required for drivers.');
    }

    if (modalType === 'add' && requireDocs) {
      // Photo is now optional for admin/driver
      // approvalLetter is now optional
    }

    if (form.role === 'driver' && !form.assignedBusId) {
      return toast.error('Please assign a bus to this driver.');
    }

    if (uploadingPhoto) return toast.error('Wait for uploads to finish.');

    // IMPORTANT: match your backend expected structure (you were using studentId/licenseNumber)
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,

      password: form.password?.trim() || undefined,
      needPasswordChange: form.needPasswordChange,

      clientInfo: {
        licenseNumber: form.role === 'driver' ? form.licenseNumber?.trim() : undefined,
      },

      profileImage: requireDocs ? form.photoUrl || undefined : undefined,

      assignedBus: form.role === 'driver' ? form.assignedBusId : undefined,
      assignedBusName:
        form.role === 'driver' ? buses.find((b) => b.id === form.assignedBusId)?.name : undefined,
    };

    try {
      toast.message('Saving to server...');

      if (modalType === 'edit') {
        const json = await apiFetchAuth<ApiResponse<RawUser>>(
          API.userUpdate(selectedId as string),
          { method: 'PUT', body: JSON.stringify(payload) },
          accessTokenRef
        );

        const updated: IUser = {
          id: json.data?._id || json.data?.id || (selectedId as string),
          name: json.data?.name || '',
          email: json.data?.email || '',
          role: json.data?.role || form.role || 'driver',
          licenseNumber: json.data?.licenseNumber || json.data?.clientInfo?.licenseNumber,
          photoUrl: json.data?.profileImage || json.data?.photoUrl || json.data?.photo,
          approvalLetterUrl: json.data?.approvalLetter || json.data?.approvalLetterUrl,
          assignedBusId: json.data?.assignedBus || json.data?.assignedBusId,
          assignedBusName: json.data?.assignedBusName,
          createdAt: json.data?.createdAt,
        };

        setUsers((prev) => prev.map((x) => (x.id === selectedId ? updated : x)));
        toast.success('User updated successfully.');
      } else {
        const json = await apiFetchAuth<ApiResponse<RawUser>>(
          API.userAdd,
          { method: 'POST', body: JSON.stringify(payload) },
          accessTokenRef
        );

        const created: IUser = {
          id: json.data?._id || json.data?.id || '',
          name: json.data?.name || '',
          email: json.data?.email || '',
          role: json.data?.role || form.role || 'driver',
          licenseNumber: json.data?.licenseNumber || json.data?.clientInfo?.licenseNumber,
          photoUrl: json.data?.profileImage || json.data?.photoUrl || json.data?.photo,
          approvalLetterUrl: json.data?.approvalLetter || json.data?.approvalLetterUrl,
          assignedBusId: json.data?.assignedBus || json.data?.assignedBusId,
          assignedBusName: json.data?.assignedBusName,
          createdAt: json.data?.createdAt,
        };

        setUsers((prev) => [...prev, created]);
        toast.success('User added successfully.');
      }

      setIsModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12">
      {/* Page Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            User Management
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">
            Manage Drivers and Admins
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="relative flex-1 w-full group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brick-400 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-4 rounded-3xl border border-white/5 bg-white/5 text-white shadow-2xl outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-medium placeholder:text-gray-600"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={openAdd}
            className="flex-1 w-full bg-brick-500 text-white px-8 py-5 rounded-4xl font-black text-xs uppercase tracking-widest hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/30 flex items-center justify-center gap-3 border border-white/10"
          >
            <Plus size={20} /> Add User
          </button>
        </div>
      </div>

      {/* Custom Tab Switcher */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-2 mb-8 flex flex-wrap gap-2 shadow-2xl">
        {[
          { id: 'driver', label: 'Drivers', icon: Bus },
          ...(session?.user?.role?.toLowerCase() === 'superadmin'
            ? [{ id: 'admin', label: 'Admins', icon: ShieldCheck }]
            : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as UserRole)}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-4xl font-black text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-brick-500 text-white shadow-2xl shadow-brick-500/30 border border-white/10'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List Container */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden min-h-[520px] flex flex-col relative">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-xl text-white uppercase tracking-wider flex items-center gap-3">
            <Users className="text-brick-400" size={28} /> {prettyRole(activeTab)} List
          </h3>
          <div className="text-xs font-black text-gray-500 tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10">
            TOTAL: <span className="text-brick-400 ml-1">{filteredUsers.length}</span>
          </div>
        </div>

        <div className="p-8 overflow-x-auto custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-24">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-brick-500/10 flex items-center justify-center mb-6 text-brick-500">
                <Users size={32} />
              </div>
              <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
                No users found
              </h4>
              <p className="text-gray-500 font-medium">
                Add a new user or check your search query.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-8 pl-8">Photo</th>
                  <th className="pb-8 min-w-[150px]">Name</th>
                  <th className="pb-8 hidden lg:table-cell">Email</th>
                  <th className="pb-8 hidden sm:table-cell">Role Details</th>
                  {activeTab === 'driver' && (
                    <th className="pb-8 hidden xl:table-cell">Assigned Bus</th>
                  )}
                  <th className="pb-8 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all group"
                  >
                    <td className="py-8 pl-8">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl">
                        {u.photoUrl ? (
                          <Image
                            src={u.photoUrl}
                            alt={u.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Users size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-8">
                      <div className="font-black text-white group-hover:text-brick-400 transition-colors text-base tracking-tight">
                        {u.name}
                      </div>
                    </td>
                    <td className="py-8 font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase text-xs tracking-wider hidden lg:table-cell">
                      {u.email}
                    </td>
                    <td className="py-8 hidden sm:table-cell">
                      {u.role === 'driver' && (
                        <div className="text-xs font-bold text-gray-300">
                          License:{' '}
                          <span className="text-white bg-brick-500/10 px-3 py-1 rounded-lg border border-brick-500/30 ml-2">
                            {u.licenseNumber || '—'}
                          </span>
                        </div>
                      )}
                      {u.role === 'admin' && (
                        <div className="text-[10px] font-black text-brick-400 uppercase tracking-[0.2em] bg-brick-500/10 px-4 py-1.5 rounded-full border border-brick-500/20 inline-block shadow-inner">
                          System Admin
                        </div>
                      )}
                    </td>

                    {activeTab === 'driver' && (
                      <td className="py-8 hidden xl:table-cell">
                        <span className="text-xs font-black text-brick-400 px-4 py-1.5 rounded-full bg-brick-500/10 border border-brick-500/30 shadow-inner">
                          {u.assignedBusName || 'Not Assigned'}
                        </span>
                      </td>
                    )}

                    <td className="py-8 text-right pr-8">
                      <div className="flex justify-end gap-3 transition-all duration-500">
                        {/* Only superadmin can edit/delete admins. Admins can manage drivers. */}
                        {(session?.user?.role?.toLowerCase() === 'superadmin' ||
                          u.role !== 'admin') && (
                          <>
                            <button
                              onClick={() => openEdit(u)}
                              className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-brick-500 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
                            >
                              <Pencil size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(u.id)}
                              className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
                            >
                              <Trash2 size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-3xl rounded-[3rem] shadow-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar"
            >
              <HeaderModal
                title={`${modalType === 'add' ? 'Add' : 'Update'} ${
                  prettyRole(form.role as UserRole) || 'User'
                }`}
                subtitle="Fill the same fields as registration. Admin/Driver require documents."
                onClose={() => setIsModalOpen(false)}
              />

              <form onSubmit={saveUser} className="p-8 space-y-6">
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 mb-3 block tracking-widest px-1">
                    Role
                  </label>
                  <select
                    value={form.role}
                    disabled={modalType === 'edit'}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;
                      setForm((p) => ({
                        ...p,
                        role,
                        licenseNumber: role === 'driver' ? p.licenseNumber : '',
                        assignedBusId: role === 'driver' ? p.assignedBusId : '',
                        assignedBusName: role === 'driver' ? p.assignedBusName : '',
                      }));
                    }}
                    className={`w-full p-4 rounded-2xl border outline-none transition-all font-black ${
                      modalType === 'edit'
                        ? 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 text-white focus:border-brick-500 focus:ring-4 focus:ring-brick-500/10'
                    }`}
                  >
                    <option value="driver" className="bg-gray-900">
                      Driver
                    </option>
                    {session?.user?.role?.toLowerCase() === 'superadmin' && (
                      <option value="admin" className="bg-gray-900">
                        Admin
                      </option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black uppercase text-gray-500 mb-3 block tracking-widest px-1">
                      Full Name
                    </label>
                    <input
                      required
                      value={form.name || ''}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full p-4 rounded-2xl border border-white/10 outline-none focus:border-brick-500 focus:ring-4 focus:ring-brick-500/10 bg-white/5 text-white font-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-gray-500 mb-3 block tracking-widest px-1">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      disabled={modalType === 'edit'}
                      value={form.email || ''}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className={`w-full p-4 rounded-2xl border outline-none transition-all font-black ${
                        modalType === 'edit'
                          ? 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 text-white focus:border-brick-500 focus:ring-4 focus:ring-brick-500/10'
                      }`}
                    />
                  </div>
                </div>

                {modalType === 'add' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-3 block tracking-widest px-1">
                        Initial Password
                      </label>
                      <div className="relative group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Leave blank for auto-generate"
                          value={form.password || ''}
                          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                          className="w-full p-4 pr-12 rounded-2xl border border-white/10 outline-none focus:border-brick-500 focus:ring-4 focus:ring-brick-500/10 bg-white/5 text-white font-black transition-all placeholder:text-gray-600 placeholder:text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brick-400 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-end pb-1 px-1">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={form.needPasswordChange}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, needPasswordChange: e.target.checked }))
                            }
                            className="peer sr-only"
                          />
                          <div className="w-12 h-6 bg-white/5 border border-white/10 rounded-full transition-all peer-checked:bg-brick-500/20 peer-checked:border-brick-500/50"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full transition-all peer-checked:left-7 peer-checked:bg-brick-500"></div>
                        </div>
                        <span className="text-xs font-black uppercase text-gray-500 group-hover:text-gray-300 transition-colors tracking-widest">
                          Force Password Change
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {form.role === 'driver' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-3 block tracking-widest px-1">
                        License Number
                      </label>
                      <input
                        required
                        value={form.licenseNumber || ''}
                        onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                        className="w-full p-4 rounded-2xl border border-white/10 outline-none focus:border-brick-500 focus:ring-4 focus:ring-brick-500/10 bg-white/5 text-white font-black transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-3 block tracking-widest px-1">
                        Assign Bus
                      </label>
                      <select
                        value={form.assignedBusId || ''}
                        onChange={(e) => {
                          const id = e.target.value;
                          const bus = buses.find((b) => b.id === id);
                          setForm((p) => ({
                            ...p,
                            assignedBusId: id || undefined,
                            assignedBusName: bus ? `${bus.name} (${bus.plateNumber})` : undefined,
                          }));
                        }}
                        className="w-full p-4 rounded-2xl border border-white/10 outline-none focus:border-brick-500 focus:ring-4 focus:ring-brick-500/10 bg-white/5 text-white font-black transition-all"
                      >
                        <option value="" className="bg-gray-900">
                          -- Select a Bus --
                        </option>
                        {buses.map((b) => (
                          <option key={b.id} value={b.id} className="bg-gray-900">
                            {b.name} ({b.plateNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {(form.role === 'admin' || form.role === 'driver') && (
                  <div className="rounded-3xl border border-white/5 overflow-hidden bg-white/5">
                    <div className="p-6 border-b border-white/5 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-black uppercase text-gray-400 flex items-center gap-2 tracking-widest">
                          <BadgeCheck size={16} className="text-brick-500" />
                          Photo (Optional)
                        </div>
                        <div className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">
                          {modalType === 'add'
                            ? 'Profile photo is optional for verification.'
                            : 'Existing photo will be kept unless you upload a new one.'}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="rounded-2xl border border-white/10 p-5 bg-white/5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            Photo (Optional)
                          </div>
                          <button
                            type="button"
                            onClick={pickPhoto}
                            disabled={uploadingPhoto}
                            className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 transition-all uppercase tracking-widest ${
                              uploadingPhoto
                                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                : 'bg-brick-500 text-white hover:bg-brick-600 shadow-lg shadow-brick-500/20'
                            }`}
                          >
                            <Upload size={14} /> {uploadingPhoto ? '...' : 'Upload'}
                          </button>
                          <input
                            ref={photoRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onPhotoChange}
                          />
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-4">
                          <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center">
                            {uploadingPhoto && (
                              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                                <div className="w-6 h-6 border-2 border-brick-500 border-t-transparent rounded-full animate-spin" />
                                <div className="text-[8px] font-black text-brick-400 uppercase tracking-widest animate-pulse">
                                  Uploading
                                </div>
                              </div>
                            )}

                            {form.photoUrl ? (
                              <div className="w-full h-full relative group">
                                <Image
                                  width={100}
                                  height={100}
                                  src={form.photoUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10">
                                  <button
                                    type="button"
                                    onClick={() => safeOpen(form.photoUrl)}
                                    className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-brick-500 transition-all shadow-xl"
                                  >
                                    <Search size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-600 italic text-[10px]">
                                {uploadingPhoto ? '' : 'No Preview'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 rounded-3xl font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingPhoto}
                    className={`flex-1 py-5 rounded-3xl font-black text-white transition-all shadow-2xl flex justify-center items-center gap-3 text-sm uppercase tracking-widest border border-white/10 ${
                      uploadingPhoto
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed border-white/5'
                        : 'bg-brick-500 hover:bg-brick-600 shadow-brick-500/20'
                    }`}
                  >
                    <Save size={18} />
                    {modalType === 'add' ? 'Create User' : 'Update User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to permanently delete this user? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
