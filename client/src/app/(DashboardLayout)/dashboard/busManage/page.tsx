'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
} from 'lucide-react';

interface Route {
  id: string;
  name: string;
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

<<<<<<< HEAD
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


=======
const CLOUD_NAME = 'dpiofecgs';
const UPLOAD_PRESET = 'butrace';
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Something went wrong';
}

async function uploadToCloudinary(file: File): Promise<string> {
<<<<<<< HEAD
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`;

=======
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
  const form = new FormData();
  form.append('file', file);
  form.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_UPLOAD_PRESET || ''
  );

  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'Cloudinary upload failed');
  return data.secure_url as string;
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
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="p-8 border-b border-white/5 flex justify-between items-start gap-4 sticky top-0 bg-gray-900/90 backdrop-blur-3xl z-10">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed">{subtitle}</p>
        )}
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

export default function BusManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [buses, setBuses] = useState<BusData[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [busForm, setBusForm] = useState<Partial<BusData>>({
    name: '',
    plateNumber: '',
    routeId: '',
    photo: '',
  });

  const [activeHoursCount, setActiveHoursCount] = useState<number>(1);
  const [comingSlots, setComingSlots] = useState<string[]>(['']);
  const [goingSlots, setGoingSlots] = useState<string[]>(['']);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // In a real app, fetch initial data here
    setRoutes([{ id: '1', name: 'Route 1 (Nothullabad)' }]);
    setBuses([
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
    ]);
  }, []);

  const filteredBuses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buses;
    return buses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.plateNumber.toLowerCase().includes(q) ||
        b.routeName.toLowerCase().includes(q)
    );
  }, [buses, query]);

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
    const safeCount = Math.max(0, Math.min(20, count));
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      toast.info('Uploading photo...');
      const url = await uploadToCloudinary(file);
      setBusForm((p) => ({ ...p, photo: url }));
      toast.success('Photo uploaded successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err));
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
    if (uploading) return toast.error('Wait for photo upload.');

    const payload = {
      ...busForm,
      activeHoursComing: comingSlots.filter((s) => s.trim()),
      activeHoursGoing: goingSlots.filter((s) => s.trim()),
    };

    try {
      toast.info('Saving bus details...');
      // Simulated API call
      if (modalType === 'edit') {
        setBuses((prev) =>
          prev.map((b) => (b.id === selectedId ? ({ ...b, ...payload } as BusData) : b))
        );
        toast.success('Bus updated successfully.');
      } else {
        const newBus = {
          ...payload,
          id: Date.now().toString(),
          routeName: routes.find((r) => r.id === busForm.routeId)?.name || '',
        } as BusData;
        setBuses((prev) => [...prev, newBus]);
        toast.success('Bus registered successfully.');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    setBuses((prev) => prev.filter((b) => b.id !== id));
    toast.success('Bus deleted successfully.');
  };

  if (!mounted) return null;

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen bg-[#F8F9FA] relative font-sans text-gray-800">
      { }
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#E31E24] text-white rounded-xl shadow-lg"
        >
          <MdMenu size={24} />
        </button>
      )}

      { }
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
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${pathname === item.href
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

      { }
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full max-w-7xl mx-auto">
          { }
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

          { }
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
                              { }
                              <Image
                                src={bus.photo}
                                alt={bus.name}
                                width={48}
                                height={48}
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
=======
    <div className="space-y-12 pb-12">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Bus Management
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Register buses, assign routes, and manage your university fleet.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brick-400 transition-colors"
              size={20}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, plate, route..."
              className="w-full pl-12 pr-6 py-4 rounded-3xl border border-white/5 bg-white/5 text-white shadow-2xl outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-medium placeholder:text-gray-600"
            />
          </div>

          <button
            onClick={openAdd}
            className="bg-brick-500 text-white px-8 py-5 rounded-4xl font-black text-xs uppercase tracking-widest hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/30 flex items-center gap-3 border border-white/10"
          >
            <Plus size={20} /> Register Bus
          </button>
        </div>
      </div>

      {/* fleet list */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden min-h-[520px] flex flex-col relative">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-xl text-white uppercase tracking-wider flex items-center gap-3">
            <Bus className="text-brick-400" size={28} /> Fleet List
          </h3>
          <div className="text-xs font-black text-gray-400 tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10">
            TOTAL: <span className="text-brick-400 ml-1">{filteredBuses.length}</span>
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
          </div>
        </div>

<<<<<<< HEAD
      { }
=======
        <div className="p-8 overflow-x-auto custom-scrollbar">
          {filteredBuses.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-brick-500/10 flex items-center justify-center mb-6 text-brick-500">
                <Bus size={32} />
              </div>
              <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
                No buses found
              </h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Start building your fleet by registering your first bus.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-8">Bus Information</th>
                  <th className="pb-8">Plate Number</th>
                  <th className="pb-8">Route Assignment</th>
                  <th className="pb-8">Operating Hours</th>
                  <th className="pb-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredBuses.map((bus) => (
                  <tr
                    key={bus.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all group"
                  >
                    <td className="py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl group/img relative">
                          {bus.photo ? (
                            <Image
                              src={bus.photo}
                              alt={bus.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                              unoptimized
                            />
                          ) : (
                            <Bus className="m-auto text-gray-700" size={32} />
                          )}
                        </div>
                        <div>
                          <div className="font-black text-white group-hover:text-brick-400 transition-colors text-base tracking-tight">
                            {bus.name}
                          </div>
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                            ID: #{bus.id.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-8">
                      <span className="text-xs font-black text-brick-400 tabular-nums tracking-widest bg-brick-500/10 px-4 py-2 rounded-xl border border-brick-500/20 shadow-inner">
                        {bus.plateNumber}
                      </span>
                    </td>

                    <td className="py-8">
                      <div className="font-bold text-white text-xs">{bus.routeName}</div>
                      <div className="mt-2 text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                        <MapPin size={12} className="text-brick-400" /> Fixed Route
                      </div>
                    </td>

                    <td className="py-8 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                        <Clock size={12} className="text-green-400" />
                        Coming:{' '}
                        <span className="text-white ml-1">
                          {bus.activeHoursComing.join(', ') || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                        <Clock size={12} className="text-blue-400" />
                        Going:{' '}
                        <span className="text-white ml-1">
                          {bus.activeHoursGoing.join(', ') || 'N/A'}
                        </span>
                      </div>
                    </td>

                    <td className="py-8 text-right">
                      <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <button
                          onClick={() => openEdit(bus)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-brick-500 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(bus.id)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
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

      {/* modal */}
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
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
                title={modalType === 'add' ? 'Register Bus' : 'Update Bus Details'}
                subtitle="Complete all fields and upload a clear bus photo."
                onClose={() => setIsModalOpen(false)}
              />

<<<<<<< HEAD
              <form onSubmit={handleSave} className="p-8 space-y-6">
                { }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
=======
              <form onSubmit={handleSave} className="p-8 space-y-8">
                {/* core fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
                      Bus Name
                    </label>
                    <input
                      value={busForm.name}
                      onChange={(e) => setBusForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Baikali"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-gray-600 outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">
                      Plate Number
                    </label>
                    <input
                      value={busForm.plateNumber}
                      onChange={(e) => setBusForm((p) => ({ ...p, plateNumber: e.target.value }))}
                      placeholder="DHK-METRO-KA-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-gray-600 outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold tabular-nums"
                    />
                  </div>
                </div>

<<<<<<< HEAD
                { }
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-black uppercase text-gray-600">
                        No of Active Hours
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">Number of trips a day.</div>
=======
                {/* route assignment */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 flex items-center gap-2">
                    <MapPin size={14} className="text-brick-400" /> Assign Route
                  </label>
                  <select
                    value={busForm.routeId}
                    onChange={(e) => setBusForm((p) => ({ ...p, routeId: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold appearance-none"
                  >
                    <option value="" className="bg-gray-900">
                      -- Select a Route --
                    </option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-gray-900">
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* operating times */}
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-2">
                      <Clock size={14} className="text-brick-400" /> Operating Trips
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Count:
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={activeHoursCount}
                        onChange={(e) =>
                          handleActiveHoursCountChange(parseInt(e.target.value || '0'))
                        }
                        className="w-20 bg-black/20 border border-white/5 rounded-xl p-3 text-center text-white font-black text-xs outline-none focus:border-brick-500/40"
                      />
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {Array.from({ length: activeHoursCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-black/20 border border-white/5"
                      >
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-1">
                            Coming trip #{idx + 1}
                          </label>
                          <input
                            placeholder="08:00 AM - 10:00 AM"
                            value={comingSlots[idx] || ''}
                            onChange={(e) => {
                              const next = [...comingSlots];
                              next[idx] = e.target.value;
                              setComingSlots(next);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-gray-700 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-1">
                            Going trip #{idx + 1}
                          </label>
                          <input
                            placeholder="02:00 PM - 04:00 PM"
                            value={goingSlots[idx] || ''}
                            onChange={(e) => {
                              const next = [...goingSlots];
                              next[idx] = e.target.value;
                              setGoingSlots(next);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-gray-700 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

<<<<<<< HEAD
                { }
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
                      className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${uploading
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-[#E31E24] text-white hover:bg-red-700 shadow-lg shadow-red-200'
                        }`}
                    >
                      <Upload size={18} />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>

=======
                {/* photo upload */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 flex items-center gap-2">
                    <ImageIcon size={14} className="text-brick-400" /> Bus Photo
                  </label>
                  <div
                    className="relative group p-12 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-brick-500/50 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
                    onClick={() => !uploading && fileRef.current?.click()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin text-brick-500 mb-4" size={48} />
                        <p className="text-white font-black uppercase tracking-widest text-xs">
                          Uploading Photo...
                        </p>
                      </>
                    ) : busForm.photo ? (
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-20 rounded-2xl overflow-hidden border-2 border-brick-500 shadow-2xl mb-4">
                          <Image
                            src={busForm.photo}
                            alt="Preview"
                            width={128}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <p className="text-green-400 font-black text-xs uppercase tracking-widest italic">
                          Photo Verified
                        </p>
                        <p className="text-gray-500 text-[10px] font-bold mt-1 uppercase">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload
                          className="text-gray-600 group-hover:text-brick-500 transition-colors mb-4"
                          size={48}
                        />
                        <p className="text-white font-black uppercase tracking-widest text-xs mb-1">
                          Upload Official Bus Photo
                        </p>
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tighter">
                          Required for new registrations
                        </p>
                      </>
                    )}
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
<<<<<<< HEAD

                  <div className="p-4">
                    {busForm.photo ? (
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                          { }
                          <Image
                            src={busForm.photo}
                            alt="Bus preview"
                            width={96}
                            height={80}
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

                { }
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

                { }
                <div className="pt-2 flex gap-3">
=======
                </div>

                {/* actions */}
                <div className="pt-4 flex gap-4 sticky bottom-0 bg-gray-900 pb-2">
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 rounded-3xl font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
<<<<<<< HEAD
                    className={`flex-1 py-4 rounded-2xl font-black text-white transition-colors shadow-lg flex justify-center items-center gap-2 ${uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#E31E24] hover:bg-red-700'
                      }`}
=======
                    className="flex-1 py-5 rounded-3xl font-black text-white bg-brick-500 hover:bg-brick-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-brick-500/20 flex justify-center items-center gap-3 text-sm uppercase tracking-widest border border-white/10"
>>>>>>> 574663e24ae34190ec7dc9c066a1f9be874b5207
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Save size={20} />
                    )}
                    {modalType === 'add' ? 'Confirm Registration' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}
