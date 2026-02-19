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

const CLOUD_NAME = 'dpiofecgs';
const UPLOAD_PRESET = 'butrace';

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Something went wrong';
}

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

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
          </div>
        </div>

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

              <form onSubmit={handleSave} className="p-8 space-y-8">
                {/* core fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">
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
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* actions */}
                <div className="pt-4 flex gap-4 sticky bottom-0 bg-gray-900 pb-2">
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
                    className="flex-1 py-5 rounded-3xl font-black text-white bg-brick-500 hover:bg-brick-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-brick-500/20 flex justify-center items-center gap-3 text-sm uppercase tracking-widest border border-white/10"
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
