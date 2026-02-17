'use client';

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useSession } from 'next-auth/react';
import { IUser, UserRole } from '@/type/User';
import { getMe } from '@/services/auth-client';

interface IUserProviderValues {
  user: IUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const UserContext = createContext<IUserProviderValues | undefined>(undefined);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [manualLoading, setManualLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    if (session?.accessToken) {
      setManualLoading(true);
      try {
        const res = await getMe(session.accessToken as string);
        if (res.success && res.data) {
          setUser(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Fallback to session data if direct fetch fails
        if (session.user) {
          setUser({
            id: session.user.id ?? '',
            email: session.user.email ?? '',
            name: session.user.name ?? '',
            role: session.user.role as UserRole,
            profileImage:
              session.user.image || session.user.photoUrl || session.user.profileImage || null,
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
        }
      } finally {
        setManualLoading(false);
      }
    } else if (status !== 'loading') {
      setUser(null);
    }
  }, [session, status]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        refreshUser: fetchUser,
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
