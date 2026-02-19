'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface IntroContextType {
  isIntroActive: boolean;
  setIsIntroActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export const useIntro = () => {
  const context = useContext(IntroContext);
  if (context === undefined) {
    throw new Error('useIntro must be used within an IntroProvider');
  }
  return context;
};

const LoadingScreen = () => (
  <div className="fixed inset-0 z-100 bg-linear-to-br from-gray-900 via-gray-800 to-brick-900 flex flex-col items-center justify-center overflow-hidden">
    {/* Background Decorative Blobs */}
    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brick-600/20 rounded-full blur-[100px] animate-blob-1" />
    <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brick-900/40 rounded-full blur-[100px] animate-blob-2" />

    {/* Content Container */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 flex flex-col items-center space-y-10"
    >
      <div className="w-28 h-28 relative">
        <Image
          src="/static/logo.png"
          alt="BUTRACE Logo"
          fill
          className="object-contain animate-pulse"
          sizes="112px"
          priority
        />
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic uppercase animate-bounce-slow">
          BU<span className="text-brick-500">TRACE</span>
        </h1>
        <p className="text-gray-400 font-bold tracking-[0.3em] text-[10px] md:text-xs uppercase bg-white/5 py-2.5 px-6 rounded-full border border-white/10 backdrop-blur-md">
          Welcome to the next level
        </p>
      </div>

      <div className="h-1.5 w-48 md:w-64 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-2xl">
        <div className="h-full bg-brick-500 w-1/3 animate-loading-bar shadow-[0_0_20px_rgba(180,77,92,0.6)]"></div>
      </div>
    </motion.div>
  </div>
);

export const IntroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const introCompleted = sessionStorage.getItem('campusConnectIntroCompleted');

      const shouldShowIntro = introCompleted !== 'true';

      setIsIntroActive(shouldShowIntro);
      setIsLoadingSession(false);
    }
  }, []);

  if (isLoadingSession) {
    return <LoadingScreen />;
  }

  return (
    <IntroContext.Provider value={{ isIntroActive, setIsIntroActive }}>
      {children}
    </IntroContext.Provider>
  );
};
