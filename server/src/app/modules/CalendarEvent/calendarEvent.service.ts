import { ICalendarEvent } from './calendarEvent.interface';
import { CalendarEvent } from './calendarEvent.model';

const createCalendarEvent = async (payload: ICalendarEvent) => {
  const result = await CalendarEvent.create(payload);
  return result;
};

const getAllCalendarEvents = async () => {
  const result = await CalendarEvent.find().populate('createdBy');
  return result;
};

const updateCalendarEvent = async (id: string, payload: Partial<ICalendarEvent>) => {
  const result = await CalendarEvent.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteCalendarEvent = async (id: string) => {
  const result = await CalendarEvent.findByIdAndDelete(id);
  return result;
};

export const CalendarEventService = {
  createCalendarEvent,
  getAllCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
};
