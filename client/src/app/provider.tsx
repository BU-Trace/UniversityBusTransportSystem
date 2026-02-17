'use client';

import { SessionProvider } from 'next-auth/react';
import UserProvider from '@/context/UserContext';
import { NotificationProvider } from '@/context/NotificationContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <UserProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </UserProvider>
    </SessionProvider>
  );
};

export default Providers;
