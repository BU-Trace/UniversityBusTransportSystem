'use client';

import Navbar from '@/components/shared/Navbar';
import { IntroProvider } from '@/context/IntroContext';
import React from 'react';

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <IntroProvider>
      {}
      <Navbar />
      <main className="min-h-screen">{children}</main>
      {/*<Footer />*/}
    </IntroProvider>
  );
};

export default CommonLayout;
