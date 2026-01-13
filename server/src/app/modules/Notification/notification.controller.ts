import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as NotificationService from './notification.service';

export const broadcastToAll = catchAsync(async (req, res) => {
  const notification = NotificationService.broadcastNotification(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification broadcasted successfully',
    data: notification,
  });
});

export const getRecent = catchAsync(async (_req, res) => {
  const notifications = NotificationService.getRecentNotifications();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Recent notifications retrieved',
    data: notifications,
  });
});
