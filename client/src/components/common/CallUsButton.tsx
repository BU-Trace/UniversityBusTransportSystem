'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaPhoneAlt } from 'react-icons/fa';
import React, { useState } from 'react';
import { useIntro } from '@/context/IntroContext';

const CallUsButton: React.FC = () => {
  const { isIntroActive } = useIntro();
  const [ripples, setRipples] = useState<{ id: number }[]>([]);

  if (isIntroActive) return null;

  const handleRipple = () => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
  };

  return (
    <AnimatePresence>
      {!isIntroActive && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="fixed bottom-8 right-8 z-[1000]"
        >
          {}
          <motion.div
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.4, 0.1, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-red-600/40 blur-3xl"
          />

          {}
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
            className="absolute inset-0 rounded-full blur-lg opacity-40 bg-gradient-to-r from-[#9b111e] via-[#b91c1c] to-[#9b111e]"
          />

          {}
          <motion.a
            href="tel:+8801977987420"
            onClick={handleRipple}
            whileHover={{
              scale: 1.1,
              rotate: [0, -2, 2, 0],
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: 'tween',
              duration: 0.4,
              ease: 'easeInOut',
            }}
            className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-[#9b111e] to-[#b91c1c] text-white hover:shadow-[#b91c1c]/60 overflow-hidden"
            aria-label="Call UBTS Support"
          >
            {}
            {ripples.map((r) => (
              <motion.span
                key={r.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-white/40"
              />
            ))}

            {}
            <motion.div
              animate={{
                y: [0, -2, 0, 2, 0],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
                type: 'tween',
              }}
              className="text-2xl relative z-10"
            >
              <FaPhoneAlt />
            </motion.div>

            {}
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
          </motion.a>

          {}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: -10 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute right-20 bottom-5 bg-white text-[#9b111e] font-semibold text-sm px-3 py-1 rounded-full shadow-md border border-[#b91c1c]/30 backdrop-blur-sm"
          >
            24/7 Surveillance
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallUsButton;
