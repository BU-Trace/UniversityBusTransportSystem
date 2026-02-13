import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CalendarEventService } from './calendarEvent.service';

const createCalendarEvent = catchAsync(async (req, res) => {
  const { ...eventData } = req.body;
  const user = req.user;
  const result = await CalendarEventService.createCalendarEvent({
    ...eventData,
    createdBy: user?.userId as string,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Calendar event created successfully',
    data: result,
  });
});

const getAllCalendarEvents = catchAsync(async (req, res) => {
  const result = await CalendarEventService.getAllCalendarEvents();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Calendar events fetched successfully',
    data: result,
  });
});

const updateCalendarEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CalendarEventService.updateCalendarEvent(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Calendar event updated successfully',
    data: result,
  });
});

const deleteCalendarEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CalendarEventService.deleteCalendarEvent(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Calendar event deleted successfully',
    data: result,
  });
});

export const CalendarEventController = {
  createCalendarEvent,
  getAllCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
};
