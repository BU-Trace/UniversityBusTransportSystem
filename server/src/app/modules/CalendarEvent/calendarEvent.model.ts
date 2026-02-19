import { Schema, model } from 'mongoose';
import { ICalendarEvent } from './calendarEvent.interface';

const calendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    type: {
      type: String,
      enum: ['meeting', 'task', 'reminder'],
      default: 'task',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export const CalendarEvent = model<ICalendarEvent>('CalendarEvent', calendarEventSchema);
