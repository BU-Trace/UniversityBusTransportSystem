'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Bus,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Upload,
  Search,
  Image as ImageIcon,
  MapPin,
  Clock,
  Home,
} from 'lucide-react';

import {
  MdDashboard,
  MdDirectionsBus,
  MdPeople,
  MdMap,
  MdNotifications,
  MdLogout,
  MdMenu,
  MdClose,
  MdEdit,
} from 'react-icons/md';

interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  activeHoursComing: string[];
  activeHoursGoing: string[];
}

interface BusData {
  id: string;
  name: string;
  plateNumber: string;
  routeId: string;
  routeName: string;

  activeHoursComing: string[];
  activeHoursGoing: string[];

  photo: string;
}

const initialRoutes: Route[] = [
  {
    id: '1',
    name: 'Route 1 (Nothullabad)',
    startPoint: 'Campus',
    endPoint: 'Nothullabad',
    activeHoursComing: ['08:00 AM - 10:00 AM'],
    activeHoursGoing: ['02:00 PM - 04:00 PM'],
  },
];

const initialBuses: BusData[] = [
  {
    id: '1',
    name: 'Baikali',
    plateNumber: 'DHK-METRO-KA-1234',
    routeId: '1',
    routeName: 'Route 1 (Nothullabad)',
    activeHoursComing: ['08:00 AM - 10:00 AM'],
    activeHoursGoing: ['02:00 PM - 04:00 PM'],
    photo:
      'https://th.bing.com/th/id/R.ffa99e6ef783e2154e18cc2aa9f3e873?rik=6Ic5jyNHg4Ht1w&pid=ImgRaw&r=0',
  },
];

const CLOUD_NAME = 'dpiofecgs';
const UPLOAD_PRESET = 'butrace';

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

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

export default function BusManagementOnlyPage() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const [routes] = useState<Route[]>(initialRoutes);
  const [buses, setBuses] = useState<BusData[]>(initialBuses);

  const [query, setQuery] = useState('');
  const filteredBuses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buses;
    return buses.filter((b) => {
      return (
        b.name.toLowerCase().includes(q) ||
        b.plateNumber.toLowerCase().includes(q) ||
        b.routeName.toLowerCase().includes(q)
      );
    });
  }, [buses, query]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [busForm, setBusForm] = useState<Partial<BusData>>({
    name: '',
    plateNumber: '',
    routeId: '',
  });

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen || isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isModalOpen]);

  const admin = { name: 'Admin 1', role: 'Admin' };

  const menuItems = [
    { label: 'Dashboard Overview', href: '/dashboard', icon: MdDashboard },
    { label: 'Bus Management', href: '/dashboard/busManage', icon: MdDirectionsBus },
    { label: 'User Management', href: '/dashboard/userManage', icon: MdPeople },
    { label: 'Route Management', href: '/dashboard/routeManage', icon: MdMap },
    { label: 'Notice Publish', href: '/dashboard/notice', icon: MdNotifications },
  ];

  const openAdd = () => {
    setModalType('add');
    setSelectedId(null);

    setBusForm({ name: '', plateNumber: '', routeId: '', photo: '' });

    setActiveHoursCount(1);
    setComingSlots(['']);
    setGoingSlots(['']);

    setIsModalOpen(true);
  };

  const openEdit = (bus: BusData) => {
    setModalType('edit');
    setSelectedId(bus.id);
    setBusForm({ ...bus });

    const count = Math.max(bus.activeHoursComing?.length || 1, bus.activeHoursGoing?.length || 1);
    setActiveHoursCount(count);
    setComingSlots(bus.activeHoursComing?.length ? bus.activeHoursComing : Array(count).fill(''));
    setGoingSlots(bus.activeHoursGoing?.length ? bus.activeHoursGoing : Array(count).fill(''));

    setIsModalOpen(true);
  };

  const handleActiveHoursCountChange = (count: number) => {
    const safeCount = Math.max(0, Math.min(20, Number.isFinite(count) ? count : 0));
    setActiveHoursCount(safeCount);

    setComingSlots((prev) => {
      const next = [...prev];
      while (next.length < safeCount) next.push('');
      return next.slice(0, safeCount);
    });

    setGoingSlots((prev) => {
      const next = [...prev];
      while (next.length < safeCount) next.push('');
      return next.slice(0, safeCount);
    });
  };

  const updateComingSlot = (idx: number, val: string) => {
    setComingSlots((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const updateGoingSlot = (idx: number, val: string) => {
    setGoingSlots((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus permanently?')) {
      setBuses((prev) => prev.filter((b) => b.id !== id));
      toast.success('Bus deleted successfully.');
    }
  };

  const [activeHoursCount, setActiveHoursCount] = useState<number>(1);
  const [comingSlots, setComingSlots] = useState<string[]>(['']);
  const [goingSlots, setGoingSlots] = useState<string[]>(['']);

  const handleBusRouteChange = (routeId: string) => {
    const selectedRoute = routes.find((r) => r.id === routeId);
    if (!selectedRoute) {
      setBusForm((p) => ({ ...p, routeId: '', routeName: '' }));
      return;
    }

    setBusForm((p) => ({
      ...p,
      routeId,
      routeName: selectedRoute.name,
    }));
  };

  const handlePickFile = () => fileRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.message('Uploading photo...');
      const url = await uploadToCloudinary(file);
      setBusForm((p) => ({ ...p, photo: url }));
      toast.success('Photo uploaded successfully.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Photo upload failed.';
      toast.error(message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!busForm.name?.trim()) return toast.error('Bus name is required.');
    if (!busForm.plateNumber?.trim()) return toast.error('Number plate is required.');
    if (!busForm.routeId) return toast.error('Please assign a route.');

    if (modalType === 'add' && !busForm.photo) {
      return toast.error('Bus photo is mandatory for new registration.');
    }

    if (uploading) return toast.error('Please wait, photo is uploading...');

    const finalComing = comingSlots.map((x) => x.trim()).filter(Boolean);
    const finalGoing = goingSlots.map((x) => x.trim()).filter(Boolean);

    if (activeHoursCount > 0) {
      if (finalComing.length !== activeHoursCount || finalGoing.length !== activeHoursCount) {
        return toast.error('Please fill all active hour fields.');
      }
    }

    const payload = {
      name: busForm.name.trim(),
      plateNumber: busForm.plateNumber.trim(),
      routeId: busForm.routeId,
      photo: busForm.photo,

      activeHoursComing: finalComing,
      activeHoursGoing: finalGoing,
    };

    try {
      toast.message('Saving to server...');

      if (modalType === 'edit') {
        if (!window.confirm('Update bus details?')) return;

        const res = await fetch(`/api/buses/${selectedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Update failed');

        setBuses((prev) => prev.map((b) => (b.id === selectedId ? data.bus : b)));
        toast.success('Bus updated successfully.');
      } else {
        const res = await fetch(`/api/buses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Create failed');

        setBuses((prev) => [...prev, data.bus]);
        toast.success('Bus added successfully.');
      }

      setIsModalOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Server save failed.';
      toast.error(message);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative font-sans text-gray-800">
      {}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#E31E24] text-white rounded-xl shadow-lg"
        >
          <MdMenu size={24} />
        </button>
      )}

      {}
      <AnimatePresence>
        {(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed lg:sticky top-0 left-0 z-50 bg-[#E31E24] text-white flex flex-col shadow-2xl w-full lg:w-72 h-screen overflow-hidden"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-4 left-4 p-2 rounded-md bg-white/20"
            >
              <MdClose size={24} />
            </button>

            <div className="p-6 flex flex-col items-center border-b border-white/10 mt-12 lg:mt-0">
              <h1 className="text-xl font-black mb-6 tracking-tight italic">
                CAMPUS<span className="text-white/70">CONNECT</span>
              </h1>
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold italic opacity-50">ADMIN</span>
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white text-[#E31E24] rounded-full shadow-md">
                  <MdEdit size={12} />
                </button>
              </div>
              <h2 className="font-bold text-base uppercase tracking-widest">{admin.name}</h2>
            </div>

            <nav className="flex-1 mt-4 px-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-white text-[#E31E24] shadow-md'
                      : 'hover:bg-white/10 text-white/90'
                  }`}
                >
                  <item.icon size={20} /> <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-white/10 mb-4 lg:mb-0">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-4 w-full px-18.5 py-3 hover:bg-white/10 rounded-xl font-bold transition-colors"
              >
                <MdLogout size={20} /> <span className="text-sm">Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full max-w-7xl mx-auto">
          {}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                Bus Management
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Register buses, upload photos, assign routes, and manage fleet.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by bus / plate / route..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>

              <button
                onClick={openAdd}
                className="bg-[#E31E24] text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} /> Register Bus
              </button>
            </div>
          </div>

          {}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden min-h-[520px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                <Bus size={20} className="text-[#E31E24]" />
                Fleet List
              </h3>
              <div className="text-xs font-bold text-gray-400">
                Total: <span className="text-gray-700">{filteredBuses.length}</span>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              {filteredBuses.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <Bus className="text-[#E31E24]" />
                  </div>
                  <h4 className="mt-4 font-black text-gray-900">No buses found</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Register your first bus with a mandatory photo upload.
                  </p>
                  <button
                    onClick={openAdd}
                    className="mt-6 inline-flex items-center gap-2 bg-[#E31E24] text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                  >
                    <Plus size={18} /> Register Bus
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-4">Bus</th>
                      <th className="pb-4">Plate</th>
                      <th className="pb-4">Route</th>
                      <th className="pb-4">Active Hours</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm">
                    {filteredBuses.map((bus) => (
                      <tr
                        key={bus.id}
                        className="border-b border-gray-50 hover:bg-red-50/30 transition-colors group"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                              {}
                              <img
                                src={bus.photo}
                                alt={bus.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div>
                              <div className="font-black text-gray-900">{bus.name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <ImageIcon size={12} /> Photo Verified
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4">
                          <span className="text-gray-700 font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                            {bus.plateNumber}
                          </span>
                        </td>

                        <td className="py-4 text-gray-600 text-xs">
                          <div className="font-bold text-blue-600">{bus.routeName}</div>
                          <div className="mt-1 opacity-70 flex items-center gap-1">
                            <MapPin size={12} />
                            {routes.find((r) => r.id === bus.routeId)?.startPoint || 'Start'} ➝{' '}
                            {routes.find((r) => r.id === bus.routeId)?.endPoint || 'End'}
                          </div>
                        </td>

                        <td className="py-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock size={12} /> Coming: {bus.activeHoursComing}
                          </div>
                          <div className="mt-1 opacity-70">Going: {bus.activeHoursGoing}</div>
                        </td>

                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(bus)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(bus.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 24 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="bg-white rounded-[2.2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col border border-gray-100 scrollbar-hide"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  {modalType === 'add' ? 'Register New Bus' : 'Update Bus'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      Bus Name
                    </label>
                    <input
                      type="text"
                      required
                      value={busForm.name || ''}
                      onChange={(e) => setBusForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      Number Plate
                    </label>
                    <input
                      type="text"
                      required
                      value={busForm.plateNumber || ''}
                      onChange={(e) => setBusForm((p) => ({ ...p, plateNumber: e.target.value }))}
                      className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all bg-gray-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-black uppercase text-gray-600">
                        No of Active Hours
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">Number of trips a day.</div>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={activeHoursCount}
                      onChange={(e) =>
                        handleActiveHoursCountChange(parseInt(e.target.value || '0'))
                      }
                      className="w-28 p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-white font-black text-center"
                    />
                  </div>

                  {activeHoursCount > 0 && (
                    <div className="mt-4 space-y-3">
                      {Array.from({ length: activeHoursCount }).map((_, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-black uppercase text-gray-500 block mb-1">
                              From Uni (Coming) #{idx + 1}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 08:00 AM - 10:00 AM"
                              value={comingSlots[idx] || ''}
                              onChange={(e) => updateComingSlot(idx, e.target.value)}
                              className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-black uppercase text-gray-500 block mb-1">
                              To Uni (Going) #{idx + 1}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 02:00 PM - 04:00 PM"
                              value={goingSlots[idx] || ''}
                              onChange={(e) => updateGoingSlot(idx, e.target.value)}
                              className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-white"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {}
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black uppercase text-gray-600">
                        Bus Photo {modalType === 'add' ? '(Mandatory)' : '(Optional)'}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">Recheck before upload.</div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePickFile}
                      disabled={uploading}
                      className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                        uploading
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#E31E24] text-white hover:bg-red-700 shadow-lg shadow-red-200'
                      }`}
                    >
                      <Upload size={18} />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="p-4">
                    {busForm.photo ? (
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                          {}
                          <img
                            src={busForm.photo}
                            alt="Bus preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm">
                          <div className="font-black text-gray-900">Photo Ready</div>
                          <div className="text-xs text-gray-500">
                            Saved as secure Cloudinary URL.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <ImageIcon size={18} className="text-gray-400" />
                        {modalType === 'add'
                          ? 'Photo is required to register a new bus.'
                          : 'No photo selected (keeping existing photo is okay).'}
                      </div>
                    )}
                  </div>
                </div>

                {}
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <label className="text-xs font-bold uppercase text-blue-600 mb-2 block">
                    Assign Route
                  </label>
                  <select
                    value={busForm.routeId || ''}
                    onChange={(e) => handleBusRouteChange(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-gray-200 focus:border-blue-500 outline-none bg-white font-semibold"
                  >
                    <option value="">-- Select a Route --</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>

                  {busForm.routeId && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <span className="text-[10px] uppercase text-gray-400 font-black block">
                          Active Coming
                        </span>
                        <span className="text-sm font-black text-gray-700">
                          {busForm.activeHoursComing}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <span className="text-[10px] uppercase text-gray-400 font-black block">
                          Active Going
                        </span>
                        <span className="text-sm font-black text-gray-700">
                          {busForm.activeHoursGoing}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`flex-1 py-4 rounded-2xl font-black text-white transition-colors shadow-lg flex justify-center items-center gap-2 ${
                      uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#E31E24] hover:bg-red-700'
                    }`}
                  >
                    <Save size={18} />
                    {modalType === 'add' ? 'Save Bus' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*home btn*/}
      <Link
        href="/"
        title="Go to Home"
        className="fixed top-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 z-50"
      >
        <Home size={24} />
      </Link>
    </div>
  );
}
