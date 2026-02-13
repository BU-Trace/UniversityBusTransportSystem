import { Types } from 'mongoose';

export type ICalendarEvent = {
  title: string;
  date: string;
  type: 'meeting' | 'task' | 'reminder';
  createdBy: Types.ObjectId | string;
};
