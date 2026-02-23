'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  Clock,
  Loader2,
  MapPin,
  UserCircle,
} from 'lucide-react';
import { api } from '@/lib/axios';

/* ── Types ── */
interface IRoute {
  _id: string;
  name: string;
  route_id?: string;
}

interface IDriver {
  _id: string;
  name: string;
  email?: string;
}

interface IBusRaw {
  _id: string;
  bus_id?: string;
  name: string;
  plateNumber: string;
  route: string | { _id: string; name: string; route_id?: string };
  driverId: string | { _id: string; name: string; email?: string };
  photo?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
}

interface IBus {
  _id: string;
  bus_id?: string;
  name: string;
  plateNumber: string;
  routeId: string;
  routeName: string;
  driverId: string;
  driverName: string;
  photo: string;
  isActive?: boolean;
  status?: string;
}

const CLOUD_NAME = 'dpiofecgs';
const UPLOAD_PRESET = 'butrace';

function getErrMsg(e: unknown) {
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

function normalizeBus(raw: IBusRaw): IBus {
  const route = typeof raw.route === 'object' && raw.route !== null ? raw.route : null;
  const driver = typeof raw.driverId === 'object' && raw.driverId !== null ? raw.driverId : null;
  return {
    _id: raw._id,
    bus_id: raw.bus_id,
    name: raw.name,
    plateNumber: raw.plateNumber,
    routeId: route?._id || (typeof raw.route === 'string' ? raw.route : ''),
    routeName: route?.name || '',
    driverId: driver?._id || (typeof raw.driverId === 'string' ? raw.driverId : ''),
    driverName: driver?.name || '',
    photo: raw.photo || '',
    isActive: raw.isActive,
    status: raw.status,
  };
}

/* ── Overlay ── */
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

/* ── Page ── */
export default function BusManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [buses, setBuses] = useState<IBus[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [drivers, setDrivers] = useState<IDriver[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [busForm, setBusForm] = useState({
    name: '',
    plateNumber: '',
    routeId: '',
    driverId: '',
    photo: '',
  });

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  /* ── Data loaders ── */
  const loadBuses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/bus/get-all-buses');
      if (res.data.success) {
        setBuses((res.data.data as IBusRaw[]).map(normalizeBus));
      }
    } catch (e) {
      toast.error(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoutes = useCallback(async () => {
    try {
      const res = await api.get('/route');
      if (res.data.success) setRoutes(res.data.data as IRoute[]);
    } catch {
      /* ignore */
    }
  }, []);

  const loadDrivers = useCallback(async () => {
    try {
      const res = await api.get('/user/get-all-drivers');
      if (res.data.success) setDrivers(res.data.data as IDriver[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadBuses();
    loadRoutes();
    loadDrivers();
  }, [loadBuses, loadRoutes, loadDrivers]);

  /* ── Modal helpers ── */
  const openAdd = () => {
    setModalType('add');
    setSelectedId(null);
    setBusForm({ name: '', plateNumber: '', routeId: '', driverId: '', photo: '' });
    setIsModalOpen(true);
  };

  const openEdit = (bus: IBus) => {
    setModalType('edit');
    setSelectedId(bus._id);
    setBusForm({
      name: bus.name,
      plateNumber: bus.plateNumber,
      routeId: bus.routeId,
      driverId: bus.driverId,
      photo: bus.photo,
    });
    setIsModalOpen(true);
  };

  /* ── Photo upload ── */
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
      toast.error(getErrMsg(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /* ── Save ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busForm.name.trim()) return toast.error('Bus name is required.');
    if (!busForm.plateNumber.trim()) return toast.error('Plate number is required.');
    if (!busForm.routeId) return toast.error('Please assign a route.');
    if (!busForm.driverId) return toast.error('Please assign a driver.');
    if (!busForm.photo) return toast.error('Bus photo is required.');
    if (uploading) return toast.error('Wait for photo upload to complete.');

    const payload = {
      name: busForm.name.trim(),
      plateNumber: busForm.plateNumber.trim(),
      route: busForm.routeId,
      driverId: busForm.driverId,
      photo: busForm.photo,
    };

    try {
      if (modalType === 'edit' && selectedId) {
        await api.put(`/bus/update-bus/${selectedId}`, payload);
        toast.success('Bus updated successfully.');
      } else {
        await api.post('/bus/add-bus', payload);
        toast.success('Bus registered successfully.');
      }
      setIsModalOpen(false);
      loadBuses();
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete bus "${name}" permanently?`)) return;
    try {
      await api.delete(`/bus/delete-bus/${id}`);
      setBuses((prev) => prev.filter((b) => b._id !== id));
      toast.success('Bus deleted successfully.');
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  /* ── Filter ── */
  const filteredBuses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buses;
    return buses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.plateNumber.toLowerCase().includes(q) ||
        b.routeName.toLowerCase().includes(q) ||
        b.driverName.toLowerCase().includes(q)
    );
  }, [buses, query]);

  if (!mounted) return null;

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Bus Management
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Register buses, assign routes and drivers to manage your university fleet.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          {/* Search with clear */}
          <div className="relative flex-1 w-full group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brick-400 transition-colors"
              size={20}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, plate, route, driver..."
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
            <Plus size={20} /> Register Bus
          </button>
        </div>
      </div>

      {/* Fleet list */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden min-h-[520px] flex flex-col relative">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-xl text-white uppercase tracking-wider flex items-center gap-3">
            <Bus className="text-brick-400" size={28} /> Fleet List
          </h3>
          <div className="text-xs font-black text-gray-400 tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10">
            TOTAL:{' '}
            <span className="text-brick-400 ml-1">{loading ? '...' : filteredBuses.length}</span>
          </div>
        </div>

        <div className="p-8 overflow-x-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="py-24 text-center">
              <div className="mx-auto w-12 h-12 border-4 border-brick-500/20 border-t-brick-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                Loading fleet...
              </p>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-brick-500/10 flex items-center justify-center mb-6 text-brick-500">
                <Bus size={32} />
              </div>
              <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
                {query ? 'No matches found' : 'No buses registered'}
              </h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                {query ? 'Try a different search term.' : 'Register your first bus to get started.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-8">Bus Information</th>
                  <th className="pb-8">Plate Number</th>
                  <th className="pb-8">Route</th>
                  <th className="pb-8">Driver</th>
                  <th className="pb-8">Status</th>
                  <th className="pb-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredBuses.map((bus) => (
                  <tr
                    key={bus._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all group"
                  >
                    <td className="py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl relative shrink-0">
                          {bus.photo ? (
                            <Image
                              src={bus.photo}
                              alt={bus.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Bus className="text-gray-700" size={28} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-white group-hover:text-brick-400 transition-colors text-base tracking-tight">
                            {bus.name}
                          </div>
                          {bus.bus_id && (
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                              {bus.bus_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-8">
                      <span className="text-xs font-black text-brick-400 tabular-nums tracking-widest bg-brick-500/10 px-4 py-2 rounded-xl border border-brick-500/20 shadow-inner">
                        {bus.plateNumber}
                      </span>
                    </td>

                    <td className="py-8">
                      <div className="font-bold text-white text-xs">{bus.routeName || '—'}</div>
                      <div className="mt-1 text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                        <MapPin size={12} className="text-brick-400" /> Fixed Route
                      </div>
                    </td>

                    <td className="py-8">
                      <div className="flex items-center gap-2">
                        <UserCircle size={16} className="text-blue-400 shrink-0" />
                        <div className="font-bold text-white text-xs">{bus.driverName || '—'}</div>
                      </div>
                    </td>

                    <td className="py-8">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                          bus.status === 'running'
                            ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                            : bus.status === 'paused'
                              ? 'text-amber-400 border-amber-400/20 bg-amber-400/5'
                              : 'text-gray-500 border-gray-700 bg-white/5'
                        }`}
                      >
                        {bus.status || (bus.isActive !== false ? 'Active' : 'Inactive')}
                      </span>
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
                          onClick={() => handleDelete(bus._id, bus.name)}
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-3xl rounded-[3rem] shadow-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-start gap-4 sticky top-0 bg-gray-900/95 backdrop-blur-3xl z-10">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {modalType === 'add' ? 'Register Bus' : 'Update Bus Details'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed">
                    Fill all required fields and upload a clear bus photo.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-white/5 text-gray-400 rounded-2xl hover:bg-brick-500 hover:text-white transition-all shadow-lg border border-white/10"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-8">
                {/* Name & Plate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">
                      Bus Name *
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
                      Plate Number *
                    </label>
                    <input
                      value={busForm.plateNumber}
                      onChange={(e) => setBusForm((p) => ({ ...p, plateNumber: e.target.value }))}
                      placeholder="DHK-METRO-KA-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-gray-600 outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold tabular-nums"
                    />
                  </div>
                </div>

                {/* Route + Driver */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 flex items-center gap-2">
                      <MapPin size={14} className="text-brick-400" /> Assign Route *
                    </label>
                    <select
                      value={busForm.routeId}
                      onChange={(e) => setBusForm((p) => ({ ...p, routeId: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold appearance-none"
                    >
                      <option value="" className="bg-gray-900">
                        -- Select Route --
                      </option>
                      {routes.map((r) => (
                        <option key={r._id} value={r._id} className="bg-gray-900">
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {routes.length === 0 && (
                      <p className="text-[10px] text-amber-400 font-bold ml-2">
                        ⚠ No routes found. Add routes first.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 flex items-center gap-2">
                      <UserCircle size={14} className="text-blue-400" /> Assign Driver *
                    </label>
                    <select
                      value={busForm.driverId}
                      onChange={(e) => setBusForm((p) => ({ ...p, driverId: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold appearance-none"
                    >
                      <option value="" className="bg-gray-900">
                        -- Select Driver --
                      </option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id} className="bg-gray-900">
                          {d.name}
                          {d.email ? ` (${d.email})` : ''}
                        </option>
                      ))}
                    </select>
                    {drivers.length === 0 && (
                      <p className="text-[10px] text-amber-400 font-bold ml-2">
                        ⚠ No drivers found. Register drivers first.
                      </p>
                    )}
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 flex items-center gap-2">
                    <ImageIcon size={14} className="text-brick-400" /> Bus Photo *
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
                        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">
                          Photo Ready
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
                          Upload Bus Photo
                        </p>
                        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tighter">
                          Required — click to select image
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

                {/* Operating Hours Info */}
                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Clock size={14} /> Operating schedules are managed via the Schedule module
                    after bus registration.
                  </p>
                </div>

                {/* Actions */}
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
                    {modalType === 'add' ? 'Register Bus' : 'Save Changes'}
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
