'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus as BusIcon,
  MapPin,
  Clock,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  Save,
  Route as RouteIcon,
  Waypoints,
  Pencil,
} from 'lucide-react';

// --- Types & Interfaces ---

interface IBus {
  id: string;
  name: string;
  plateNumber: string;
  routeId: string;
  routeName: string;
  activeHoursComing: string[];
  activeHoursGoing: string[];
  photo: string;
}

interface IStop {
  name: string;
  mapUrl: string;
}

interface IRoute {
  id: string;
  routeName: string;
  startPointName: string;
  startPointMapUrl: string;
  endPointName: string;
  endPointMapUrl: string;
  stops: IStop[];
  createdAt?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface IRawStopage {
  name: string;
  [key: string]: unknown;
}

interface IRawRoute {
  _id?: string;
  id?: string;
  name?: string;
  stopages?: IRawStopage[];
}

// --- Constants & Helpers ---

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const API = {
  getBuses: `${BASE_URL}/bus/get-all-buses`,
  getRoutes: `${BASE_URL}/route`,
  saveBus: `${BASE_URL}/bus/add-bus`,
  updateBus: (id: string) => `${BASE_URL}/bus/update-bus/${id}`,
  deleteBus: (id: string) => `${BASE_URL}/bus/delete-bus/${id}`,
  saveRoute: `${BASE_URL}/route`,
  updateRoute: (id: string) => `${BASE_URL}/route/${id}`,
  deleteRoute: (id: string) => `${BASE_URL}/route/${id}`,
  createStopage: `${BASE_URL}/stopage/add-stopage`,
};

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Something went wrong';
}

function formatDate(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }

  return json.data as T;
}

// --- Shared Components ---

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

// --- Main Page Component ---

export default function SchedulePage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'buses' | 'routes'>('buses');

  // Data State
  const [buses, setBuses] = useState<IBus[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [query, setQuery] = useState('');

  // Bus Modal State
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [busModalType, setBusModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [busForm, setBusForm] = useState<Partial<IBus>>({
    name: '',
    plateNumber: '',
    routeId: '',
    photo: '',
  });
  const [comingSlots, setComingSlots] = useState<string[]>(['']);
  const [goingSlots, setGoingSlots] = useState<string[]>(['']);

  // Route Modal State
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeModalType, setRouteModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState<Omit<IRoute, 'id'>>({
    routeName: '',
    startPointName: '',
    startPointMapUrl: '',
    endPointName: '',
    endPointMapUrl: '',
    stops: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize Logic
  const normalizeRoute = useCallback((r: IRawRoute): IRoute => {
    const stopages = Array.isArray(r?.stopages) ? r.stopages : [];
    const stopNames = stopages.map((s) => s?.name || '').filter(Boolean);
    const start = stopNames[0] || '';
    const end = stopNames[stopNames.length - 1] || '';

    return {
      id: r?._id || r?.id || '',
      routeName: r?.name || '',
      startPointName: start,
      startPointMapUrl: '',
      endPointName: end,
      endPointMapUrl: '',
      stops: stopNames.map((name) => ({ name, mapUrl: '' })),
    };
  }, []);

  // Data Fetching
  const loadData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const routesData = await apiFetch<IRawRoute[]>(API.getRoutes, {}, accessToken);
      const normalizedRoutes = (routesData || []).map(normalizeRoute);
      setRoutes(normalizedRoutes);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }, [accessToken, normalizeRoute]);

  useEffect(() => {
    if (!mounted || !session) return;
    loadData();

    // Initial mock data
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
  }, [mounted, session, loadData]);

  // Filters
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

  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) => {
      const stopText = r.stops
        .map((s) => s.name)
        .join(' ')
        .toLowerCase();
      return r.routeName.toLowerCase().includes(q) || stopText.includes(q);
    });
  }, [routes, query]);

  // --- Bus Handlers ---

  const openAddBus = () => {
    setBusModalType('add');
    setSelectedBusId(null);
    setBusForm({ name: '', plateNumber: '', routeId: '', photo: '' });
    setComingSlots(['']);
    setGoingSlots(['']);
    setIsBusModalOpen(true);
  };

  const openEditBus = (bus: IBus) => {
    setBusModalType('edit');
    setSelectedBusId(bus.id);
    setBusForm({ ...bus });
    setComingSlots(bus.activeHoursComing?.length ? bus.activeHoursComing : ['']);
    setGoingSlots(bus.activeHoursGoing?.length ? bus.activeHoursGoing : ['']);
    setIsBusModalOpen(true);
  };

  const handleBusSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busForm.name?.trim()) return toast.error('Bus name required');
    if (!busForm.routeId) return toast.error('Select a route');

    try {
      const payload = {
        ...busForm,
        activeHoursComing: comingSlots.filter((s) => s.trim()),
        activeHoursGoing: goingSlots.filter((s) => s.trim()),
      };
      setBuses((prev) => {
        if (busModalType === 'edit')
          return prev.map((b) => (b.id === selectedBusId ? ({ ...b, ...payload } as IBus) : b));
        return [
          {
            ...payload,
            id: Date.now().toString(),
            routeName: routes.find((r) => r.id === busForm.routeId)?.routeName || '',
          } as IBus,
          ...prev,
        ];
      });
      toast.success(`Bus ${busModalType === 'add' ? 'registered' : 'updated'}`);
      setIsBusModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // --- Route Handlers ---

  const openAddRoute = () => {
    setRouteModalType('add');
    setSelectedRouteId(null);
    setRouteForm({
      routeName: '',
      startPointName: '',
      startPointMapUrl: '',
      endPointName: '',
      endPointMapUrl: '',
      stops: [],
    });
    setIsRouteModalOpen(true);
  };

  const openEditRoute = (r: IRoute) => {
    setRouteModalType('edit');
    setSelectedRouteId(r.id);
    setRouteForm({ ...r });
    setIsRouteModalOpen(true);
  };

  const handleRouteSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.routeName.trim()) return toast.error('Route name required');
    try {
      setRoutes((prev) => {
        if (routeModalType === 'edit')
          return prev.map((r) =>
            r.id === selectedRouteId ? ({ ...r, ...routeForm } as IRoute) : r
          );
        return [{ ...routeForm, id: Date.now().toString() } as IRoute, ...prev];
      });
      toast.success(`Route ${routeModalType === 'add' ? 'created' : 'updated'}`);
      setIsRouteModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Schedule Management
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Manage your university bus fleet and transit network in one unified interface.
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
              placeholder={`Search ${activeTab === 'buses' ? 'Buses' : 'Routes'}...`}
              className="w-full pl-12 pr-6 py-4 rounded-3xl border border-white/5 bg-white/5 text-white shadow-2xl outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-medium placeholder:text-gray-600"
            />
          </div>
          <button
            onClick={() => (activeTab === 'buses' ? openAddBus() : openAddRoute())}
            className="bg-brick-500 text-white px-8 py-5 rounded-4xl font-black text-xs uppercase tracking-widest hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/30 flex items-center gap-3 border border-white/10"
          >
            <Plus size={20} /> Add {activeTab === 'buses' ? 'Bus' : 'Route'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 w-fit">
        {(
          [
            { id: 'buses', label: 'Buses', icon: BusIcon },
            { id: 'routes', label: 'Routes', icon: RouteIcon },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setQuery('');
            }}
            className={`
              flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all
              ${activeTab === tab.id ? 'bg-brick-500 text-white shadow-xl border border-white/10' : 'text-gray-500 hover:text-white'}
            `}
          >
            <tab.icon
              size={20}
              className={activeTab === tab.id ? 'text-white' : 'text-brick-500/60'}
            />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List Area */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden min-h-[500px] flex flex-col">
        {/* List Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-xl text-white uppercase tracking-wider flex items-center gap-4">
            {activeTab === 'buses' ? (
              <BusIcon className="text-brick-400" size={28} />
            ) : (
              <RouteIcon className="text-brick-400" size={28} />
            )}
            {activeTab === 'buses' ? 'Fleet Inventory' : 'Network Routes'}
          </h3>
          <div className="text-xs font-black text-gray-400 tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10">
            TOTAL:{' '}
            <span className="text-brick-400 ml-1">
              {activeTab === 'buses' ? filteredBuses.length : filteredRoutes.length}
            </span>
          </div>
        </div>

        <div className="p-8 overflow-x-auto custom-scrollbar">
          {activeTab === 'buses' ? (
            /* --- BUS TABLE --- */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-8">Bus Info</th>
                  <th className="pb-8">Plate</th>
                  <th className="pb-8">Assignment</th>
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
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl relative">
                          {bus.photo ? (
                            <Image
                              src={bus.photo}
                              alt={bus.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <BusIcon size={24} className="m-auto text-gray-700" />
                          )}
                        </div>
                        <div>
                          <div className="font-black text-white text-base tracking-tight">
                            {bus.name}
                          </div>
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                            ID: #{bus.id.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-8">
                      <span className="text-xs font-black text-brick-400 bg-brick-500/10 px-4 py-2 rounded-xl border border-brick-500/20">
                        {bus.plateNumber}
                      </span>
                    </td>
                    <td className="py-8">
                      <div className="font-bold text-white text-xs">{bus.routeName}</div>
                    </td>
                    <td className="py-8 space-y-2 text-[10px] font-black tracking-widest uppercase">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={12} className="text-green-400" />{' '}
                        {bus.activeHoursComing.join(', ') || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={12} className="text-blue-400" />{' '}
                        {bus.activeHoursGoing.join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="py-8 text-right">
                      <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <button
                          onClick={() => openEditBus(bus)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-brick-500 rounded-2xl border border-white/10 shadow-xl"
                        >
                          <Edit size={18} />
                        </button>
                        <button className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl border border-white/10 shadow-xl">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* --- ROUTE TABLE --- */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-8">Route Name</th>
                  <th className="pb-8">Points</th>
                  <th className="pb-8">Stops</th>
                  <th className="pb-8">Created</th>
                  <th className="pb-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRoutes.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all group"
                  >
                    <td className="py-8">
                      <div className="font-black text-white text-base tracking-tight">
                        {r.routeName}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-500">
                        <Waypoints size={14} className="text-brick-400" /> {r.stops?.length || 0}{' '}
                        stops
                      </div>
                    </td>
                    <td className="py-8 space-y-3">
                      <div className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
                        <MapPin size={14} className="text-brick-400" /> {r.startPointName || '—'}
                      </div>
                      <div className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
                        <MapPin size={14} className="text-blue-400" /> {r.endPointName || '—'}
                      </div>
                    </td>
                    <td className="py-8">
                      <div className="flex flex-col gap-2">
                        {r.stops.slice(0, 2).map((s, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs">
                            <span className="font-black text-gray-600">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="font-bold text-gray-400">{s.name}</span>
                          </div>
                        ))}
                        {r.stops.length > 2 && (
                          <div className="text-[10px] font-black text-gray-600 uppercase">
                            +{r.stops.length - 2} more...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-8 font-bold text-gray-500 text-xs tabular-nums tracking-wider uppercase">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-8 text-right">
                      <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <button
                          onClick={() => openEditRoute(r)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-brick-500 rounded-2xl border border-white/10 shadow-xl"
                        >
                          <Pencil size={18} />
                        </button>
                        <button className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl border border-white/10 shadow-xl">
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

      {/* --- MODALS --- */}

      <AnimatePresence>
        {isBusModalOpen && (
          <Overlay onClose={() => setIsBusModalOpen(false)}>
            <motion.div
              initial={{ scale: 1, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-3xl rounded-[3rem] shadow-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar"
            >
              <HeaderModal
                title={busModalType === 'add' ? 'Register Bus' : 'Update Bus'}
                subtitle="Assign routes and set operating hours."
                onClose={() => setIsBusModalOpen(false)}
              />
              <form onSubmit={handleBusSave} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">
                      Bus Name
                    </label>
                    <input
                      value={busForm.name}
                      onChange={(e) => setBusForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Baikali"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 transition-all font-bold"
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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 flex items-center gap-2">
                    <MapPin size={14} className="text-brick-400" /> Assign Route
                  </label>
                  <select
                    value={busForm.routeId}
                    onChange={(e) => setBusForm((p) => ({ ...p, routeId: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 transition-all font-bold appearance-none"
                  >
                    <option value="" className="bg-gray-900 text-gray-500">
                      -- Select a Route --
                    </option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-gray-900">
                        {r.routeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsBusModalOpen(false)}
                    className="flex-1 py-5 rounded-3xl font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-5 rounded-3xl font-black text-white bg-brick-500 hover:bg-brick-600 transition-all shadow-2xl flex justify-center items-center gap-3 text-sm uppercase tracking-widest border border-white/10"
                  >
                    <Save size={20} />{' '}
                    {busModalType === 'add' ? 'Confirm Registration' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </Overlay>
        )}

        {isRouteModalOpen && (
          <Overlay onClose={() => setIsRouteModalOpen(false)}>
            <motion.div
              initial={{ scale: 1, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-3xl rounded-[3rem] shadow-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar"
            >
              <HeaderModal
                title={routeModalType === 'add' ? 'Add Route' : 'Update Route'}
                subtitle="Set start/end points and dynamic stops."
                onClose={() => setIsRouteModalOpen(false)}
              />
              <form onSubmit={handleRouteSave} className="p-8 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">
                    Route Name
                  </label>
                  <input
                    value={routeForm.routeName}
                    onChange={(e) => setRouteForm((p) => ({ ...p, routeName: e.target.value }))}
                    placeholder="Example: Campus → City Center"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 transition-all font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="text-brick-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <MapPin size={16} /> Start point
                    </div>
                    <input
                      value={routeForm.startPointName}
                      onChange={(e) =>
                        setRouteForm((p) => ({ ...p, startPointName: e.target.value }))
                      }
                      placeholder="Point Name (e.g. Main Gate)"
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white font-bold"
                    />
                  </div>
                  <div className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="text-blue-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <MapPin size={16} /> End point
                    </div>
                    <input
                      value={routeForm.endPointName}
                      onChange={(e) =>
                        setRouteForm((p) => ({ ...p, endPointName: e.target.value }))
                      }
                      placeholder="Point Name (e.g. City Hub)"
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white font-bold"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsRouteModalOpen(false)}
                    className="flex-1 py-5 rounded-3xl font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-5 rounded-3xl font-black text-white bg-brick-500 hover:bg-brick-600 transition-all shadow-2xl flex justify-center items-center gap-3 text-sm uppercase tracking-widest border border-white/10"
                  >
                    <Save size={20} /> {routeModalType === 'add' ? 'Save Route' : 'Update changes'}
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
