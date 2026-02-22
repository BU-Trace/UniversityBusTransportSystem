'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Navigation,
  RefreshCw,
  Upload,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
// Native time input used instead of react-time-picker

// --- Types & Interfaces ---

interface IBus {
  _id: string; // aligned with backend
  bus_id?: string;
  name: string;
  plateNumber: string;
  route: string | { _id: string; name: string }; // ObjectId as string or object
  photo: string;
  driverId: string; // ObjectId as string
  isActive?: boolean;
  status?: 'running' | 'paused' | 'stopped';
}

interface IRoute {
  _id: string; // aligned with backend
  route_id?: string;
  name: string;
  stopages: string[]; // Array of ObjectIds as strings
  bus: string[]; // Array of ObjectIds as strings
  isActive?: boolean;
  activeHoursComing?: string[];
  activeHoursGoing?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface IStopage {
  _id: string;
  stopage_id?: string;
  name: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
  createdAt?: string;
}

// --- Cloudinary Upload ---

const CLOUD_NAME = 'dpiofecgs';
const UPLOAD_PRESET = 'butrace';

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

// --- Constants & Helpers ---

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const API = {
  getBuses: `${BASE_URL}/bus/get-all-buses`,
  getRoutes: `${BASE_URL}/route`,
  saveBus: `${BASE_URL}/bus/add-bus`,
  updateBus: (id: string) => `${BASE_URL}/bus/update-bus/${id}`,
  deleteBus: (id: string) => `${BASE_URL}/bus/delete-bus/${id}`,
  saveRoute: `${BASE_URL}/route/add-route`,
  updateRoute: (id: string) => `${BASE_URL}/route/${id}`,
  deleteRoute: (id: string) => `${BASE_URL}/route/${id}`,
  getStopages: `${BASE_URL}/stopage/get-all-stopages`,
  createStopage: `${BASE_URL}/stopage/add-stopage`,
  updateStopage: (id: string) => `${BASE_URL}/stopage/update-stopage/${id}`,
  deleteStopage: (id: string) => `${BASE_URL}/stopage/delete-stopage/${id}`,
  getDrivers: `${BASE_URL}/user/get-all-drivers`,
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
    <div className="p-8 border-b border-white/5 flex justify-between items-start gap-4 sticky top-0 bg-gray-900/90 backdrop-blur-3xl z-10 transition-colors">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed">{subtitle}</p>
        )}
      </div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="p-3 bg-white/5 text-gray-400 rounded-2xl hover:bg-brick-500 hover:text-white transition-all shadow-lg border border-white/10"
      >
        <X size={24} />
      </motion.button>
    </div>
  );
}

function DeleteConfirmationModal({
  isOpen,
  title,
  itemName,
  onConfirm,
  onCancel,
  loading,
}: {
  isOpen: boolean;
  title: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay onClose={onCancel}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-3xl text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <Trash2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-gray-400 font-medium mb-8">
              Are you sure you want to delete{' '}
              <span className="text-white font-bold">{itemName}</span>? This action cannot be
              undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-widest border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

// --- Time Slot Picker ---

/** Convert stored "08:00 AM - 10:00 AM" ↔ 24-hr "HH:MM" for <input type="time"> */
function slotToInputs(value: string): { start: string; end: string } {
  const empty = { start: '', end: '' };
  if (!value || value.trim() === '') return empty;
  const m = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return empty;
  const to24 = (h: string, min: string, ampm: string) => {
    let hour = parseInt(h);
    if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${min}`;
  };
  return { start: to24(m[1], m[2], m[3]), end: to24(m[4], m[5], m[6]) };
}

function inputsToSlot(start: string, end: string): string {
  if (!start || !end) return '';
  const fmt = (t: string) => {
    if (!t || !t.includes(':')) return '--:--';
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr);
    if (isNaN(h)) return '--:--';
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${(mStr || '00').padStart(2, '0')} ${ampm}`;
  };
  const s = fmt(start);
  const e = fmt(end);
  if (s === '--:--' || e === '--:--') return '';
  return `${s} - ${e}`;
}

// --- Premium Time Slot Picker (native <input type="time"> based) ---

function TimeSlotPicker({
  value,
  onChange,
  onRemove,
  isLast,
  onAdd,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  isLast: boolean;
  onAdd: () => void;
  accentColor: 'emerald' | 'blue';
}) {
  const { start: initStart, end: initEnd } = slotToInputs(value);
  const [start, setStart] = useState(initStart);
  const [end, setEnd] = useState(initEnd);

  // Sync local state when parent changes value (e.g. editing existing route)
  useEffect(() => {
    const { start: s, end: e } = slotToInputs(value);
    setStart(s);
    setEnd(e);
  }, [value]);

  const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const s = e.target.value;
    setStart(s);
    onChange(inputsToSlot(s, end));
  };
  const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const en = e.target.value;
    setEnd(en);
    onChange(inputsToSlot(start, en));
  };

  const isEmerald = accentColor === 'emerald';
  const badge = isEmerald
    ? 'bg-emerald-500/15 text-white border-emerald-500/20'
    : 'bg-blue-500/15 text-white border-blue-500/20';
  const glow = isEmerald
    ? 'shadow-[0_0_12px_rgba(16,185,129,0.15)]'
    : 'shadow-[0_0_12px_rgba(59,130,246,0.15)]';
  const addBtn = isEmerald
    ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/50'
    : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/15 hover:border-blue-500/50';

  const preview = inputsToSlot(start, end);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`group relative rounded-2xl p-5 pt-9 transition-all duration-300 border ${
        isEmerald
          ? 'bg-emerald-950/20 border-emerald-500/15 hover:border-emerald-500/30'
          : 'bg-blue-950/20 border-blue-500/15 hover:border-blue-500/30'
      } ${glow}`}
    >
      {/* Time inputs row */}
      <div className="flex items-center gap-2">
        {/* Start time */}
        <div className="flex-1 space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Start</p>
          <input
            type="time"
            value={start}
            onChange={handleStart}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            className={`w-full px-3 py-3 rounded-xl text-sm font-semibold text-white outline-none transition-all duration-200 [color-scheme:dark] tabular-nums border cursor-pointer ${
              isEmerald
                ? 'bg-emerald-950/40 border-emerald-500/20 focus:border-emerald-400/60 focus:bg-emerald-950/60 focus:shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-blue-950/40 border-blue-500/20 focus:border-blue-400/60 focus:bg-blue-950/60 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
            }`}
          />
        </div>

        {/* Arrow connector */}
        <div className="pt-5 shrink-0">
          <div className="text-xs font-black text-white">→</div>
        </div>

        {/* End time */}
        <div className="flex-1 space-y-1.5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">End</p>
          <input
            type="time"
            value={end}
            onChange={handleEnd}
            onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
            className={`w-full px-3 py-3 rounded-xl text-sm font-semibold text-white outline-none transition-all duration-200 [color-scheme:dark] tabular-nums border cursor-pointer ${
              isEmerald
                ? 'bg-emerald-950/40 border-emerald-500/20 focus:border-emerald-400/60 focus:bg-emerald-950/60 focus:shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-blue-950/40 border-blue-500/20 focus:border-blue-400/60 focus:bg-blue-950/60 focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
            }`}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1.5 pt-5 shrink-0">
          {isLast && (
            <motion.button
              type="button"
              onClick={onAdd}
              title="Add slot"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-lg border bg-transparent transition-all duration-200 ${addBtn}`}
            >
              <Plus size={13} />
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={onRemove}
            title="Remove slot"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg border border-red-500/25 bg-transparent hover:bg-red-500/15 hover:border-red-400/50 text-red-400 hover:text-red-400 transition-all duration-200"
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>

      {/* Preview pill */}
      {preview ? (
        <div
          className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold tabular-nums ${badge}`}
        >
          <Clock size={10} className="text-white" />
          {preview}
        </div>
      ) : (
        <div className="mt-4  inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/8 text-[10px] font-bold text-white italic">
          <Clock size={10} className="text-white" />
          Not set
        </div>
      )}
    </motion.div>
  );
}

// --- Main Page Component ---

/* ── Nominatim (OpenStreetMap) Location Picker ── */
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

function LocationPickerInput({
  onLocationSelect,
  defaultValue = '',
  initialCoords,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultValue?: string;
  initialCoords?: { lat: number; lng: number };
}) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    initialCoords || null
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || input.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setFetching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400);
  };

  const selectPlace = (place: NominatimResult) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setQuery(place.display_name);
    setSuggestions([]);
    setOpen(false);
    setSelectedCoords({ lat, lng });
    onLocationSelect(lat, lng);
  };

  // Build OpenStreetMap embed URL for preview
  const mapEmbedUrl = selectedCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedCoords.lng - 0.006},${selectedCoords.lat - 0.004},${selectedCoords.lng + 0.006},${selectedCoords.lat + 0.004}&layer=mapnik&marker=${selectedCoords.lat},${selectedCoords.lng}`
    : null;

  return (
    <div className="space-y-4" ref={wrapperRef}>
      <div className="relative">
        <div className="relative">
          <Navigation
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brick-400"
            size={18}
          />
          <input
            value={query}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search location (e.g. Barishal University Gate)"
            className={`w-full pl-12 p-10 pr-6 py-4 bg-white/5 border rounded-2xl text-white placeholder:text-gray-600 outline-none transition-all font-medium ${
              fetching
                ? 'border-brick-500/50 ring-4 ring-brick-500/10'
                : 'border-white/10 focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10'
            }`}
          />
          {fetching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brick-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <AnimatePresence>
          {open && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute z-50 left-0 right-0 top-full mt-2 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto"
            >
              <ul>
                {suggestions.map((s) => (
                  <li
                    key={s.place_id}
                    onClick={() => selectPlace(s)}
                    className="flex items-start gap-3 px-5 py-3  cursor-pointer hover:bg-brick-500/10 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <MapPin className="text-brick-400 mt-0.5 shrink-0" size={16} />
                    <span className="text-sm text-white font-medium leading-snug">
                      {s.display_name}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Coordinate display */}
      {selectedCoords && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
          <MapPin className="text-brick-400 shrink-0" size={14} />
          <span className="text-xs font-bold text-gray-300 tabular-nums">
            {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
          </span>
        </div>
      )}

      {/* Map Preview */}
      <div className="relative h-56 w-full rounded-4xl overflow-hidden border border-white/5 shadow-3xl bg-black/40 group">
        {mapEmbedUrl ? (
          <iframe
            key={`${selectedCoords?.lat}-${selectedCoords?.lng}`}
            src={mapEmbedUrl}
            className="absolute inset-0 w-full h-full grayscale-[0.3] contrast-[1.1] brightness-[0.85] group-hover:grayscale-0 transition-all duration-700"
            style={{ border: 0 }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-brick-500/20 blur-xl rounded-full animate-pulse" />
                <MapPin className="text-brick-400/60 relative" size={32} />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] opacity-50">
                Search a location to preview
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'buses' | 'routes' | 'stopages'>('buses');

  // Data State
  const [buses, setBuses] = useState<IBus[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [stopages, setStopages] = useState<IStopage[]>([]);
  const [query, setQuery] = useState('');

  // Bus Modal State
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [busModalType, setBusModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [busForm, setBusForm] = useState<Partial<IBus>>({
    name: '',
    plateNumber: '',
    route: '',
    photo: '',
    driverId: '',
  });

  // Route Modal State
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeModalType, setRouteModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState<Omit<IRoute, '_id'>>({
    name: '',
    stopages: [],
    bus: [],
    activeHoursComing: [''],
    activeHoursGoing: [''],
    isActive: true,
  });

  // Stopage Modal State
  const [isStopageModalOpen, setIsStopageModalOpen] = useState(false);
  const [stopageModalType, setStopageModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedStopageId, setSelectedStopageId] = useState<string | null>(null);
  const [stopageForm, setStopageForm] = useState<{
    name: string;
    latitude: number | '';
    longitude: number | '';
  }>({
    name: '',
    latitude: '',
    longitude: '',
  });
  const [stopageLoading, setStopageLoading] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'bus' | 'route' | 'stopage' | null;
    id: string | null;
    name: string | null;
    loading: boolean;
  }>({
    isOpen: false,
    type: null,
    id: null,
    name: null,
    loading: false,
  });

  // Drivers State
  const [drivers, setDrivers] = useState<{ _id: string; name: string }[]>([]);

  // Photo upload state
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [routesData, busesData, driversData] = await Promise.all([
        apiFetch<IRoute[]>(API.getRoutes, {}, accessToken),
        apiFetch<IBus[]>(API.getBuses, {}, accessToken),
        apiFetch<{ _id: string; name: string }[]>(API.getDrivers, {}, accessToken),
      ]);
      setRoutes(routesData || []);
      setBuses(busesData || []);
      setDrivers(driversData || []);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }, [accessToken]);

  const loadStopages = useCallback(async () => {
    if (!accessToken) return;
    setStopageLoading(true);
    try {
      const data = await apiFetch<IStopage[]>(API.getStopages, {}, accessToken);
      setStopages(data || []);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setStopageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!mounted || !session) return;
    loadData();
    loadStopages();
  }, [mounted, session, loadData, loadStopages]);

  // Filters
  const filteredBuses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buses;
    return buses.filter((b) => {
      const routeName =
        typeof b.route === 'object'
          ? b.route?.name
          : routes.find((r) => r._id === b.route)?.name || '';
      return (
        b?.name?.toLowerCase()?.includes(q) ||
        b?.plateNumber?.toLowerCase()?.includes(q) ||
        routeName?.toLowerCase()?.includes(q)
      );
    });
  }, [buses, routes, query]);

  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) => (r?.name || '').toLowerCase().includes(q));
  }, [routes, query]);

  const filteredStopages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stopages;
    return stopages.filter((s) => (s?.name || '').toLowerCase().includes(q));
  }, [stopages, query]);

  // --- Bus Handlers ---

  const openAddBus = () => {
    setBusModalType('add');
    setSelectedBusId(null);
    setBusForm({ name: '', plateNumber: '', route: '', photo: '', driverId: '' });
    setIsBusModalOpen(true);
  };

  const openEditBus = (bus: IBus) => {
    setBusModalType('edit');
    setSelectedBusId(bus._id);
    setBusForm({
      name: bus.name,
      plateNumber: bus.plateNumber,
      route:
        typeof bus.route === 'object' && bus.route !== null
          ? (bus.route as { _id: string })._id
          : (bus.route as string) || '',
      photo: bus.photo,
      driverId: bus.driverId,
    });
    setIsBusModalOpen(true);
  };

  const handleBusSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busForm.name?.trim()) return toast.error('Bus name required');
    if (!busForm.route) return toast.error('Select a route');
    if (!busForm.driverId) return toast.error('Assign a driver');

    try {
      if (busModalType === 'edit' && selectedBusId) {
        await apiFetch(
          API.updateBus(selectedBusId),
          {
            method: 'PUT',
            body: JSON.stringify(busForm),
          },
          accessToken
        );
        toast.success('Bus updated');
      } else {
        await apiFetch(
          API.saveBus,
          {
            method: 'POST',
            body: JSON.stringify(busForm),
          },
          accessToken
        );
        toast.success('Bus registered');
      }
      setIsBusModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // --- Route Handlers ---

  const openAddRoute = () => {
    setRouteModalType('add');
    setSelectedRouteId(null);
    setRouteForm({
      name: '',
      stopages: [],
      bus: [],
      activeHoursComing: [''],
      activeHoursGoing: [''],
      isActive: true,
    } as unknown as Omit<IRoute, '_id'>);
    setIsRouteModalOpen(true);
  };

  const openEditRoute = (r: IRoute) => {
    setRouteModalType('edit');
    setSelectedRouteId(r._id);
    setRouteForm({
      ...r,
      stopages: (r.stopages || [])
        .map((s: string | { _id: string } | null) =>
          typeof s === 'object' && s !== null ? s._id : s
        )
        .filter((id): id is string => !!id),
      bus: (r.bus || [])
        .map((b: string | { _id: string } | null) =>
          typeof b === 'object' && b !== null ? b._id : b
        )
        .filter((id): id is string => !!id),
    });
    setIsRouteModalOpen(true);
  };

  const handleRouteSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.name.trim()) return toast.error('Route name required');
    try {
      const payload = {
        ...routeForm,
        activeHoursComing: routeForm.activeHoursComing?.filter((h) => h.trim()),
        activeHoursGoing: routeForm.activeHoursGoing?.filter((h) => h.trim()),
      };

      if (routeModalType === 'edit' && selectedRouteId) {
        await apiFetch(
          API.updateRoute(selectedRouteId),
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          },
          accessToken
        );
        toast.success('Route updated');
      } else {
        await apiFetch(
          API.saveRoute,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
          accessToken
        );
        toast.success('Route created');
      }
      setIsRouteModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // --- Stopage Handlers ---

  const openAddStopage = () => {
    setStopageModalType('add');
    setSelectedStopageId(null);
    setStopageForm({ name: '', latitude: '', longitude: '' });
    setIsStopageModalOpen(true);
  };

  const openEditStopage = (s: IStopage) => {
    setStopageModalType('edit');
    setSelectedStopageId(s._id);
    setStopageForm({ name: s.name, latitude: s.latitude, longitude: s.longitude });
    setIsStopageModalOpen(true);
  };

  const handleStopageSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopageForm.name.trim()) return toast.error('Stopage name is required.');
    if (stopageForm.latitude === '' || stopageForm.longitude === '')
      return toast.error('Please select a location from the map.');
    const payload = {
      name: stopageForm.name.trim(),
      latitude: Number(stopageForm.latitude),
      longitude: Number(stopageForm.longitude),
    };
    try {
      if (stopageModalType === 'edit' && selectedStopageId) {
        await apiFetch(
          API.updateStopage(selectedStopageId),
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          },
          accessToken
        );
        toast.success('Stopage updated.');
      } else {
        await apiFetch(
          API.createStopage,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
          accessToken
        );
        toast.success('Stopage added.');
      }
      setIsStopageModalOpen(false);
      loadStopages();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.type || !accessToken) return;
    setDeleteModal((p) => ({ ...p, loading: true }));
    try {
      let url = '';
      if (deleteModal.type === 'bus') url = API.deleteBus(deleteModal.id);
      else if (deleteModal.type === 'route') url = API.deleteRoute(deleteModal.id);
      else if (deleteModal.type === 'stopage') url = API.deleteStopage(deleteModal.id);

      await apiFetch(url, { method: 'DELETE' }, accessToken);
      toast.success(
        `${deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)} deleted.`
      );

      if (deleteModal.type === 'stopage') loadStopages();
      else loadData();

      setDeleteModal({ isOpen: false, type: null, id: null, name: null, loading: false });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleteModal((p) => ({ ...p, loading: false }));
    }
  };

  const openDeleteModal = (type: 'bus' | 'route' | 'stopage', id: string, name: string) => {
    setDeleteModal({ isOpen: true, type, id, name, loading: false });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12 pb-12 flex flex-col gap-5">
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

        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="relative flex-1 w-full group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brick-400 transition-colors"
              size={20}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'buses' ? 'buses...' : activeTab === 'routes' ? 'routes...' : 'stopages...'}`}
              className="w-full p-10 pl-12 pr-6 py-4 rounded-3xl border border-white/5 bg-white/5 text-white shadow-2xl outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-medium placeholder:text-gray-600"
            />
          </div>
          <button
            onClick={() => {
              if (activeTab === 'buses') openAddBus();
              else if (activeTab === 'routes') openAddRoute();
              else openAddStopage();
            }}
            className="flex-1 w-full bg-brick-500 text-white px-8 py-5 rounded-4xl font-black text-xs uppercase tracking-widest hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/30 flex items-center justify-center gap-3 border border-white/10"
          >
            <Plus size={20} /> Add{' '}
            {activeTab === 'buses' ? 'Bus' : activeTab === 'routes' ? 'Route' : 'Stopage'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex  p-1.5 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 w-fit">
        {(
          [
            { id: 'buses', label: 'Buses', icon: BusIcon },
            { id: 'routes', label: 'Routes', icon: RouteIcon },
            { id: 'stopages', label: 'Stopages', icon: Navigation },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setQuery('');
            }}
            className={`
              flex items-center gap-3 px-10 py-5 rounded-4xl font-black text-xs uppercase tracking-widest transition-all
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
      <div className="bg-white/5 mt-10 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden min-h-[500px] flex flex-col">
        {/* List Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-xl text-white uppercase tracking-wider flex items-center gap-4">
            {activeTab === 'buses' ? (
              <BusIcon className="text-brick-400" size={28} />
            ) : activeTab === 'routes' ? (
              <RouteIcon className="text-brick-400" size={28} />
            ) : (
              <Navigation className="text-brick-400" size={28} />
            )}
            {activeTab === 'buses'
              ? 'Fleet Inventory'
              : activeTab === 'routes'
                ? 'Network Routes'
                : 'Stopages'}
          </h3>
          <div className="flex items-center gap-3">
            {activeTab === 'stopages' && (
              <button
                onClick={loadStopages}
                className="p-2.5 bg-white/5 text-gray-400 hover:text-white rounded-2xl transition-all border border-white/5"
              >
                <RefreshCw size={16} className={stopageLoading ? 'animate-spin' : ''} />
              </button>
            )}
            <div className="text-xs font-black text-gray-400 tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10">
              TOTAL:{' '}
              <span className="text-brick-400 ml-1">
                {activeTab === 'buses'
                  ? filteredBuses.length
                  : activeTab === 'routes'
                    ? filteredRoutes.length
                    : filteredStopages.length}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 pt-20 pb-8 overflow-x-auto custom-scrollbar">
          {activeTab === 'stopages' ? (
            /* --- STOPAGE TABLE --- */
            stopageLoading ? (
              <div className="py-24 text-center">
                <div className="mx-auto w-12 h-12 border-4 border-brick-500/20 border-t-brick-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                  Loading stopages...
                </p>
              </div>
            ) : filteredStopages.length === 0 ? (
              <div className="py-24 text-center">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-brick-500/10 flex items-center justify-center mb-6 text-brick-500">
                  <Navigation size={32} />
                </div>
                <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
                  {query ? 'No matches' : 'No stopages yet'}
                </h4>
                <p className="text-gray-500 font-medium">
                  {query ? 'Try another term.' : 'Add your first bus stopage.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                    <th className="pb-8">Name</th>
                    <th className="pb-8">ID</th>
                    <th className="pb-8">Latitude</th>
                    <th className="pb-8">Longitude</th>
                    <th className="pb-8">Status</th>
                    <th className="pb-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredStopages.map((s) => (
                    <tr
                      key={s._id}
                      className="border-b   border-white/5 hover:bg-white/5   transition-all group"
                    >
                      <td className="py-8">
                        <div className="font-black text-white group-hover:text-brick-400 transition-colors text-base tracking-tight">
                          {s.name}
                        </div>
                      </td>
                      <td className="py-8">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          {s.stopage_id || '—'}
                        </span>
                      </td>
                      <td className="py-8">
                        <span className="text-xs font-bold text-gray-300 tabular-nums">
                          {s.latitude?.toFixed(5) ?? '—'}
                        </span>
                      </td>
                      <td className="py-8">
                        <span className="text-xs font-bold text-gray-300 tabular-nums">
                          {s.longitude?.toFixed(5) ?? '—'}
                        </span>
                      </td>
                      <td className="py-8">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                            s.isActive !== false
                              ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                              : 'text-gray-500 border-gray-700 bg-white/5'
                          }`}
                        >
                          {s.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-8 text-right">
                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                          <button
                            onClick={() => openEditStopage(s)}
                            className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-brick-500 rounded-2xl border border-white/10 shadow-xl"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal('stopage', s._id, s.name)}
                            className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl border border-white/10 shadow-xl"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : activeTab === 'buses' ? (
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
                    key={bus._id}
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
                            ID: #{bus._id?.slice(-4)}
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
                      <div className="font-bold text-white text-xs">
                        {typeof bus.route === 'object' && bus.route !== null
                          ? (bus.route as { name: string }).name
                          : routes.find((r) => r._id === bus.route)?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="py-8">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <MapPin size={14} className="text-emerald-400" />
                        {drivers.find((d) => d && d._id === bus.driverId)?.name || 'No Pilot'}
                      </div>
                    </td>
                    <td className="py-8">
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60 flex items-center gap-2">
                        <Navigation size={12} /> Live Status
                      </div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${bus.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}
                        />
                        {bus.status || 'Stopped'}
                      </div>
                    </td>
                    <td className="py-8 text-right">
                      <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <button
                          onClick={() => openEditBus(bus)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-brick-400 hover:bg-brick-500/20 rounded-2xl border border-white/10 shadow-xl"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal('bus', bus._id, bus.name)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl border border-white/10 shadow-xl"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'routes' ? (
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
                    key={r._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all group"
                  >
                    <td className="py-8">
                      <div className="font-black text-white text-base tracking-tight">{r.name}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-500">
                        <Waypoints size={14} className="text-brick-400" /> {r.stopages?.length || 0}{' '}
                        stops
                      </div>
                    </td>
                    <td className="py-8">
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {(r.bus || []).map((bid: string | { _id: string } | null, i) => {
                          const id = typeof bid === 'object' && bid !== null ? bid._id : bid;
                          if (!id) return null;
                          const b = buses.find((bus) => bus._id === id);
                          if (!b) return null;
                          return (
                            <span
                              key={i}
                              className="text-[10px] font-black text-white bg-white/5 px-2 py-1 rounded-lg border border-white/10"
                            >
                              {b.name}
                            </span>
                          );
                        })}
                        {(r.bus || []).length === 0 && (
                          <span className="text-gray-600 italic">No fleet</span>
                        )}
                      </div>
                    </td>
                    <td className="py-8">
                      <div className="flex flex-col gap-2">
                        {(r.stopages || [])
                          .slice(0, 2)
                          .map((sid: string | { _id: string } | null, i) => {
                            const id = typeof sid === 'object' && sid !== null ? sid._id : sid;
                            if (!id) return null;
                            const s = stopages.find((st) => st._id === id);
                            if (!s) return null;
                            return (
                              <div key={i} className="flex items-center gap-3 text-xs">
                                <span className="font-black text-gray-600">
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="font-bold text-gray-400 truncate max-w-[120px]">
                                  {s.name}
                                </span>
                              </div>
                            );
                          })}
                        {(r.stopages || []).length > 2 && (
                          <div className="text-[10px] font-black text-gray-600 uppercase">
                            +{(r.stopages || []).length - 2} more...
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
                        <button
                          onClick={() => openDeleteModal('route', r._id, r.name)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl border border-white/10 shadow-xl"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>

      {/* --- MODALS --- */}

      <AnimatePresence>
        {isBusModalOpen && (
          <Overlay onClose={() => setIsBusModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.9, y: 20, opacity: 0, filter: 'blur(10px)' }}
              className="bg-gray-950/40 backdrop-blur-3xl rounded-[4rem] shadow-4xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar overflow-x-hidden"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50" />

              <HeaderModal
                title={busModalType === 'add' ? 'Register Bus' : 'Update Bus'}
                subtitle="Assign routes and set operating hours."
                onClose={() => setIsBusModalOpen(false)}
              />
              <form onSubmit={handleBusSave} className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2 flex items-center gap-2 group-focus-within:text-brick-400 transition-colors">
                      Bus Name
                    </label>
                    <input
                      value={busForm.name}
                      onChange={(e) =>
                        setBusForm((p: Partial<IBus>) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. University Express"
                      className="w-full bg-white/5 border border-white/5 rounded-4xl p-6 text-white text-lg placeholder:text-gray-700 outline-none focus:border-brick-500/30 focus:bg-white/[0.07] transition-all font-black"
                    />
                  </div>
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2 flex items-center gap-2 group-focus-within:text-brick-400 transition-colors">
                      Plate Number
                    </label>
                    <input
                      value={busForm.plateNumber}
                      onChange={(e) =>
                        setBusForm((p: Partial<IBus>) => ({ ...p, plateNumber: e.target.value }))
                      }
                      placeholder="DHK-METRO-KA-0000"
                      className="w-full bg-white/5 border border-white/5 rounded-4xl p-6 text-white text-lg placeholder:text-gray-700 outline-none focus:border-brick-500/30 focus:bg-white/[0.07] transition-all font-black"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black uppercase text-white bg-brick-500/10 px-4 py-1.5 rounded-full border border-brick-500/20 tracking-[0.2em] shadow-[0_0_15px_rgba(239,68,68,0.1)] ml-2 inline-flex items-center gap-1.5">
                      <MapPin size={14} className="text-brick-400" /> Transit Route
                    </label>
                    <div className="relative">
                      <select
                        title="Assign Route"
                        value={
                          (function () {
                            if (typeof busForm.route === 'object' && busForm.route !== null) {
                              return (busForm.route as { _id: string })._id;
                            }
                            return (busForm.route as string) || '';
                          })() as string
                        }
                        onChange={(e) => setBusForm((p) => ({ ...p, route: e.target.value }))}
                        className="w-full border border-white/10 rounded-4xl p-6 outline-none focus:border-brick-500/30 transition-all font-black appearance-none"
                        style={{ backgroundColor: '#111111', color: 'white', colorScheme: 'dark' }}
                      >
                        <option value="" style={{ backgroundColor: '#111111', color: '#9ca3af' }}>
                          -- Select Route --
                        </option>
                        {routes.map((r) => (
                          <option
                            key={r._id}
                            value={r._id}
                            style={{ backgroundColor: '#111111', color: 'white' }}
                          >
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <Navigation size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black uppercase text-white bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.1)] ml-2 inline-flex items-center gap-1.5">
                      <Navigation size={14} className="text-emerald-400" /> Select Driver
                    </label>
                    <div className="relative">
                      <select
                        title="Assign Driver"
                        value={busForm.driverId}
                        onChange={(e) => setBusForm((p) => ({ ...p, driverId: e.target.value }))}
                        className="w-full border border-white/10 rounded-4xl p-6 outline-none focus:border-brick-500/30 transition-all font-black appearance-none"
                        style={{ backgroundColor: '#111111', color: 'white', colorScheme: 'dark' }}
                      >
                        <option value="" style={{ backgroundColor: '#111111', color: '#9ca3af' }}>
                          -- Select Driver --
                        </option>
                        {drivers.map((d) => (
                          <option
                            key={d._id}
                            value={d._id}
                            style={{ backgroundColor: '#111111', color: 'white' }}
                          >
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <Plus size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 group">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2 group-focus-within:text-blue-400 transition-colors">
                    Bus Photo
                  </label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Image must be under 5 MB');
                        return;
                      }
                      setPhotoUploading(true);
                      try {
                        const url = await uploadToCloudinary(file);
                        setBusForm((p) => ({ ...p, photo: url }));
                        toast.success('Photo uploaded');
                      } catch (err) {
                        toast.error(getErrorMessage(err));
                      } finally {
                        setPhotoUploading(false);
                        if (photoInputRef.current) photoInputRef.current.value = '';
                      }
                    }}
                  />

                  {busForm.photo ? (
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/20">
                      <Image
                        src={busForm.photo}
                        alt="Bus preview"
                        width={600}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={photoUploading}
                          className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
                        >
                          {photoUploading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Upload size={16} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBusForm((p) => ({ ...p, photo: '' }))}
                          className="p-2.5 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={photoUploading}
                      className="w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-brick-500/30 hover:bg-white/[0.07] transition-all cursor-pointer group"
                    >
                      {photoUploading ? (
                        <>
                          <Loader2 size={28} className="text-brick-400 animate-spin" />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                            Uploading...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-brick-500/10 group-hover:border-brick-500/20 transition-all">
                            <ImageIcon
                              size={24}
                              className="text-gray-500 group-hover:text-brick-400 transition-colors"
                            />
                          </div>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-gray-400 transition-colors">
                            Click to upload bus photo
                          </span>
                          <span className="text-[9px] text-gray-600">PNG, JPG up to 5 MB</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="pt-6 flex gap-5">
                  <button
                    type="button"
                    onClick={() => setIsBusModalOpen(false)}
                    className="flex-1 py-6 rounded-[2.5rem] font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-[0.2em] border border-white/5"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-6 rounded-[2.5rem] font-black text-white bg-gradient-to-r from-brick-600 to-brick-500 hover:to-brick-400 transition-all shadow-3xl shadow-brick-500/20 flex justify-center items-center gap-4 text-xs uppercase tracking-[0.2em] border border-white/10 active:scale-95"
                  >
                    <Save size={18} />
                    {busModalType === 'add' ? 'Confirm Registration' : 'Commit Refactor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </Overlay>
        )}

        {isRouteModalOpen && (
          <Overlay onClose={() => setIsRouteModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.92, y: 48, opacity: 0, filter: 'blur(12px)' }}
              animate={{ scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.92, y: 24, opacity: 0, filter: 'blur(12px)' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="bg-gray-950/60 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] w-full max-w-4xl border border-white/8 relative overflow-hidden"
            >
              {/* Ambient gradient */}
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-48 bg-brick-500/8 blur-[80px] rounded-full" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-500/5 blur-[70px] rounded-full" />
              </div>

              {/* Inner scrollable area */}
              <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <HeaderModal
                  title={routeModalType === 'add' ? 'New Route' : 'Edit Route'}
                  subtitle="Configure stops, fleet assignments, and operating schedules."
                  onClose={() => setIsRouteModalOpen(false)}
                />

                <form onSubmit={handleRouteSave} className="p-8 md:p-10 space-y-10">
                  {/* ── Route Name ── */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brick-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">
                        Route Identity
                      </label>
                    </div>
                    <div className="relative">
                      <RouteIcon
                        className="absolute pl-2 text-white left-7 top-1/2 -translate-y-1/2 text-brick-400/60"
                        size={20}
                      />
                      <input
                        value={routeForm.name}
                        onChange={(e) => setRouteForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Campus Express — North Gate"
                        className="w-full bg-white/4 border border-white/8 rounded-2xl p-8 pl-16 pr-6 py-5 text-white text-base placeholder:text-gray-500 outline-none focus:border-brick-500/40 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(239,68,68,0.08)] transition-all duration-200 font-semibold"
                      />
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
                      Assignment
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* ── Stops & Fleet ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Waypoints */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center   gap-3 ">
                          <Navigation size={14} className="text-brick-400" />
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.25em]">
                            Waypoints
                          </p>
                        </div>
                        <span className="bg-brick-500/10 text-brick-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-brick-500/20">
                          {routeForm.stopages.length} Selected
                        </span>
                      </div>
                      <div className="bg-black/30 rounded-2xl border border-white/6 p-2 max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                        {stopages.length === 0 && (
                          <div className="py-8 text-center text-gray-500 text-xs font-semibold">
                            No stopages found
                          </div>
                        )}
                        {stopages.map((s) => {
                          const selected = routeForm.stopages.includes(s._id);
                          return (
                            <label
                              key={s._id}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                selected
                                  ? 'bg-brick-500/15 border-brick-500/30 text-white'
                                  : 'bg-transparent border-transparent text-gray-400 hover:bg-white/6 hover:text-gray-200 hover:border-white/8'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={selected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setRouteForm((p) => ({
                                    ...p,
                                    stopages: checked
                                      ? [...p.stopages, s._id]
                                      : p.stopages.filter((id) => id !== s._id),
                                  }));
                                }}
                              />
                              <div
                                className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                                  selected
                                    ? 'bg-brick-500 border-brick-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                    : 'border-gray-600'
                                }`}
                              >
                                {selected && (
                                  <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                                    <path
                                      d="M1 4L3.5 6.5L9 1"
                                      stroke="white"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm font-semibold leading-tight">{s.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Fleet */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BusIcon size={14} className="text-blue-400" />
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.25em]">
                            Active Fleet
                          </span>
                        </div>
                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                          {routeForm.bus.length} Assigned
                        </span>
                      </div>
                      <div className="bg-black/30 rounded-2xl border border-white/6 p-2 max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                        {buses.length === 0 && (
                          <div className="py-8 text-center text-gray-500 text-xs font-semibold">
                            No buses found
                          </div>
                        )}
                        {buses.map((b) => {
                          const selected = routeForm.bus.includes(b._id);
                          return (
                            <label
                              key={b._id}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                                selected
                                  ? 'bg-blue-500/15 border-blue-500/30 text-white'
                                  : 'bg-transparent border-transparent text-gray-400 hover:bg-white/6 hover:text-gray-200 hover:border-white/8'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={selected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setRouteForm((p) => ({
                                    ...p,
                                    bus: checked
                                      ? [...p.bus, b._id]
                                      : p.bus.filter((id) => id !== b._id),
                                  }));
                                }}
                              />
                              <div
                                className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                                  selected
                                    ? 'bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                                    : 'border-gray-600'
                                }`}
                              >
                                {selected && (
                                  <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                                    <path
                                      d="M1 4L3.5 6.5L9 1"
                                      stroke="white"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm font-semibold leading-tight">{b.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── Divider ── */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex items-center gap-3">
                      <Clock size={12} className="text-gray-600" />
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
                        Scheduling
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* ── Time Slots ── */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">
                        Chronological Control
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Morning Arrival */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            Morning Arrival
                          </span>
                        </div>
                        <AnimatePresence mode="popLayout">
                          {(routeForm.activeHoursComing?.length
                            ? routeForm.activeHoursComing
                            : ['']
                          ).map((h, i, arr) => (
                            <TimeSlotPicker
                              key={`coming-${i}`}
                              value={h}
                              accentColor="emerald"
                              isLast={i === arr.length - 1}
                              onChange={(v) => {
                                const newH = [...(routeForm.activeHoursComing || [''])];
                                newH[i] = v;
                                setRouteForm((p) => ({ ...p, activeHoursComing: newH }));
                              }}
                              onAdd={() =>
                                setRouteForm((p) => ({
                                  ...p,
                                  activeHoursComing: [...(p.activeHoursComing || ['']), ''],
                                }))
                              }
                              onRemove={() =>
                                setRouteForm((p) => ({
                                  ...p,
                                  activeHoursComing:
                                    arr.length === 1
                                      ? ['']
                                      : (p.activeHoursComing || []).filter((_, idx) => idx !== i),
                                }))
                              }
                            />
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Evening Return */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            Evening Return
                          </span>
                        </div>
                        <AnimatePresence mode="popLayout">
                          {(routeForm.activeHoursGoing?.length
                            ? routeForm.activeHoursGoing
                            : ['']
                          ).map((h, i, arr) => (
                            <TimeSlotPicker
                              key={`going-${i}`}
                              value={h}
                              accentColor="blue"
                              isLast={i === arr.length - 1}
                              onChange={(v) => {
                                const newH = [...(routeForm.activeHoursGoing || [''])];
                                newH[i] = v;
                                setRouteForm((p) => ({ ...p, activeHoursGoing: newH }));
                              }}
                              onAdd={() =>
                                setRouteForm((p) => ({
                                  ...p,
                                  activeHoursGoing: [...(p.activeHoursGoing || ['']), ''],
                                }))
                              }
                              onRemove={() =>
                                setRouteForm((p) => ({
                                  ...p,
                                  activeHoursGoing:
                                    arr.length === 1
                                      ? ['']
                                      : (p.activeHoursGoing || []).filter((_, idx) => idx !== i),
                                }))
                              }
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* ── Actions ── */}
                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsRouteModalOpen(false)}
                      className="flex-1 py-5 rounded-2xl font-black text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200 text-xs uppercase tracking-[0.2em] border border-white/[0.06]"
                    >
                      Discard
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-5 rounded-2xl font-black text-white bg-gradient-to-r from-brick-600 via-brick-500 to-brick-400 transition-all shadow-[0_8px_32px_rgba(239,68,68,0.25)] flex justify-center items-center gap-3 text-xs uppercase tracking-[0.2em] border border-white/10 active:scale-95"
                    >
                      <Save size={16} />
                      {routeModalType === 'add' ? 'Publish Route' : 'Save Changes'}
                    </motion.button>
                  </div>
                </form>
              </div>
              {/* end inner scrollable */}
            </motion.div>
          </Overlay>
        )}
        {isStopageModalOpen && (
          <Overlay onClose={() => setIsStopageModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.9, y: 20, opacity: 0, filter: 'blur(10px)' }}
              className="bg-gray-950/40 backdrop-blur-3xl rounded-2xl sm:rounded-[3rem] lg:rounded-[4rem] shadow-4xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar overflow-x-hidden mx-2 sm:mx-4"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brick-500/5 to-transparent opacity-50" />

              <HeaderModal
                title={stopageModalType === 'add' ? 'New Stopage' : 'Edit Stopage'}
                subtitle="Define a new transit point with precise GPS synchronization."
                onClose={() => setIsStopageModalOpen(false)}
              />

              <form onSubmit={handleStopageSave} className="p-4 sm:p-6 md:p-10 space-y-8">
                {/* Station Name */}
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2 flex items-center gap-2 group-focus-within:text-brick-400 transition-colors">
                    Station Identity
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/5 rounded-3xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <input
                      value={stopageForm.name}
                      onChange={(e) => setStopageForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. University Main Terminal"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 text-white text-base sm:text-lg placeholder:text-gray-700 outline-none focus:border-brick-500/30 focus:bg-white/[0.07] transition-all font-black"
                    />
                  </div>
                </div>

                {/* Location Picker — directly below Station Name */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brick-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      Geospatial Precision
                    </label>
                    {stopageForm.latitude !== '' && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          Position Locked
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative rounded-2xl sm:rounded-[2.5rem] border border-white/10 bg-black/20 p-2">
                    <LocationPickerInput
                      onLocationSelect={(lat, lng) => {
                        setStopageForm((p) => ({ ...p, latitude: lat, longitude: lng }));
                        toast.success(`Position Captured`);
                      }}
                      initialCoords={
                        stopageForm.latitude !== '' && stopageForm.longitude !== ''
                          ? {
                              lat: Number(stopageForm.latitude),
                              lng: Number(stopageForm.longitude),
                            }
                          : undefined
                      }
                      defaultValue={
                        stopageForm.latitude !== '' && stopageForm.longitude !== ''
                          ? `${Number(stopageForm.latitude).toFixed(5)}, ${Number(stopageForm.longitude).toFixed(5)}`
                          : ''
                      }
                    />
                  </div>

                  {/* Coordinate status */}
                  {stopageForm.latitude !== '' && stopageForm.longitude !== '' && (
                    <div className="p-4 sm:p-5 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 rounded-xl p-3">
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">
                            Latitude
                          </p>
                          <p className="text-sm font-bold text-white tabular-nums">
                            {Number(stopageForm.latitude).toFixed(6)}
                          </p>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3">
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">
                            Longitude
                          </p>
                          <p className="text-sm font-bold text-white tabular-nums">
                            {Number(stopageForm.longitude).toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex pt-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsStopageModalOpen(false)}
                    className="flex-1 py-5 rounded-2xl font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-[0.2em] border border-white/5"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-5 rounded-2xl font-black text-white bg-gradient-to-r from-brick-600 to-brick-500 hover:to-brick-400 transition-all shadow-3xl shadow-brick-500/20 flex justify-center items-center gap-4 text-xs uppercase tracking-[0.2em] border border-white/10 active:scale-95"
                  >
                    <Save size={18} />
                    {stopageModalType === 'add' ? 'Establish Point' : 'Commit Refactor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={`Delete ${deleteModal.type === 'stopage' ? 'Stopage' : deleteModal.type}`}
        itemName={deleteModal.name || ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        loading={deleteModal.loading}
      />
    </div>
  );
}
