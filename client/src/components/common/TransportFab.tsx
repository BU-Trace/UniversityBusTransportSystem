'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, MapPin, X, AlertCircle } from 'lucide-react';
import { useIntro } from '@/context/IntroContext';
import BusTrackerView from '../transport/BusTrackerView';
import NearestStopsView from '../transport/NearestStopsView';
import ReportIssueView from '../transport/ReportIssueView';

const TransportFab: React.FC = () => {
  const { isIntroActive } = useIntro();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracker' | 'stops' | 'report'>('tracker');
  const [ripples, setRipples] = useState<{ id: number }[]>([]);

  if (isIntroActive) return null;

  const handleRipple = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
  };

  const toggleOpen = () => {
    handleRipple();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <AnimatePresence>
        {!isIntroActive && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="fixed bottom-24 right-8 z-1000"
          >
            {/* FAB Glow Effect */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-red-600 blur-xl"
            />

            <motion.button
              onClick={toggleOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-2xl bg-linear-to-br from-brick-600 to-[#b91c1c] text-white overflow-hidden border-2 border-white/20"
              aria-label="Transport Tools"
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

              <Bus size={24} />
            </motion.button>

            <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none group-hover:opacity-100">
              Transport Tools
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1100 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              className="bg-gray-900/90 backdrop-blur-2xl w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brick-600/20 rounded-xl text-brick-400 border border-brick-500/20">
                    <Bus size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight uppercase tracking-tight">
                      Transport Hub
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Live tracking & stops info
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-brick-400 hover:bg-white/5 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-2 sm:px-6 pt-4 shrink-0">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setActiveTab('tracker')}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all ${
                      activeTab === 'tracker'
                        ? 'bg-brick-600 text-white shadow-lg shadow-brick-900/40'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Bus size={14} className="sm:w-4 sm:h-4" /> <span>Live Bus Tracker</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('stops')}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                      activeTab === 'stops'
                        ? 'bg-brick-600 text-white shadow-lg shadow-brick-900/40'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <MapPin size={14} className="sm:w-3.5 sm:h-3.5" /> <span>Nearest Stops</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                      activeTab === 'report'
                        ? 'bg-brick-600 text-white shadow-lg shadow-brick-900/40'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <AlertCircle size={14} className="sm:w-3.5 sm:h-3.5" />{' '}
                    <span>Report Issue</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto relative min-h-0 custom-scrollbar p-6 pt-2">
                <AnimatePresence mode="wait">
                  {activeTab === 'tracker' && (
                    <motion.div
                      key="tracker"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <BusTrackerView onClose={() => setIsOpen(false)} />
                    </motion.div>
                  )}
                  {activeTab === 'stops' && (
                    <motion.div
                      key="stops"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <NearestStopsView />
                    </motion.div>
                  )}
                  {activeTab === 'report' && (
                    <motion.div
                      key="report"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <ReportIssueView />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TransportFab;
