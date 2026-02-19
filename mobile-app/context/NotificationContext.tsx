import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../lib/axios';

export type NoticeType = 'text' | 'pdf';

export interface NoticeEvent {
  id: string;
  title: string;
  type: NoticeType;
  body?: string;
  fileUrl?: string;
  createdAt?: string;
  priority?: 'low' | 'medium' | 'high';
  isUnread?: boolean;
}

interface ServerNotice {
  _id?: string;
  id?: string;
  title: string;
  type: NoticeType;
  body?: string;
  fileUrl?: string;
  createdAt?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface NotificationContextType {
  notices: NoticeEvent[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notices, setNotices] = useState<NoticeEvent[]>([]);

  const fetchInitialNotices = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<ServerNotice[]>>(
        '/notice/get-all-notices?limit=50&status=published'
      );
      if (response.data?.success) {
        const fetchedNotices: NoticeEvent[] = response.data.data.map((n: ServerNotice) => ({
          id: String(n._id || n.id),
          title: n.title,
          type: n.type,
          body: n.body,
          fileUrl: n.fileUrl,
          createdAt: n.createdAt,
          priority: n.priority,
          isUnread: true, // For simplicity on mobile, or sync with local storage later
        }));
        setNotices(fetchedNotices);
      }
    } catch (err) {
      console.error('Initial fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchInitialNotices();
    // In a real-world scenario, we'd add SSE polyfill/Socket listener here
  }, [fetchInitialNotices]);

  const markAsRead = useCallback((id: string) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n)));
  }, []);

  const clearAll = useCallback(() => {
    setNotices((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  }, []);

  const value = useMemo(
    () => ({
      notices,
      unreadCount: notices.filter((n) => n.isUnread).length,
      markAsRead,
      clearAll,
      refresh: fetchInitialNotices,
    }),
    [notices, markAsRead, clearAll, fetchInitialNotices]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
