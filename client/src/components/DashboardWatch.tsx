'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAccessTime, MdCalendarToday, MdPublic, MdDirectionsBus } from 'react-icons/md';

/**
 * Seconds Flip Card Component
 * Creates a "paper-flip" effect for each second change
 */
const FlipCard = ({ value }: { value: string }) => {
  return (
    <div className="relative w-10 h-16 lg:w-24 lg:h-36 bg-[#0a0f25] rounded-lg lg:rounded-4xl border border-white/10 overflow-hidden shadow-2xl">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-xl lg:text-7xl font-black text-brick-400 tracking-tighter">
            {value}
          </span>
        </motion.div>
      </AnimatePresence>
      {/* Middle Divider Line for Flip Effect */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 z-10" />
    </div>
  );
};

/**
 * Rotating Minute/Hour Component
 * Rotates like a physical watch gear
 */
const RotatingDigit = ({ value, label }: { value: string | number; label?: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 lg:w-40 lg:h-40 flex items-center justify-center">
        {/* Gear/Radial pattern background */}
        <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="text-2xl lg:text-8xl font-black text-white tracking-tighter z-10"
          >
            {value}
          </motion.div>
        </AnimatePresence>
      </div>
      {label && (
        <span className="mt-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          {label}
        </span>
      )}
    </div>
  );
};

interface UserSession {
  id: string;
  name: string;
  role: string;
  profileImage?: string;
  assignedBusName?: string;
}

const DashboardWatch = ({ activeSessions = [] }: { activeSessions?: UserSession[] }) => {
  const [time, setTime] = useState(new Date());
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeDrivers = React.useMemo(() => {
    return activeSessions.filter((user) => user.role === 'driver');
  }, [activeSessions]);

  const { hours, minutes, seconds, ampm, day, dateStr } = React.useMemo(() => {
    const hRaw = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const ampm = hRaw >= 12 ? 'PM' : 'AM';
    const h = hRaw % 12 || 12;

    return {
      hours: h < 10 ? `0${h}` : h,
      minutes: m < 10 ? `0${m}` : m,
      seconds: s < 10 ? `0${s}` : `${s}`,
      ampm,
      day: time.toLocaleDateString('en-US', { weekday: 'long' }),
      dateStr: time.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  }, [time]);

  // Handle Initials for Avatar Fallback
  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || '??'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-12"
    >
      <div className="relative w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 lg:p-12 shadow-[0_0_100px_rgba(0,0,0,0.4)] overflow-hidden group">
        {/* Dynamic Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brick-500/10 rounded-full blur-[120px] -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brick-900/20 rounded-full blur-[120px] translate-y-1/2" />

        <div className="relative z-10 flex flex-col 2xl:flex-row items-center justify-between gap-10">
          {/* Left Section: Context & Interactive Info */}
          <div className="flex flex-col items-center 2xl:items-start text-center 2xl:text-left shrink-0">
            <div className="flex items-center gap-3 mb-6 bg-white/5 py-2 px-4 rounded-full border border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-brick-500 animate-ping" />
              <span className="text-[11px] font-black text-brick-400 uppercase tracking-[0.3em]">
                System Synchronized
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight mb-2 italic">
              {day}
            </h2>
            <div className="flex items-center justify-center 2xl:justify-start gap-3 text-gray-400 font-bold uppercase tracking-widest text-xs lg:text-sm">
              <MdCalendarToday className="text-brick-500" />
              {dateStr}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                <AnimatePresence mode="popLayout">
                  {activeDrivers.slice(0, 4).map((user, idx) => (
                    <motion.div
                      key={user.id || idx}
                      initial={{ scale: 0, x: -10 }}
                      animate={{ scale: 1, x: 0 }}
                      exit={{ scale: 0, x: 10 }}
                      onMouseEnter={() => setHoveredUser(user.id)}
                      onMouseLeave={() => setHoveredUser(null)}
                      className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-2xl border-2 border-[#0a0f25] bg-gray-800 flex items-center justify-center text-xs font-black shadow-lg cursor-pointer transition-transform hover:scale-110 hover:z-20 group/avatar"
                    >
                      {user.profileImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-[0.9rem]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        getInitials(user.name)
                      )}

                      {/* Premium Tooltip */}
                      <AnimatePresence>
                        {hoveredUser === user.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-3 bg-[#0a0f25] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-100 min-w-[180px]"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Active Now
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white whitespace-nowrap">
                              {user.name}
                            </p>
                            <div className="flex flex-col gap-0.5 mt-1 border-t border-white/5 pt-1.5">
                              <p className="text-[9px] font-black text-brick-500 uppercase tracking-[0.2em]">
                                On-Duty Driver
                              </p>
                              {user.assignedBusName && (
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                  <MdDirectionsBus size={10} className="text-brick-400" />
                                  Bus: {user.assignedBusName}
                                </p>
                              )}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0a0f25] border-r border-b border-white/10 rotate-45 -mt-1.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {activeDrivers.length > 4 && (
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl border-2 border-[#0a0f25] bg-brick-600 flex items-center justify-center text-xs font-black shadow-lg">
                    +{activeDrivers.length - 4}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Active Drivers Online
                </p>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                  {activeDrivers.length} {activeDrivers.length === 1 ? 'Driver' : 'Drivers'} Live
                </p>
              </div>
            </div>
          </div>

          {/* Center Section: The Full-Width Bold Time Display */}
          <div className="flex flex-row items-center gap-2 lg:gap-8">
            {/* Hours - Rotating Wrap */}
            <RotatingDigit value={hours} label="Hours" />

            {/* Separator */}
            <div className="flex flex-col gap-2 lg:gap-4">
              <div className="w-1.5 h-1.5 lg:w-3 lg:h-3 rounded-full bg-brick-500 shadow-[0_0_15px_#ef4444]" />
              <div className="w-1.5 h-1.5 lg:w-3 lg:h-3 rounded-full bg-brick-500/20" />
              <div className="w-1.5 h-1.5 lg:w-3 lg:h-3 rounded-full bg-brick-500 shadow-[0_0_15px_#ef4444]" />
            </div>

            {/* Minutes - Rotating Wrap */}
            <RotatingDigit value={minutes} label="Minutes" />

            {/* Seconds - Flip Card */}
            <div className="flex flex-col items-center">
              <div className="flex gap-2">
                <FlipCard value={seconds.length === 1 ? '0' : seconds[0]} />
                <FlipCard value={seconds.length === 1 ? seconds[0] : seconds[1]} />
              </div>
              <span className="mt-4 lg:mt-6 text-[8px] lg:text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                <MdPublic size={14} className="animate-spin-slow" />
                {ampm}
              </span>
            </div>
          </div>

          {/* Right Section: Decorative Stats */}
          <div className="hidden 2xl:flex flex-col items-end gap-3 pl-4 border-l border-white/10   shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Timezone
              </p>
              <p className="text-sm font-bold text-white uppercase italic whitespace-nowrap">
                GMT +6:00 (BST)
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Status
              </p>
              <p className="text-sm font-bold text-emerald-500 uppercase flex items-center gap-2 justify-end whitespace-nowrap">
                Peak Performance{' '}
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </p>
            </div>
          </div>
        </div>

        {/* Backdrop Decorative Icon */}
        <div className="absolute -bottom-10 -right-10 text-white/5 opacity-5 pointer-events-none transform rotate-12 scale-[3]">
          <MdAccessTime />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardWatch;
