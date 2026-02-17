'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdPublic,
  MdLocationOn,
  MdTravelExplore,
  MdAccessTime,
  MdMyLocation,
} from 'react-icons/md';
import { getCurrentLocation, LocationData } from '@/lib/lib-location';

const LocationDisplay: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await getCurrentLocation();
        if (data) {
          setLocation(data);
        } else {
          setError('Location unavailable');
        }
      } catch (err) {
        console.error('Location Error:', err);
        setError('Failed to detect location');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <MdTravelExplore className="text-brick-500 text-3xl" />
        </motion.div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
        <MdLocationOn className="text-gray-500 text-3xl mb-2" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          {error || 'Location Data Offline'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto py-8 px-6 bg-white/5 backdrop-blur-xl rounded-4xl border border-white/10 shadow-2xl overflow-hidden relative group"
    >
      {/* Background Decorative Element */}
      <div className="absolute -right-10 -bottom-10 text-white/5 opacity-5 pointer-events-none transform rotate-12 scale-[3]">
        <MdPublic />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left: Detailed Address (Occupies more space) */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-brick-500 mb-1">
            <MdLocationOn size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Exact Location Detected
            </span>
          </div>
          <h4 className="text-xl md:text-3xl font-black text-white italic tracking-tighter">
            {location.fullAddress ||
              [location.city, location.region, location.country].filter(Boolean).join(', ') ||
              'Location details unavailable'}
          </h4>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <MdMyLocation className="text-brick-400" size={14} />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                LAT: {location.lat.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MdMyLocation className="text-brick-400" size={14} />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                LON: {location.lon.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col md:flex-row xl:flex-col items-start md:items-center xl:items-end justify-between xl:justify-center gap-6">
          <div className="flex flex-col xl:items-end">
            <div className="flex items-center gap-2 text-brick-500 mb-1">
              <MdAccessTime size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Local Timezone
              </span>
            </div>
            <h4 className="text-lg font-black text-white tracking-tight">
              {location.timezone.replace('_', ' ') || 'Unknown'}
            </h4>
          </div>

          <div className="flex flex-col items-start md:items-center xl:items-end">
            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                {location.isIPBased ? 'IP Network Lock' : 'GPS Satellite Verified'}
              </span>
            </div>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">
              Live Signal Secured
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationDisplay;
