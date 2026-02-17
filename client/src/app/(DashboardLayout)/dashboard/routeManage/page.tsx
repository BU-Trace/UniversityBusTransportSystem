'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  X,
  Save,
  Search,
  MapPin,
  Route as RouteIcon,
  Waypoints,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

type UserRole = 'driver' | 'admin' | 'superadmin';

type IStop = {
  name: string;
  mapUrl: string;
};

type IRoute = {
  id: string;
  routeName: string;

  startPointName: string;
  startPointMapUrl: string;
  endPointName: string;
  endPointMapUrl: string;

  stops: IStop[];
  createdAt?: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const API = {
  getAllRoutes: `${BASE_URL}/route`,
  createRoute: `${BASE_URL}/route`,
  updateRoute: (id: string) => `${BASE_URL}/route/${id}`,
  deleteRoute: (id: string) => `${BASE_URL}/route/${id}`,

  createStopage: `${BASE_URL}/stopage/add-stopage`,
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type RawStopage = {
  _id?: string;
  id?: string;
  name?: string;
};

type RawRoute = {
  _id?: string;
  id?: string;
  name?: string;
  route_id?: string;
  stopages?: RawStopage[];
  createdAt?: string;
};

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Something went wrong';
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

  return json as T;
}

function safeOpen(url?: string) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function formatDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

function toUserRole(role?: string | null): UserRole | undefined {
  const allowed: UserRole[] = ['driver', 'admin', 'superadmin'];
  return allowed.includes(role as UserRole) ? (role as UserRole) : undefined;
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
    <div className="p-8 border-b border-white/5 flex justify-between items-start gap-4 sticky top-0 bg-gray-900/90 backdrop-blur-3xl z-10">
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

const initialForm: Omit<IRoute, 'id'> = {
  routeName: '',
  startPointName: '',
  startPointMapUrl: '',
  endPointName: '',
  endPointMapUrl: '',
  stops: [],
  createdAt: undefined,
};

export default function RouteManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const accessToken = session?.accessToken;
  const myRole = toUserRole(session?.user?.role || null);

  const [mounted, setMounted] = useState(false);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<IRoute, 'id'>>({ ...initialForm });
  const [stopCount, setStopCount] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  // Auth check
  useEffect(() => {
    if (!mounted) return;
    if (!session) return;
    if (myRole !== 'admin' && myRole !== 'superadmin') {
      toast.error('Not authorized');
      router.replace('/');
    }
  }, [mounted, session, myRole, router]);

  const normalizeRoute = useCallback((r: RawRoute): IRoute => {
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

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiFetch<ApiResponse<RawRoute[]>>(API.getAllRoutes, {}, accessToken);
      const list = (json.data || []).map(normalizeRoute);
      setRoutes(list);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [accessToken, normalizeRoute]);

  useEffect(() => {
    if (!mounted) return;
    if (myRole !== 'admin' && myRole !== 'superadmin') return;
    loadRoutes();
  }, [mounted, myRole, loadRoutes]);

  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) => {
      const stopText = r.stops
        .map((s) => s.name)
        .join(' ')
        .toLowerCase();
      return (
        r.routeName.toLowerCase().includes(q) ||
        r.startPointName.toLowerCase().includes(q) ||
        r.endPointName.toLowerCase().includes(q) ||
        stopText.includes(q)
      );
    });
  }, [routes, query]);

  const openAdd = () => {
    setModalType('add');
    setSelectedId(null);
    setForm({ ...initialForm });
    setStopCount(0);
    setIsModalOpen(true);
  };

  const openEdit = (r: IRoute) => {
    setModalType('edit');
    setSelectedId(r.id);
    setForm({
      routeName: r.routeName,
      startPointName: r.startPointName,
      startPointMapUrl: r.startPointMapUrl,
      endPointName: r.endPointName,
      endPointMapUrl: r.endPointMapUrl,
      stops: r.stops || [],
      createdAt: r.createdAt,
    });
    setStopCount(r.stops?.length || 0);
    setIsModalOpen(true);
  };

  const setStopsCountAndResize = (count: number) => {
    setStopCount(count);
    setForm((prev) => {
      const nextStops = [...(prev.stops || [])];
      if (count > nextStops.length) {
        for (let i = nextStops.length; i < count; i++) {
          nextStops.push({ name: '', mapUrl: '' });
        }
      } else if (count < nextStops.length) {
        nextStops.splice(count);
      }
      return { ...prev, stops: nextStops };
    });
  };

  const updateStop = (idx: number, key: keyof IStop, value: string) => {
    setForm((prev) => {
      const nextStops = [...(prev.stops || [])];
      nextStops[idx] = { ...nextStops[idx], [key]: value };
      return { ...prev, stops: nextStops };
    });
  };

  const validate = () => {
    if (!form.routeName.trim()) return 'Route name is required';
    if (!form.startPointName.trim()) return 'Start point name is required';
    if (!form.startPointMapUrl.trim()) return 'Start point map url is required';
    if (!form.endPointName.trim()) return 'End point name is required';
    if (!form.endPointMapUrl.trim()) return 'End point map url is required';
    if (stopCount > 0) {
      for (let i = 0; i < stopCount; i++) {
        const s = form.stops?.[i];
        if (!s?.name?.trim()) return `Stop #${i + 1} name is required`;
        if (!s?.mapUrl?.trim()) return `Stop #${i + 1} map url is required`;
      }
    }
    return null;
  };

  const createStopagesForStops = async (stops: IStop[]) => {
    const ids: string[] = [];
    for (const s of stops) {
      const name = s.name.trim();
      if (!name) continue;
      const json = await apiFetch<ApiResponse<{ _id: string; name: string }>>(
        API.createStopage,
        { method: 'POST', body: JSON.stringify({ name }) },
        accessToken
      );
      const createdId = json?.data?._id;
      if (createdId) ids.push(createdId);
    }
    return ids;
  };

  const saveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return toast.error(msg);

    try {
      toast.info('Saving route...');
      const stopages = await createStopagesForStops(form.stops || []);
      const route_id = `R-${Date.now()}`;
      const payload = {
        name: form.routeName.trim(),
        route_id,
        isActive: true,
        stopages,
      };

      if (modalType === 'edit' && selectedId) {
        const json = await apiFetch<ApiResponse<RawRoute>>(
          API.updateRoute(selectedId),
          { method: 'PUT', body: JSON.stringify(payload) },
          accessToken
        );
        const updated = normalizeRoute(json.data || {});
        const merged: IRoute = {
          ...updated,
          startPointName: form.startPointName.trim(),
          startPointMapUrl: form.startPointMapUrl.trim(),
          endPointName: form.endPointName.trim(),
          endPointMapUrl: form.endPointMapUrl.trim(),
          stops: (form.stops || []).map((s) => ({ name: s.name.trim(), mapUrl: s.mapUrl.trim() })),
        };
        setRoutes((prev) => prev.map((x) => (x.id === selectedId ? merged : x)));
        toast.success('Route updated');
      } else {
        const json = await apiFetch<ApiResponse<RawRoute>>(
          API.createRoute,
          { method: 'POST', body: JSON.stringify(payload) },
          accessToken
        );
        const created = normalizeRoute(json.data || {});
        const merged: IRoute = {
          ...created,
          startPointName: form.startPointName.trim(),
          startPointMapUrl: form.startPointMapUrl.trim(),
          endPointName: form.endPointName.trim(),
          endPointMapUrl: form.endPointMapUrl.trim(),
          stops: (form.stops || []).map((s) => ({ name: s.name.trim(), mapUrl: s.mapUrl.trim() })),
        };
        setRoutes((prev) => [merged, ...prev]);
        toast.success('Route created');
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const deleteRouteFunc = async (id: string) => {
    if (!window.confirm('Delete this route permanently?')) return;
    try {
      toast.info('Deleting route...');
      await apiFetch<ApiResponse<null>>(API.deleteRoute(id), { method: 'DELETE' }, accessToken);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Route deleted');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12 pb-12">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Route Management
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Create and manage routes. These routes can be assigned to buses.
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
              placeholder="Search routes..."
              className="w-full pl-12 pr-6 py-4 rounded-3xl border border-white/5 bg-white/5 text-white shadow-2xl outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-medium placeholder:text-gray-600"
            />
          </div>

          <button
            onClick={openAdd}
            className="bg-brick-500 text-white px-8 py-5 rounded-4xl font-black text-xs uppercase tracking-widest hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/30 flex items-center gap-3 border border-white/10"
          >
            <Plus size={20} /> Add Route
          </button>

          <button
            onClick={loadRoutes}
            className="p-5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-3xl transition-all border border-white/5 shadow-xl"
          >
            <RouteIcon size={24} />
          </button>
        </div>
      </div>

      {/* list */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden min-h-[520px] flex flex-col relative">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-xl text-white uppercase tracking-wider flex items-center gap-3">
            <RouteIcon className="text-brick-400" size={28} /> Routes List
          </h3>
          <div className="text-xs font-black text-gray-400 tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10">
            TOTAL:{' '}
            <span className="text-brick-400 ml-1">{loading ? '...' : filteredRoutes.length}</span>
          </div>
        </div>

        <div className="p-8 overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="py-24 text-center">
              <div className="mx-auto w-12 h-12 border-4 border-brick-500/20 border-t-brick-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                Loading routes...
              </p>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-brick-500/10 flex items-center justify-center mb-6 text-brick-500">
                <RouteIcon size={32} />
              </div>
              <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
                No routes found
              </h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Add a route to make it available for bus assignment.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-8">Route</th>
                  <th className="pb-8">Start → End</th>
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
                      <div className="font-black text-white group-hover:text-brick-400 transition-colors text-base tracking-tight">
                        {r.routeName}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-500">
                        <Waypoints size={14} className="text-brick-400" />
                        {r.stops?.length || 0} stops
                      </div>
                    </td>

                    <td className="py-8">
                      <div className="flex flex-col gap-3">
                        <div className="font-black text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                          <MapPin size={14} className="text-brick-400" />
                          {r.startPointName || '—'}
                          {r.startPointMapUrl ? (
                            <button
                              type="button"
                              onClick={() => safeOpen(r.startPointMapUrl)}
                              className="ml-2 inline-flex items-center gap-1 text-[9px] font-black px-3 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-brick-500 hover:text-white transition-all border border-white/10"
                            >
                              <ExternalLink size={10} /> Map
                            </button>
                          ) : null}
                        </div>
                        <div className="font-black text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                          <MapPin size={14} className="text-blue-400" />
                          {r.endPointName || '—'}
                          {r.endPointMapUrl ? (
                            <button
                              type="button"
                              onClick={() => safeOpen(r.endPointMapUrl)}
                              className="ml-2 inline-flex items-center gap-1 text-[9px] font-black px-3 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-brick-500 hover:text-white transition-all border border-white/10"
                            >
                              <ExternalLink size={10} /> Map
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="py-8">
                      {r.stops?.length ? (
                        <div className="flex flex-col gap-2">
                          {r.stops.slice(0, 2).map((s, idx) => (
                            <div
                              key={`${r.id}-s-${idx}`}
                              className="flex items-center gap-3 text-xs"
                            >
                              <span className="font-black text-gray-600">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="font-bold text-gray-400">{s.name}</span>
                              {s.mapUrl && (
                                <button
                                  type="button"
                                  onClick={() => safeOpen(s.mapUrl)}
                                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-white hover:bg-brick-500 transition-all shadow-lg"
                                >
                                  <ExternalLink size={10} />
                                </button>
                              )}
                            </div>
                          ))}
                          {r.stops.length > 2 && (
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-7">
                              +{r.stops.length - 2} more...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                          No stops available
                        </span>
                      )}
                    </td>

                    <td className="py-8 font-bold text-gray-500 text-xs tabular-nums tracking-wider uppercase">
                      {formatDate(r.createdAt)}
                    </td>

                    <td className="py-8 text-right">
                      <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-brick-500 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deleteRouteFunc(r.id)}
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
              className="bg-gray-900/90 backdrop-blur-3xl rounded-[3rem] shadow-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar"
            >
              <HeaderModal
                title={modalType === 'add' ? 'Add Route' : 'Update Route'}
                subtitle="Set start/end + dynamic stops with Google Maps URLs."
                onClose={() => setIsModalOpen(false)}
              />

              <form onSubmit={saveRoute} className="p-8 space-y-8">
                {/* route name */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">
                    Route name
                  </label>
                  <input
                    value={form.routeName}
                    onChange={(e) => setForm((p) => ({ ...p, routeName: e.target.value }))}
                    placeholder="Example: Campus → City Center"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-gray-600 outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold"
                  />
                </div>

                {/* start/end */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 text-brick-400 font-black uppercase text-[10px] tracking-widest">
                      <MapPin size={16} /> Start point
                    </div>
                    <div className="space-y-4">
                      <input
                        value={form.startPointName}
                        onChange={(e) => setForm((p) => ({ ...p, startPointName: e.target.value }))}
                        placeholder="Point Name (e.g. Main Gate)"
                        className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-brick-500/30 transition-all font-bold"
                      />
                      <input
                        value={form.startPointMapUrl}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, startPointMapUrl: e.target.value }))
                        }
                        placeholder="Google Maps URL"
                        className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-brick-500/30 transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 text-blue-400 font-black uppercase text-[10px] tracking-widest">
                      <MapPin size={16} /> End point
                    </div>
                    <div className="space-y-4">
                      <input
                        value={form.endPointName}
                        onChange={(e) => setForm((p) => ({ ...p, endPointName: e.target.value }))}
                        placeholder="Point Name (e.g. City Hub)"
                        className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-brick-500/30 transition-all font-bold"
                      />
                      <input
                        value={form.endPointMapUrl}
                        onChange={(e) => setForm((p) => ({ ...p, endPointMapUrl: e.target.value }))}
                        placeholder="Google Maps URL"
                        className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-brick-500/30 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* stops */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-3">
                      <Waypoints size={16} className="text-brick-400" /> Dynamic stops
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-600 uppercase">Count:</span>
                      <select
                        value={stopCount}
                        onChange={(e) => setStopsCountAndResize(Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-black text-xs outline-none focus:border-brick-500/50 transition-all"
                      >
                        {Array.from({ length: 21 }).map((_, i) => (
                          <option
                            key={`stopcount-${i}`}
                            value={i}
                            className="bg-gray-900 text-white"
                          >
                            {i} {i === 1 ? 'Stop' : 'Stops'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {stopCount === 0 ? (
                      <div className="p-8 text-center rounded-3xl border border-dashed border-white/5 text-gray-600 text-xs font-bold uppercase tracking-widest">
                        Configure number of stops using the selector above
                      </div>
                    ) : (
                      Array.from({ length: stopCount }).map((_, idx) => {
                        const stop = form.stops?.[idx] || { name: '', mapUrl: '' };
                        return (
                          <div
                            key={`stop-${idx}`}
                            className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-brick-500/30 transition-all group"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-black text-brick-400 uppercase tracking-widest">
                                STOP #{String(idx + 1).padStart(2, '0')}
                              </span>
                              {stop.mapUrl && (
                                <button
                                  type="button"
                                  onClick={() => safeOpen(stop.mapUrl)}
                                  className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                                >
                                  <ExternalLink size={12} /> Preview Location
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                value={stop.name}
                                onChange={(e) => updateStop(idx, 'name', e.target.value)}
                                placeholder="Stop Name"
                                className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-brick-500/30 transition-all font-bold"
                              />
                              <input
                                value={stop.mapUrl}
                                onChange={(e) => updateStop(idx, 'mapUrl', e.target.value)}
                                placeholder="Google Maps URL"
                                className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-brick-500/30 transition-all font-bold"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* footer note */}
                <div className="p-6 rounded-3xl bg-brick-500/5 border border-brick-500/10">
                  <p className="text-[9px] font-bold text-brick-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Save size={14} /> Note: Maps URLs are currently stored in local UI state.
                  </p>
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
                    className="flex-1 py-5 rounded-3xl font-black text-white bg-brick-500 hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/20 flex justify-center items-center gap-3 text-sm uppercase tracking-widest border border-white/10"
                  >
                    <Save size={20} /> {modalType === 'add' ? 'Save Route' : 'Update changes'}
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
