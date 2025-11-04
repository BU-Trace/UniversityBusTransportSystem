"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Image from "next/image";

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

const LoadingScreen: React.FC = () => (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 relative">
            <Image
                src="/static/logo.png"
                alt="Campus Connect Logo"
                fill
                className="object-contain animate-pulse"
                sizes="96px"
                priority
            />
        </div>
        <h1 className="text-4xl font-extrabold text-red-600 tracking-wider animate-bounce-slow">
            Campus Connect
        </h1>
        <p className="text-xl text-gray-700 mt-4 italic">
            "Welcome to the next level"
        </p>
        <div className="h-2 w-32 bg-red-200 rounded-full overflow-hidden mt-8">
            {}
            <div className="h-full bg-red-600 w-1/4 animate-loading-bar"></div>
        </div>
    </div>
);

export const IntroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const introCompleted = sessionStorage.getItem("campusConnectIntroCompleted");
      
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
