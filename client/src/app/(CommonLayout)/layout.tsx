"use client"; // REQUIRED

import Navbar from '@/components/shared/Navbar';
import { IntroProvider } from '@/context/IntroContext';
import React from 'react'; // REQUIRED for ReactNode

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // 🚨 SOLUTION: Provider wraps ALL content 🚨
    <IntroProvider> 
        {/* Navbar and Main content are now inside the Provider */}
        <Navbar />
        <main className="min-h-screen">
            {children}
        </main>
        {/*<Footer />*/}
    </IntroProvider>
  );
};

export default CommonLayout;
