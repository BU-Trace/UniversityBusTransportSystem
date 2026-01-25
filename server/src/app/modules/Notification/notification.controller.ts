import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import * as NotificationService from './notification.service';

export const addNotification = catchAsync(async (req, res) => {
  const notification = await NotificationService.createNotification(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Notification created successfully',
    data: notification,
  });
});

export const updateNotification = catchAsync(async (req, res) => {
  const notification = await NotificationService.updateNotification(req.params.id, req.body);

  if (!notification) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Notification not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification updated successfully',
    data: notification,
  });
});

export const deleteNotification = catchAsync(async (req, res) => {
  const notification = await NotificationService.deleteNotification(req.params.id);

  if (!notification) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Notification not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification deleted successfully',
    data: notification,
  });
});

export const getAllNotifications = catchAsync(async (_req, res) => {
  const notifications = await NotificationService.getAllNotifications();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: notifications,
  });
});

export const getNotification = catchAsync(async (req, res) => {
  const notification = await NotificationService.getNotification(req.params.id);

  if (!notification) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Notification not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification retrieved successfully',
    data: notification,
  });
});
