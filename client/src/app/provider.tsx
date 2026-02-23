'use client';

import { SessionProvider } from 'next-auth/react';
import UserProvider from '@/context/UserContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { BusAlertProvider } from '@/context/BusAlertContext';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <UserProvider>
        <NotificationProvider>
          <BusAlertProvider>{children}</BusAlertProvider>
        </NotificationProvider>
      </UserProvider>
    </SessionProvider>
  );
};

export default Providers;
