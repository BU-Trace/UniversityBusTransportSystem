'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Trash2,
  X,
  Save,
  Search,
  Route as RouteIcon,
  Waypoints,
  Pencil,
  ChevronDown,
  ChevronUp,
  Check,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/axios';

/* ── Types ── */
type IStopage = {
  _id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  stopage_id?: string;
};

type IRoute = {
  _id: string;
  route_id?: string;
  name: string;
  stopages: IStopage[];
  isActive?: boolean;
  createdAt?: string;
};

function getErrMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Something went wrong';
}

function formatDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

/* ── Overlay ── */
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Stopage Multi-Select ── */
function StopageMultiSelect({
  allStopages,
  selectedIds,
  onChange,
}: {
  allStopages: IStopage[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? allStopages.filter((s) => s.name.toLowerCase().includes(q)) : allStopages;
  }, [allStopages, search]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedStopages = allStopages.filter((s) => selectedIds.includes(s._id));

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold hover:border-brick-500/30"
      >
        <span className="text-sm">
          {selectedIds.length === 0
            ? 'Select stopages...'
            : `${selectedIds.length} stopage${selectedIds.length > 1 ? 's' : ''} selected`}
        </span>
        {open ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {/* Selected tags */}
      {selectedStopages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedStopages.map((s, i) => (
            <div
              key={s._id}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-brick-500/10 border border-brick-500/20 text-brick-400"
            >
              <span className="text-gray-500 font-black">#{i + 1}</span>
              {s.name}
              <button
                type="button"
                onClick={() => toggle(s._id)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute z-50 left-0 right-0 top-full mt-2 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search inside dropdown */}
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stopages..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-brick-500/30 transition-all"
                />
              </div>
            </div>

            <ul className="max-h-52 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <li className="px-5 py-4 text-gray-500 text-xs font-bold uppercase tracking-widest text-center">
                  No stopages found
                </li>
              ) : (
                filtered.map((s) => {
                  const checked = selectedIds.includes(s._id);
                  return (
                    <li
                      key={s._id}
                      onClick={() => toggle(s._id)}
                      className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors border-b border-white/5 last:border-b-0 ${
                        checked ? 'bg-brick-500/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          checked ? 'bg-brick-500 border-brick-500' : 'border-white/20'
                        }`}
                      >
                        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white">{s.name}</span>
                        {s.stopage_id && (
                          <span className="ml-2 text-[10px] text-gray-500 uppercase">
                            {s.stopage_id}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Page ── */
export default function RouteManagementPage() {
  const { data: session } = useSession();
  const myRole = session?.user?.role;

  const [mounted, setMounted] = useState(false);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [allStopages, setAllStopages] = useState<IStopage[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formStopageIds, setFormStopageIds] = useState<string[]>([]);

  /* ── Body scroll lock ── */
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  /* ── Load all stopages for the picker ── */
  const loadStopages = useCallback(async () => {
    try {
      const res = await api.get('/stopage/get-all-stopages');
      if (res.data.success) setAllStopages(res.data.data as IStopage[]);
    } catch {
      // silently fail, user may not have any stopages yet
    }
  }, []);

  /* ── Load routes ── */
  const loadRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/route');
      if (res.data.success) {
        // Backend populates stopages[] objects when using getAllRoutes (no populate in current service)
        // The service does Route.find() — stopages are ObjectId refs. We get populated objects from the populate pattern.
        // Actually the current service doesn't populate; handle both cases.
        const raw = res.data.data as Array<{
          _id: string;
          route_id?: string;
          name: string;
          stopages?: Array<string | IStopage>;
          isActive?: boolean;
          createdAt?: string;
        }>;
        const normalized: IRoute[] = raw.map((r) => ({
          _id: r._id,
          route_id: r.route_id,
          name: r.name,
          stopages: (r.stopages || []).map((s) =>
            typeof s === 'string'
              ? { _id: s, name: allStopages.find((x) => x._id === s)?.name || s }
              : (s as IStopage)
          ),
          isActive: r.isActive,
          createdAt: r.createdAt,
        }));
        setRoutes(normalized);
      }
    } catch (e) {
      toast.error(getErrMsg(e));
    } finally {
      setLoading(false);
    }
  }, [allStopages]);

  useEffect(() => {
    setMounted(true);
    loadStopages();
  }, [loadStopages]);

  useEffect(() => {
    if (!mounted) return;
    loadRoutes();
  }, [mounted, loadRoutes]);

  /* ── Search filter ── */
  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.stopages.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [routes, query]);

  /* ── Modal helpers ── */
  const openAdd = () => {
    setModalType('add');
    setSelectedRouteId(null);
    setFormName('');
    setFormStopageIds([]);
    setIsModalOpen(true);
  };

  const openEdit = (r: IRoute) => {
    setModalType('edit');
    setSelectedRouteId(r._id);
    setFormName(r.name);
    setFormStopageIds(r.stopages.map((s) => s._id));
    setIsModalOpen(true);
  };

  /* ── Save ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return toast.error('Route name is required.');
    if (formStopageIds.length < 2) return toast.error('A route requires at least 2 stopages.');

    const payload = { name: formName.trim(), stopages: formStopageIds, isActive: true };

    try {
      if (modalType === 'edit' && selectedRouteId) {
        await api.put(`/route/${selectedRouteId}`, payload);
        toast.success('Route updated successfully.');
      } else {
        await api.post('/route/add-route', payload);
        toast.success('Route created successfully.');
      }
      setIsModalOpen(false);
      loadRoutes();
    } catch (e) {
      toast.error(getErrMsg(e));
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete route "${name}" permanently?`)) return;
    try {
      await api.delete(`/route/${id}`);
      setRoutes((prev) => prev.filter((r) => r._id !== id));
      toast.success('Route deleted.');
    } catch (e) {
      toast.error(getErrMsg(e));
    }
  };

  if (!mounted) return null;

  const isAdmin = myRole === 'admin' || myRole === 'superadmin';

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Route Management
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Create routes by selecting existing stopages. Routes are assigned to buses.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full lg:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brick-400 transition-colors"
              size={20}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by route name or stopage..."
              className="w-full pl-12 pr-12 py-4 rounded-3xl border border-white/5 bg-white/5 text-white shadow-2xl outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-medium placeholder:text-gray-600"
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

          {isAdmin && (
            <button
              onClick={openAdd}
              className="w-full lg:w-auto bg-brick-500 text-white px-8 py-5 rounded-4xl font-black text-xs uppercase tracking-widest hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/30 flex items-center justify-center gap-3 border border-white/10"
            >
              <Plus size={20} /> Add Route
            </button>
          )}

          <button
            onClick={loadRoutes}
            className="p-5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-3xl transition-all border border-white/5 shadow-xl"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Routes List */}
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

        <div className="p-8 overflow-x-auto custom-scrollbar flex-1">
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
                {query ? 'No matches found' : 'No routes yet'}
              </h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                {query ? 'Try searching something else.' : 'Add a route and assign buses to it.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-8">Route</th>
                  <th className="pb-8">Stopages</th>
                  <th className="pb-8">Status</th>
                  <th className="pb-8">Created</th>
                  {isAdmin && <th className="pb-8 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRoutes.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all group"
                  >
                    <td className="py-8">
                      <div className="font-black text-white group-hover:text-brick-400 transition-colors text-base tracking-tight">
                        {r.name}
                      </div>
                      {r.route_id && (
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                          {r.route_id}
                        </div>
                      )}
                    </td>

                    <td className="py-8">
                      {r.stopages.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {r.stopages.slice(0, 3).map((s, idx) => (
                            <div
                              key={`${r._id}-s-${idx}`}
                              className="flex items-center gap-3 text-xs"
                            >
                              <span className="font-black text-gray-600 w-5">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <Waypoints size={12} className="text-brick-400 shrink-0" />
                              <span className="font-bold text-gray-300">{s.name}</span>
                            </div>
                          ))}
                          {r.stopages.length > 3 && (
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-8">
                              +{r.stopages.length - 3} more stopages
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                          No stopages
                        </span>
                      )}
                    </td>

                    <td className="py-8">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                          r.isActive !== false
                            ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                            : 'text-gray-500 border-gray-700 bg-white/5'
                        }`}
                      >
                        {r.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-8 font-bold text-gray-500 text-xs tabular-nums tracking-wider uppercase">
                      {formatDate(r.createdAt)}
                    </td>

                    {isAdmin && (
                      <td className="py-8 text-right">
                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-brick-500 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(r._id, r.name)}
                            className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
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
              className="bg-gray-900/95 backdrop-blur-3xl rounded-[3rem] shadow-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-start gap-4 sticky top-0 bg-gray-900/95 backdrop-blur-3xl z-10">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {modalType === 'add' ? 'Add Route' : 'Edit Route'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed">
                    Select from your existing stopages to form this route.
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
                {/* Route Name */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2">
                    Route Name *
                  </label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Campus → City Center"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-gray-600 outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold"
                  />
                </div>

                {/* Stopage Multi-Select */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-2">
                      <Waypoints size={14} className="text-brick-400" /> Select Stopages *
                    </label>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                      Min 2 required
                    </span>
                  </div>

                  {allStopages.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest text-center">
                      ⚠ No stopages found. Add stopages first in Stopage Management.
                    </div>
                  ) : (
                    <StopageMultiSelect
                      allStopages={allStopages}
                      selectedIds={formStopageIds}
                      onChange={setFormStopageIds}
                    />
                  )}
                </div>

                {/* Route preview */}
                {formStopageIds.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <RouteIcon size={12} /> Route Preview
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {formStopageIds.map((id, i) => {
                        const s = allStopages.find((x) => x._id === id);
                        return (
                          <span key={id} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{s?.name || id}</span>
                            {i < formStopageIds.length - 1 && (
                              <span className="text-brick-400 text-xs">→</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

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
                    className="flex-1 py-5 rounded-3xl font-black text-white bg-brick-500 hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/20 flex justify-center items-center gap-3 text-sm uppercase tracking-widest border border-white/10"
                  >
                    <Save size={20} />
                    {modalType === 'add' ? 'Save Route' : 'Update Route'}
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
