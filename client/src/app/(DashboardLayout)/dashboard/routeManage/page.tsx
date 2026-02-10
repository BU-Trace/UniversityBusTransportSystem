'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';

import {
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Search,
  MapPin,
  Route as RouteIcon,
  Waypoints,
  ExternalLink,
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

type UserRole = 'student' | 'driver' | 'admin' | 'superadmin';

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

async function apiFetch<T>(url: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const json = (await res.json().catch(() => ({}))) as any;

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
  const allowed: UserRole[] = ['student', 'driver', 'admin', 'superadmin'];
  return allowed.includes(role as UserRole) ? (role as UserRole) : undefined;
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
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
    <div className="p-6 border-b border-gray-100 flex justify-between items-start gap-4 sticky top-0 bg-white z-10">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
        {subtitle ? <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p> : null}
      </div>
      <button
        onClick={onClose}
        className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <X size={20} />
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
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const displayName = getDisplayName(session);
  const profilePhoto = getProfilePhoto(session);
  const initial = getInitial(displayName);

  const accessToken = (session as any)?.accessToken as string | undefined;
  const myRole = toUserRole((session as any)?.user?.role || null);

  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<IRoute, 'id'>>({ ...initialForm });

  const [stopCount, setStopCount] = useState<number>(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const lock = isOpen || isModalOpen;
    document.body.style.overflow = lock ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isModalOpen]);

  useEffect(() => {
    if (!mounted) return;
    if (!session) return;

    if (myRole !== 'admin' && myRole !== 'superadmin') {
      toast.error('Not authorized');
      router.replace('/');
    }
  }, [mounted, session, myRole, router]);

  function getInitial(name?: string) {
  const n = (name || '').trim();
  return n ? n[0].toUpperCase() : 'U';
}

function getDisplayName(session: any) {
  return session?.user?.name || session?.user?.fullName || session?.user?.username || 'User';
}

function getProfilePhoto(session: any) {
  return session?.user?.photoUrl || session?.user?.profileImage || session?.user?.image || '';
}

  const menuItems = [
    { label: 'Dashboard Overview', href: '/dashboard', icon: MdDashboard },
    { label: 'Bus Management', href: '/dashboard/busManage', icon: MdDirectionsBus },
    { label: 'User Management', href: '/dashboard/userManage', icon: MdPeople },
    { label: 'Route Management', href: '/dashboard/routeManage', icon: MdMap },
    { label: 'Notice Publish', href: '/dashboard/notice', icon: MdNotifications },
  ];

  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) => {
      const stopText = r.stops.map((s) => s.name).join(' ').toLowerCase();
      return (
        r.routeName.toLowerCase().includes(q) ||
        r.startPointName.toLowerCase().includes(q) ||
        r.endPointName.toLowerCase().includes(q) ||
        stopText.includes(q)
      );
    });
  }, [routes, query]);

  const normalizeRoute = (r: RawRoute): IRoute => {
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
      createdAt: r?.createdAt,
    };
  };

  // const loadRoutes = async () => {
  //   setLoading(true);
  //   try {
  //     const json = await apiFetch<ApiResponse<RawRoute[]>>(API.getAllRoutes, {}, accessToken);
  //     const list = (json.data || []).map(normalizeRoute);
  //     setRoutes(list);
  //   } catch (e) {
  //     toast.error(getErrorMessage(e));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      toast.message('Saving route...');

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

  const deleteRoute = async (id: string) => {
    if (!window.confirm('Delete this route permanently?')) return;
    try {
      toast.message('Deleting route...');
      await apiFetch<ApiResponse<null>>(API.deleteRoute(id), { method: 'DELETE' }, accessToken);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Route deleted');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative font-sans text-gray-800">
      {/* mobile menu btn */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#E31E24] text-white rounded-xl shadow-lg"
        >
          <MdMenu size={24} />
        </button>
      )}

      {/* sidebar */}
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
                <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center shadow-lg overflow-hidden">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black italic text-white/80">
                      {initial}
                    </span>
                  )}
                </div>

                <Link
                  href="/dashboard/editProfile"
                  title="Edit Profile"
                  className="absolute bottom-0 right-0 p-1.5 bg-white text-[#E31E24] rounded-full shadow-md hover:scale-105 transition-transform"
                >
                  <MdEdit size={12} />
                </Link>
              </div>

              <h2 className="font-bold text-base uppercase tracking-widest truncate max-w-[220px] text-center">
                {displayName}
              </h2>

            </div>

            <nav className="flex-1 mt-4 px-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                    pathname === item.href ? 'bg-white text-[#E31E24] shadow-md' : 'hover:bg-white/10 text-white/90'
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

      {/* main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full max-w-7xl mx-auto">
          {/* header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Route Management</h1>
              <p className="text-gray-500 text-sm font-medium">
                Create and manage routes. These routes can be assigned to buses.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search route / start / end / stops..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                />
              </div>

              <button
                onClick={openAdd}
                className="bg-[#E31E24] text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} /> Add Route
              </button>

              <button
                onClick={loadRoutes}
                className="bg-white border border-gray-200 px-5 py-3 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <RouteIcon size={18} className="text-[#E31E24]" /> Refresh
              </button>
            </div>
          </div>

          {/* list */}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden min-h-[520px] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-lg text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <MdMap className="text-[#E31E24]" /> Routes List
              </h3>
              <div className="text-xs font-black text-gray-400">
                Total: <span className="text-gray-700">{loading ? '...' : filteredRoutes.length}</span>
              </div>
            </div>

            <div className="p-6 overflow-x-auto">
              {loading ? (
                <div className="text-center py-20 text-gray-500 font-bold">Loading routes...</div>
              ) : filteredRoutes.length === 0 ? (
                <div className="text-center py-20">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                    <RouteIcon className="text-[#E31E24]" />
                  </div>
                  <h4 className="mt-4 font-black text-gray-900">No routes found</h4>
                  <p className="text-sm text-gray-500 mt-1">Add a route to make it available for bus assignment.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-4">Route</th>
                      <th className="pb-4">Start → End</th>
                      <th className="pb-4">Stops</th>
                      <th className="pb-4">Created</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredRoutes.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                        <td className="py-4">
                          <div className="font-black text-gray-900">{r.routeName}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <Waypoints size={14} />
                            {r.stops?.length || 0} stops
                          </div>
                        </td>

                        <td className="py-4 text-xs text-gray-700">
                          <div className="font-black flex items-center gap-2">
                            <MapPin size={14} className="text-[#E31E24]" />
                            {r.startPointName || '—'}
                            {r.startPointMapUrl ? (
                              <button
                                type="button"
                                onClick={() => safeOpen(r.startPointMapUrl)}
                                className="ml-2 inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                              >
                                <ExternalLink size={12} /> Map
                              </button>
                            ) : null}
                          </div>
                          <div className="mt-2 font-black flex items-center gap-2">
                            <MapPin size={14} className="text-blue-600" />
                            {r.endPointName || '—'}
                            {r.endPointMapUrl ? (
                              <button
                                type="button"
                                onClick={() => safeOpen(r.endPointMapUrl)}
                                className="ml-2 inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                              >
                                <ExternalLink size={12} /> Map
                              </button>
                            ) : null}
                          </div>
                        </td>

                        <td className="py-4 text-xs text-gray-600">
                          {r.stops?.length ? (
                            <div className="space-y-1">
                              {r.stops.slice(0, 3).map((s, idx) => (
                                <div key={`${r.id}-s-${idx}`} className="flex items-center gap-2">
                                  <span className="font-black text-gray-500">{idx + 1}.</span>
                                  <span className="font-semibold">{s.name}</span>
                                  {s.mapUrl ? (
                                    <button
                                      type="button"
                                      onClick={() => safeOpen(s.mapUrl)}
                                      className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                    >
                                      <ExternalLink size={12} /> Map
                                    </button>
                                  ) : null}
                                </div>
                              ))}
                              {r.stops.length > 3 ? (
                                <div className="text-[11px] font-black text-gray-400">+{r.stops.length - 3} more...</div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="font-black text-gray-400">No stops</span>
                          )}
                        </td>

                        <td className="py-4 text-xs text-gray-600">{formatDate(r.createdAt)}</td>

                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteRoute(r.id)}
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

      {/* modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.96, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 24 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="bg-white rounded-[2.2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <HeaderModal
                title={modalType === 'add' ? 'Add Route' : 'Update Route'}
                subtitle="Set start/end + dynamic stops with Google Maps URLs."
                onClose={() => setIsModalOpen(false)}
              />

              <form onSubmit={saveRoute} className="p-8 space-y-6">
                {/* route name */}
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 mb-1 block">Route Name</label>
                  <input
                    value={form.routeName}
                    onChange={(e) => setForm((p) => ({ ...p, routeName: e.target.value }))}
                    placeholder="Example: Campus → City Center"
                    className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* start/end */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <div className="text-xs font-black uppercase text-gray-700 flex items-center gap-2">
                      <MapPin size={16} className="text-[#E31E24]" />
                      Start & End Points
                    </div>
                    <div className="text-[11px] text-gray-500 font-bold">Must include Google Maps URLs</div>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-1 block">Start Point Name</label>
                      <input
                        value={form.startPointName}
                        onChange={(e) => setForm((p) => ({ ...p, startPointName: e.target.value }))}
                        placeholder="Example: Main Gate"
                        className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-1 block">Start Point Map URL</label>
                      <input
                        value={form.startPointMapUrl}
                        onChange={(e) => setForm((p) => ({ ...p, startPointMapUrl: e.target.value }))}
                        placeholder="https://maps.google.com/..."
                        className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-1 block">End Point Name</label>
                      <input
                        value={form.endPointName}
                        onChange={(e) => setForm((p) => ({ ...p, endPointName: e.target.value }))}
                        placeholder="Example: City Center"
                        className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-gray-500 mb-1 block">End Point Map URL</label>
                      <input
                        value={form.endPointMapUrl}
                        onChange={(e) => setForm((p) => ({ ...p, endPointMapUrl: e.target.value }))}
                        placeholder="https://maps.google.com/..."
                        className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => safeOpen(form.startPointMapUrl)}
                      disabled={!form.startPointMapUrl}
                      className="px-4 py-2 rounded-xl font-black text-xs bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ExternalLink size={14} /> Preview Start Map
                    </button>

                    <button
                      type="button"
                      onClick={() => safeOpen(form.endPointMapUrl)}
                      disabled={!form.endPointMapUrl}
                      className="px-4 py-2 rounded-xl font-black text-xs bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ExternalLink size={14} /> Preview End Map
                    </button>
                  </div>
                </div>

                {/* stops */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="text-xs font-black uppercase text-gray-700 flex items-center gap-2">
                      <Waypoints size={16} className="text-[#E31E24]" />
                      Stops
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-gray-500">Number of stops</span>
                      <select
                        value={stopCount}
                        onChange={(e) => setStopsCountAndResize(Number(e.target.value))}
                        className="p-2 rounded-xl border border-gray-200 bg-white font-black text-sm outline-none focus:border-red-500"
                      >
                        {Array.from({ length: 21 }).map((_, i) => (
                          <option key={`stopcount-${i}`} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {stopCount === 0 ? (
                      <div className="text-sm text-gray-500 font-medium">
                        No stops selected. If your route has stops, set the number above.
                      </div>
                    ) : (
                      Array.from({ length: stopCount }).map((_, idx) => {
                        const stop = form.stops?.[idx] || { name: '', mapUrl: '' };
                        return (
                          <div key={`stop-${idx}`} className="rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-black text-gray-900">Stop #{idx + 1}</div>
                              <button
                                type="button"
                                onClick={() => safeOpen(stop.mapUrl)}
                                disabled={!stop.mapUrl}
                                className="px-3 py-2 rounded-xl font-black text-xs bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                <ExternalLink size={14} /> Preview
                              </button>
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-black uppercase text-gray-500 mb-1 block">Stop Name</label>
                                <input
                                  value={stop.name}
                                  onChange={(e) => updateStop(idx, 'name', e.target.value)}
                                  placeholder="Example: Library"
                                  className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-black uppercase text-gray-500 mb-1 block">
                                  Stop Map URL
                                </label>
                                <input
                                  value={stop.mapUrl}
                                  onChange={(e) => updateStop(idx, 'mapUrl', e.target.value)}
                                  placeholder="https://maps.google.com/..."
                                  className="w-full p-3 rounded-2xl border border-gray-200 outline-none focus:border-red-500 bg-gray-50 focus:bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* actions */}
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
                    className="flex-1 py-4 rounded-2xl font-black text-white bg-[#E31E24] hover:bg-red-700 transition-colors shadow-lg flex justify-center items-center gap-2"
                  >
                    <Save size={18} />
                    {modalType === 'add' ? 'Save Route' : 'Save Changes'}
                  </button>
                </div>

                <div className="text-[11px] text-gray-400 font-bold">
                  Note: Your backend currently stores only route name + stop names (as stopages). Map URLs and start/end
                  URLs are kept only in UI for now.
                </div>
              </form>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}
