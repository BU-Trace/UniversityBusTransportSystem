'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { toast } from 'sonner';
import { publicApi } from '@/lib/axios';

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notices, setNotices] = useState<NoticeEvent[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [lastClearedAt, setLastClearedAt] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedReadIds = localStorage.getItem('ubts_read_notice_ids');
    if (savedReadIds) setReadIds(JSON.parse(savedReadIds));

    const savedLastCleared = localStorage.getItem('ubts_notices_last_cleared');
    if (savedLastCleared) setLastClearedAt(parseInt(savedLastCleared, 10));
  }, []);

  const fetchInitialNotices = useCallback(async () => {
    try {
      // Fetch last 50 published notices using publicApi
      const response = await publicApi.get<ApiResponse<ServerNotice[]>>(
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
        }));
        setNotices(fetchedNotices);
      }
    } catch (err) {
      console.error('Initial fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchInitialNotices();

    // Hidden audio element for notification sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current = audio;

    const url = `${BASE_URL}/notice/stream`;
    let es: EventSource | null = null;

    const connect = () => {
      es = new EventSource(url);

      es.addEventListener('notice', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data) as NoticeEvent;

          setNotices((prev) => {
            if (prev.some((n) => n.id === data.id)) return prev;
            return [data, ...prev];
          });

          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(() => {
              console.log('Audio play blocked by browser policies until user interacts.');
            });
          }

          // Global Toast for instant visibility
          toast.success(`New Notice: ${data.title}`, {
            description:
              data.type === 'text' ? data.body?.slice(0, 100) : 'New PDF notice available.',
            duration: 8000,
          });
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      });

      es.onerror = () => {
        console.log('SSE Error, reconnecting...');
        es?.close();
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      es?.close();
    };
  }, [fetchInitialNotices]);

  // Derived state for the UI
  const processedNotices = useMemo(() => {
    return notices
      .map((n) => {
        const createdAtTime = n.createdAt ? new Date(n.createdAt).getTime() : 0;
        const isRead = readIds.includes(n.id) || createdAtTime <= lastClearedAt;
        return { ...n, isUnread: !isRead };
      })
      .filter((n) => n.isUnread); // Only show unread notifications
  }, [notices, readIds, lastClearedAt]);

  const unreadCount = useMemo(() => {
    return processedNotices.length; // Count is now just the length of filtered notices
  }, [processedNotices]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('ubts_read_notice_ids', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    const now = Date.now();
    setLastClearedAt(now);
    localStorage.setItem('ubts_notices_last_cleared', now.toString());
    setReadIds([]);
    localStorage.removeItem('ubts_read_notice_ids');
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notices: processedNotices, unreadCount, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
