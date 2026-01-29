'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Route, X } from 'lucide-react';
import { useRouter } from "next/navigation";

import { useIntro } from '@/context/IntroContext';

type BusStatus = 'Running' | 'Waiting' | 'Arrived';

interface BusInfo {
  routeId: string;
  departure: string;
  destination: string;
  departureTime: string;
  studentBus: BusStatus;
  teacherBus: BusStatus;
  staffBus: BusStatus;
}

const mockRoutes: BusInfo[] = [
  {
    routeId: 'Route-1',
    departure: 'University',
    destination: 'Barishal Club',
    departureTime: '8:30 AM',
    studentBus: 'Running',
    teacherBus: 'Waiting',
    staffBus: 'Arrived',
  },
  {
    routeId: 'Route-2',
    departure: 'University',
    destination: 'Nothullabad',
    departureTime: '9:00 AM',
    studentBus: 'Running',
    teacherBus: 'Running',
    staffBus: 'Waiting',
  },
  {
    routeId: 'Route-3',
    departure: 'University',
    destination: 'Natun Bazar',
    departureTime: '8:45 AM',
    studentBus: 'Waiting',
    teacherBus: 'Running',
    staffBus: 'Running',
  },
  {
    routeId: 'Route-4',
    departure: 'University',
    destination: 'Cantonment',
    departureTime: '8:00 AM (Sunday)',
    studentBus: 'Arrived',
    teacherBus: 'Waiting',
    staffBus: 'Running',
  },
  {
    routeId: 'Route-5',
    departure: 'University',
    destination: 'Ichladi Toll Plaza',
    departureTime: '8:00 AM',
    studentBus: 'Running',
    teacherBus: 'Arrived',
    staffBus: 'Running',
  },
  {
    routeId: 'Route-6',
    departure: 'University',
    destination: 'Jhalokathi Sadar',
    departureTime: '9:15 AM',
    studentBus: 'Waiting',
    teacherBus: 'Running',
    staffBus: 'Waiting',
  },
];

const getStatusColor = (status: BusStatus) => {
  switch (status) {
    case 'Running':
      return 'text-green-600 bg-green-100';
    case 'Waiting':
      return 'text-yellow-600 bg-yellow-100';
    case 'Arrived':
      return 'text-blue-600 bg-blue-100';
  }
};

const BusTrackerButton: React.FC = () => {
  const { isIntroActive } = useIntro();
  const [showTracker, setShowTracker] = useState(false);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const [routes, setRoutes] = useState(mockRoutes);
  const router = useRouter();


  useEffect(() => {
    const interval = setInterval(() => {
      setRoutes((prev) =>
        prev.map((r) => ({
          ...r,
          studentBus: ['Running', 'Waiting', 'Arrived'][Math.floor(Math.random() * 3)] as BusStatus,
          teacherBus: ['Running', 'Waiting', 'Arrived'][Math.floor(Math.random() * 3)] as BusStatus,
          staffBus: ['Running', 'Waiting', 'Arrived'][Math.floor(Math.random() * 3)] as BusStatus,
        }))
      );
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  if (isIntroActive) return null;

  const handleRipple = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
  };

  return (
    <AnimatePresence>
      {!isIntroActive && (
        <>
          {}
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="fixed bottom-28 right-8 z-1000"
          >
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-red-600/40 blur-3xl"
            />
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
              className="absolute inset-0 rounded-full blur-lg opacity-40 bg-linear-to-r from-[#9b111e] via-[#b91c1c] to-[#9b111e]"
            />

            <motion.button
              onClick={() => {
                handleRipple();
                setShowTracker(true);
              }}
              whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl bg-linear-to-br from-[#9b111e] to-[#b91c1c] text-white hover:shadow-[#b91c1c]/60 overflow-hidden"
              aria-label="Bus Tracker"
            >
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-white/40"
                />
              ))}

              <motion.div
                animate={{
                  y: [0, -2, 0, 2, 0],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="text-2xl relative z-10"
              >
                <Route />
              </motion.div>

              <div className="absolute inset-0 overflow-hidden rounded-full">
                <svg
                  className="absolute bottom-0 left-0 w-full h-full opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  viewBox="0 0 1200 120"
                >
                  <path
                    d="M321.39 56.44C186.45 35.59 79.15 66.6 0 93.68V0h1200v27.35c-110.46 41.42-241.55 73.24-378.61 54.09C643.06 62.7 456.33 77.29 321.39 56.44z"
                    fill="url(#waveGradient)"
                  />
                  <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="1200" y2="0">
                      <stop offset="0%" stopColor="#ffffff44" />
                      <stop offset="100%" stopColor="#ffffff00" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.button>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: -10 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-20 bottom-5 bg-white text-[#9b111e] font-semibold text-sm px-6 py-1 rounded-full shadow-md border border-[#b91c1c]/30 backdrop-blur-sm"
            >
              Live Bus Tracker
            </motion.span>
          </motion.div>

          {}
          <AnimatePresence>
            {showTracker && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-1100"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="relative max-w-6xl w-full mx-auto bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border-t-4 border-red-700"
                >
                  <h2 className="text-3xl font-extrabold text-center text-red-800 mb-8">
                    UBTS Live Bus Tracker
                  </h2>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
  {routes.map((bus, index) => (
    <motion.div
      key={index}
      onClick={() => {
  setShowTracker(false);                 // modal close
  router.push(`/track-bus?route=${bus.routeId}`); // route to map page
}}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{
        scale: 1.03,
        rotate: [0, 1.5, -1.5, 0],
      }}
      className="cursor-pointer bg-white/70 border border-red-200 shadow-lg rounded-2xl p-5 backdrop-blur-sm hover:shadow-red-300 transition"
    >
      {/* route ID show */}
      <h3 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-red-600" /> {bus.routeId}
      </h3>

      <p className="text-gray-700 text-sm mb-1">
        <span className="font-semibold">From:</span> {bus.departure}
      </p>
      <p className="text-gray-700 text-sm mb-1">
        <span className="font-semibold">To:</span> {bus.destination}
      </p>
      <p className="text-gray-700 text-sm mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-red-600" /> Departure: {bus.departureTime}
      </p>

      <div className="space-y-2">
        <div className={`text-sm px-3 py-1 rounded-full font-semibold inline-block ${getStatusColor(bus.studentBus)}`}>
          Student Bus: {bus.studentBus}
        </div>
        <br />
        <div className={`text-sm px-3 py-1 rounded-full font-semibold inline-block ${getStatusColor(bus.teacherBus)}`}>
          Teacher Bus: {bus.teacherBus}
        </div>
        <br />
        <div className={`text-sm px-3 py-1 rounded-full font-semibold inline-block ${getStatusColor(bus.staffBus)}`}>
          Staff Bus: {bus.staffBus}
        </div>
      </div>
    </motion.div>
  ))}
</div>


                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTracker(false)}
                    className="absolute top-4 right-6 text-red-600 font-bold text-lg hover:text-red-800"
                  >
                    <X />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default BusTrackerButton;
