import { getIO } from '../../socket';
import AppError from '../../errors/appError';
import { StatusCodes } from 'http-status-codes';
import { INotification, INotificationPayload } from './notification.interface';

const recentNotifications: INotification[] = [];
const MAX_RECENT = 20;

export const broadcastNotification = (payload: INotificationPayload) => {
  if (!payload.message || !payload.message.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Notification message is required');
  }

  const notification: INotification = {
    title: (payload.title || 'Notification').trim(),
    message: payload.message.trim(),
    createdAt: new Date().toISOString(),
  };

  recentNotifications.unshift(notification);
  if (recentNotifications.length > MAX_RECENT) {
    recentNotifications.pop();
  }

  try {
    getIO().emit('notification', notification);
  } catch (error) {
    // If socket is not ready, just log and proceed with API response
    console.error('Socket emit failed:', error);
  }

  return notification;
};

export const getRecentNotifications = () => recentNotifications;
