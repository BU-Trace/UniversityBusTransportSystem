'use client';

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { IUser, UserRole } from '@/type/User';

interface IUserProviderValues {
  user: IUser | null;
  isLoading: boolean;
  setUser: (user: IUser | null) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const UserContext = createContext<IUserProviderValues | undefined>(undefined);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const role = (session.user.role as UserRole | undefined) ?? 'student';
      setUser({
        id: session.user.id ?? '',
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        role,
        clientITInfo: {
          device: 'pc',
          browser: 'unknown',
          ipAddress: 'unknown',
          userAgent: '',
        },
        lastLogin: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });
    } else {
      setUser(null);
    }
  }, [session]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoading: status === 'loading' || manualLoading,
        setIsLoading: setManualLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (context == undefined) {
    throw new Error('useUser must be used within the UserProvider context');
  }
  return context;
};

export default UserProvider;
