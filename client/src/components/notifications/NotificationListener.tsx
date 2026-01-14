'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

type NotificationPayload = {
  title?: string;
  message?: string;
  createdAt?: string;
};

const resolveSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) return '';

  return apiBase.replace(/\/api\/v1\/?$/, '');
};

const NotificationListener = () => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const socketUrl = useMemo(resolveSocketUrl, []);

  useEffect(() => {
    if (!socketUrl) return;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('notification', (payload: NotificationPayload) => {
      const title = payload?.title || 'Notification';
      const description =
        payload?.message || 'You have a new update from the administrator.';

      toast.info(title, {
        description,
      });
    });

    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, [socketUrl]);

  return (
    <div aria-live="polite" className="sr-only">
      {connected ? 'Notifications connected' : 'Notifications disconnected'}
    </div>
  );
};

export default NotificationListener;
