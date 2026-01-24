import { z } from 'zod';
import { Notification } from './notification.model';
import { INotification } from './notification.interface';

const notificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  category: z.enum(['system', 'alert', 'reminder']).optional(),
  recipient: z.any().nullable().optional(),
  targetRole: z.enum(['superadmin', 'admin', 'student', 'driver', 'all']).optional(),
  isRead: z.boolean().optional(),
  sentAt: z.coerce.date().optional(),
});

const updateSchema = notificationSchema.partial();

const generateNextNotificationId = async (): Promise<string> => {
  const latest = await Notification.findOne({}, {}, { sort: { notification_id: -1 } });
  let nextId = 1;

  if (latest?.notification_id) {
    const match = latest.notification_id.match(/notif_(\d+)/);
    if (match) nextId = parseInt(match[1], 10) + 1;
  }

  return `notif_${nextId}`;
};

export const createNotification = async (payload: INotification) => {
  const data = notificationSchema.parse(payload);
  const notification_id = await generateNextNotificationId();

  const notification = await Notification.create({ ...data, notification_id });
  return notification;
};

export const updateNotification = async (id: string, payload: Partial<INotification>) => {
  if (Object.keys(payload).length) {
    updateSchema.parse(payload);
  }

  const notification = await Notification.findByIdAndUpdate(id, payload, { new: true });
  return notification;
};

export const deleteNotification = async (id: string) => {
  return await Notification.findByIdAndDelete(id);
};

export const getAllNotifications = async () => {
  return await Notification.find().sort({ createdAt: -1 });
};

export const getNotification = async (id: string) => {
  return await Notification.findById(id);
};
