import { Types } from 'mongoose';

export interface INotification {
  _id?: string;
  notification_id?: string;
  title: string;
  message: string;
  category?: 'system' | 'alert' | 'reminder';
  recipient?: Types.ObjectId | null;
  targetRole?: 'superadmin' | 'admin' | 'student' | 'driver' | 'all';
  isRead?: boolean;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
