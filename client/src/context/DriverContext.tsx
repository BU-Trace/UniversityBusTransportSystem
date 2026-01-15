'use client';

import React, { createContext, useContext, useState } from 'react';

type DriverStatus = {
  name: string;
  route: string;
  active: boolean;
};

type DriverContextType = {
  driver: DriverStatus | null;
  setDriver: (data: DriverStatus) => void;
};

const DriverContext = createContext<DriverContextType | null>(null);

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const [driver, setDriver] = useState<DriverStatus | null>(null);

  return (
    <DriverContext.Provider value={{ driver, setDriver }}>
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error('useDriver must be used inside DriverProvider');
  return ctx;
}
