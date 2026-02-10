'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers } from 'react-icons/fa';
import React, { useState } from 'react';
import { useIntro } from '@/context/IntroContext';
import Image from 'next/image';

interface Developer {
  name: string;
  role: string;
  imageSrc: string;
  bio: string;
}

const DEVELOPERS: Developer[] = [
   {
    name: 'Md Imam Hosen',
    role: 'Team Lead & Full-Stack Developer',
    imageSrc: '/static/im1.png',
    bio: 'Full-stack developer, focused on Typescript, Nest.js and DevOps design systems.',
  },
  {
    name: 'Md Mahruf Alam',
    role: 'Backend Developer and Database Designer',
    imageSrc: '/static/mah.png',
    bio: 'Specializes in full-stack development, UI/UX and system architecture.',
  },
  {
    name: 'Imam Hossen',
    role: 'API Developer Deployment & Maintenance Engineer',
    imageSrc: '/static/im2.png',
    bio: 'Handles APIs, databases, versions and system security.',
  },
  {
    name: 'Abdus Sakur',
    role: 'Project Manager & Frontend Developer',
    imageSrc: '/static/pp.png',
    bio: 'Specilizes in Data Analysis and Analytics.',
  },
  {
    name: 'Sourav Debnath',
    role: 'UI/UX Designer & Backend Developer',
    imageSrc: '/static/sss.png',
    bio: 'UI/UX specialist, creates intuitive and modern interfaces for all platforms.',
  },
  {
    name: 'Utsojit Paticor',
    role: 'QA Engineer (Tester) & Documentation Lead',
    imageSrc: '/static/utso.png',
    bio: 'Ensures product quality, testing automation and smooth user experience.',
  },
];

const TeamButton: React.FC = () => {
  const { isIntroActive } = useIntro();
  const [showTeam, setShowTeam] = useState(false);
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
        <>
          {}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="fixed bottom-8 left-8 z-[1000]"
          >
            {}
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-red-600/40 blur-3xl"
            />

            {}
            <motion.div
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
              className="absolute inset-0 rounded-full blur-lg opacity-40 bg-gradient-to-r from-[#9b111e] via-[#b91c1c] to-[#9b111e]"
            />

            {}
            <motion.button
              onClick={() => {
                handleRipple();
                setShowTeam(true);
              }}
              whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
              className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-[#9b111e] to-[#b91c1c] text-white hover:shadow-[#b91c1c]/60 overflow-hidden"
              aria-label="Team HEXAGON"
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
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="text-2xl relative z-10"
              >
                <FaUsers />
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
            </motion.button>

            {}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: -10 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-20 bottom-5 bg-white text-[#9b111e] font-semibold text-sm px-3 py-1 rounded-full shadow-md border border-[#b91c1c]/30 backdrop-blur-sm"
            >
              Meet HEXAGON
            </motion.span>
          </motion.div>

          {}
          <AnimatePresence>
            {showTeam && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1100]"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="relative max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border-t-4 border-red-700"
                >
                  <h2 className="text-3xl font-extrabold text-center text-red-800 mb-8">
                    Meet the Team — HEXAGON
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {DEVELOPERS.map((dev, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{
                          scale: 1.03,
                          rotate: [0, 1.5, -1.5, 0],
                        }}
                        className="bg-gradient-to-br from-red-50 to-white/70 border border-red-200 shadow-lg rounded-2xl p-5 backdrop-blur-sm"
                      >
                        <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-4 border-red-500 shadow-md">
                          <Image src={dev.imageSrc} alt={dev.name} fill className="object-cover" />
                        </div>
                        <h3 className="text-lg font-bold text-red-700 text-center">{dev.name}</h3>
                        <p className="text-sm text-gray-600 text-center mb-3">{dev.role}</p>
                        <p className="text-gray-500 text-center text-sm mb-4">{dev.bio}</p>

                        <div className="flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 rounded-full shadow-md hover:shadow-red-300"
                          >
                            Learn More
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTeam(false)}
                    className="absolute top-4 right-6 text-red-600 font-bold text-lg hover:text-red-800"
                  >
                    ✕
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

export default TeamButton;
